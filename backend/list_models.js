import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Placeholder, we just need the client
        // Actually the SDK doesn't have a direct listModels on the client instance easily exposed in all versions, 
        // but we can try to use the model independent check if available, or just try a standard one.
        // Wait, the error message literally says: "Call ListModels to see the list of available models"

        // In the Node SDK, it's often under the GoogleAIFileManager or similar, OR we can just hit the REST API to be sure.
        // Let's use a simple fetch to the API endpoint to list models, bypassing the SDK slightly to be sure, or use the SDK's generally available method if I recall it correctly.
        // Actually, simpler: The SDK *does* allow listing models if we use the right manager? 
        // Let's use the REST API via fetch for absolute certainty.

        const API_KEY = "AIzaSyAFQt5pp1YrFe0VU6TtW0_vPd6gQJTg7KE";
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        console.log("AVAILABLE MODELS:");
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
