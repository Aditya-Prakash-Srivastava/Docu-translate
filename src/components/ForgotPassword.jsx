import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async () => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
            const res = await fetch(`${API_URL}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                alert("OTP sent to your email!");
                setStep(2);
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Error sending OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
            const res = await fetch(`${API_URL}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            if (res.ok) {
                alert("OTP Verified!");
                setStep(3);
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            alert("Error verifying OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
            const res = await fetch(`${API_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });
            if (res.ok) {
                alert("Password reset successful! Please login.");
                navigate("/login");
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            alert("Error resetting password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {step === 1 ? "Forgot Password" : step === 2 ? "Verify OTP" : "Reset Password"}
                </h2>

                {step === 1 && (
                    <>
                        <input
                            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            onClick={handleSendOTP}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <p className="text-sm text-gray-600 mb-4 text-center">OTP sent to {email}</p>
                        <input
                            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter 6-digit OTP"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button
                            onClick={handleVerifyOTP}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </>
                )}

                {step === 3 && (
                    <>
                        <input
                            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-green-300"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </>
                )}

                <div className="mt-4 text-center text-sm">
                    <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
