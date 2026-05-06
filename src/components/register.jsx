import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
    const [step, setStep] = useState(1); // 1 = Details, 2 = OTP
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        if (!form.name || !form.email || !form.password) {
            alert("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001" : "");
            const res = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                alert("OTP sent to your email!");
                setStep(2);
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Register Error:", error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            alert("Please enter the OTP");
            return;
        }

        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001" : "");
            const res = await fetch(`${API_URL}/register-verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email, otp }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Account created and verified successfully!");
                localStorage.setItem("token", data.token); // Auto login
                window.location.href = "/home"; // Force reload to ensure state resets
            } else {
                alert(data.message || "OTP Verification failed");
            }
        } catch (error) {
            console.error("Verify OTP Error:", error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {step === 1 ? "Register" : "Verify Email"}
                </h2>

                {step === 1 ? (
                    <>
                        <input
                            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />

                        <input
                            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />

                        <input
                            className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Password"
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />

                        <button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className={`w-full text-white p-3 rounded-lg font-semibold transition ${
                                loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            {loading ? "Sending..." : "Signup"}
                        </button>

                        <p className="mt-4 text-center text-sm text-gray-600">
                            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-gray-600 mb-4 text-center">
                            We've sent an OTP to <strong>{form.email}</strong>
                        </p>
                        
                        <input
                            className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-lg"
                            placeholder="Enter 6-digit OTP"
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />

                        <button
                            onClick={handleVerifyOtp}
                            disabled={loading}
                            className={`w-full text-white p-3 rounded-lg font-semibold transition ${
                                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {loading ? "Verifying..." : "Verify & Login"}
                        </button>
                        
                        <button
                            onClick={() => setStep(1)}
                            className="w-full mt-3 text-gray-500 p-2 text-sm hover:underline"
                        >
                            Back
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default Register;
