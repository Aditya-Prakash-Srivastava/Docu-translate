import React, { useState } from "react";
import FileUpload from "./FileUpload";

const LANGUAGES = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Hindi",
    "Japanese",
    "Russian",
    "Portuguese",
    "Italian",
    "Arabic",
];

function Translator() {
    const [loading, setLoading] = useState(false);
    const [resultText, setResultText] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    const [file, setFile] = useState(null);
    const [targetLanguage, setTargetLanguage] = useState("English");

    // 🔹 Connectivity Check
    React.useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001" : "");
        fetch(`${API_URL}/`)
            .then((res) => res.text())
            .then((data) => console.log("✅ Backend connected:", data))
            .catch((err) => console.error("❌ Backend connection failed:", err));
    }, []);

    // 🔹 Translate only
    const handleTranslate = async () => {
        if (!file) return;

        setLoading(true);
        setResultText("");
        setShowPreview(false);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "translate");
            formData.append("targetLanguage", targetLanguage);

            // Get token from localStorage
            const token = localStorage.getItem("token");

            const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001" : "");
            const response = await fetch(`${API_URL}/translate`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}` // Add token header
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Translation failed");
            }
            setResultText(data.output);
        } catch (err) {
            console.error(err);
            setResultText(`❌ Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Translate + Summarize
    const handleTranslateAndSummarize = async () => {
        if (!file) return;

        setLoading(true);
        setResultText("");
        setShowPreview(false);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "summary");
            formData.append("targetLanguage", targetLanguage);

            const token = localStorage.getItem("token");

            const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001" : "");
            const response = await fetch(`${API_URL}/translate`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Processing failed");
            }
            setResultText(data.output);
        } catch (err) {
            console.error(err);
            setResultText(`❌ Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!file) return;

        if (file.type === "application/pdf") {
            const blob = new Blob([resultText], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "translated_result.txt";
            a.click();
            URL.revokeObjectURL(url);
        } else {
            const blob = new Blob([resultText], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "translated.txt";
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    return (
        <div className="h-screen w-full bg-linear-to-tr from-blue-50 to-purple-100 flex flex-col">
            {/* Navbar */}
            <nav className="flex justify-between items-center px-10 py-4 bg-white shadow-sm">
                <h1 className="text-xl font-bold text-blue-600">POMSA</h1>

                <ul className="flex gap-6 font-medium items-center">
                    <li><span className="text-gray-600 cursor-pointer hover:text-orange-500">Home</span></li>
                    <li><span className="text-gray-600 cursor-pointer hover:text-orange-500">Contact Us</span></li>
                    <li><span className="text-gray-600 cursor-pointer hover:text-orange-500">Help</span></li>
                    <li>
                        <button onClick={handleLogout} className="text-red-500 font-semibold hover:underline">
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl max-w-2xl w-full">
                        <h2 className="text-xl font-bold mb-4">Preview</h2>

                        <pre className="text-sm text-gray-800 whitespace-pre-wrap max-h-96 overflow-y-auto">
                            {resultText}
                        </pre>

                        <div className="mt-4 text-right">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Section */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 sm:p-10 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
                        Online Document Translator
                    </h2>

                    <p className="mt-4 text-gray-600 text-lg">
                        Make your content accessible to a broader audience.
                    </p>

                    {/* Upload */}
                    <FileUpload file={file} setFile={setFile} />

                    {/* Language Selector */}
                    <div className="mt-6 flex flex-col items-center">
                        <label className="mb-2 font-medium text-gray-700">Target Language:</label>
                        <select
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none w-full max-w-xs text-center cursor-pointer"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>

                    {/* ✅ Buttons block */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            disabled={!file}
                            onClick={handleTranslate}
                            className={`px-6 py-3 rounded-lg font-semibold w-full sm:w-auto ${file
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                }`}
                        >
                            Translate
                        </button>

                        <button
                            disabled={!file}
                            onClick={handleTranslateAndSummarize}
                            className={`px-6 py-3 rounded-lg font-semibold w-full sm:w-auto ${file
                                ? "bg-purple-600 text-white hover:bg-purple-700"
                                : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                }`}
                        >
                            Translate & Summarize
                        </button>
                    </div>

                    {/* ✅ Loader / Preview / Download block */}
                    <div className="mt-6 flex justify-center">
                        {loading ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-600">
                                    Processing your document...
                                </p>
                            </div>
                        ) : file && resultText ? (
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowPreview(true)}
                                    className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto"
                                >
                                    Preview
                                </button>

                                <button
                                    onClick={handleDownload}
                                    className="px-6 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 w-full sm:w-auto"
                                >
                                    Download ({file && file.name.endsWith(".pdf") ? "PDF" : "Text"})
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Translator;
