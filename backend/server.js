import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import multer from "multer";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "./models/user.js";
import authMiddleware from "./middleware/authmiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

// 🔹 Connect to MongoDB
// Use a default local URI if not in env, or expect it in env.
// Given previous context, user tried process.env.MONGO_URI.
// I will provide a fallback for local dev if missing, or user needs to set it.
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pomsa_translator";

mongoose.connect(MONGO_URI)
  .then(() => logEvent("✅ MongoDB Connected"))
  .catch(err => logEvent(`❌ MongoDB Connection Error: ${err.message}`));

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// 🔹 Logging Setup
const LOG_FILE = path.join(__dirname, "server.log");

const logEvent = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFile(LOG_FILE, logMessage, (err) => {
    if (err) console.error("Failed to write to log file:", err);
  });
};

// 🔹 Middleware Rules
app.use(cors({ origin: "*" }));
app.use(express.json());

// Log every request
app.use((req, res, next) => {
  logEvent(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

logEvent(`API KEY loaded: ${process.env.GEMINI_API_KEY ? "Yes" : "No"}`);

// ✅ Test route
app.get("/", (req, res) => {
  logEvent("Health check endpoint hit");
  res.send("Backend working");
});

// ✅ REGISTER ROUTE
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    logEvent(`New user registered: ${email}`);
    res.json({ message: "User registered successfully" });
  } catch (error) {
    logEvent(`Register Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// ✅ LOGIN ROUTE
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Use a default secret if not provided
    const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key_change_me";

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    logEvent(`User logged in: ${email}`);
    res.json({ token });
  } catch (error) {
    logEvent(`Login Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

import nodemailer from "nodemailer";

// ... (previous imports and setup)

// ✅ NODEMAILER CONFIG
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ FORGOT PASSWORD - Send OTP
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP - POMSA",
      text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    logEvent(`OTP sent to ${email}`);
    res.json({ message: "OTP sent to email" });
  } catch (error) {
    logEvent(`Forgot Password Error: ${error.message}`);
    res.status(500).json({ message: "Error sending email" });
  }
});

// ✅ VERIFY OTP
app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp, otpExpire: { $gt: Date.now() } });

    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

    res.json({ message: "OTP verified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ RESET PASSWORD
app.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, otp, otpExpire: { $gt: Date.now() } });

    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    logEvent(`Password reset successful for ${email}`);
    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ TRANSLATE ROUTE (Protected)
app.post("/translate", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { type, targetLanguage } = req.body;
    const file = req.file;

    // Log what we received
    logEvent(`Processing request: Type=${type}, Language=${targetLanguage || "English"} User=${req.user.id}`);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    let prompt = "";
    const lang = targetLanguage || "English";

    if (type === "translate") {
      prompt = `EXTRACT all text from the provided image/document and TRANSLATE it into ${lang}. Return ONLY the translated text. Maintain the original formatting (paragraphs, lists) as much as possible.\n\n`;
    } else {
      prompt = `EXTRACT all text from the provided image/document, TRANSLATE it into ${lang}, and then provide a concise summary in ${lang} at the end using bullets and stickers.\n\n`;
    }

    let contentParts = [];

    // If file is provided, send it as inline data
    if (file) {
      if (file.mimetype.startsWith("text/")) {
        const textContent = file.buffer.toString("utf-8");
        contentParts = [
          { text: prompt },
          { text: textContent }
        ];
      } else {
        // PDF or Image
        const base64Data = file.buffer.toString("base64");
        contentParts = [
          { text: prompt },
          {
            inlineData: {
              mimeType: file.mimetype,
              data: base64Data
            }
          }
        ];
      }
    } else {
      const { text } = req.body;
      contentParts = [
        { text: prompt },
        { text: text || "" }
      ];
    }

    const result = await model.generateContent(contentParts);
    const response = await result.response;
    const outputText = response.text();

    logEvent("Translation successful");
    res.json({ output: outputText });

  } catch (error) {
    logEvent(`FULL ERROR: ${error.message}`);
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(5001, () => {
  logEvent("Server running on port 5001");
});
