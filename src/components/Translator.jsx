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
    const [file, setFile] = useState(null);
    const [targetLanguage, setTargetLanguage] = useState("English");
    const [userProfile, setUserProfile] = useState(null);
    const [showProfileDrawer, setShowProfileDrawer] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editName, setEditName] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    // 🔹 Connectivity Check & Fetch Profile
    React.useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001" : "");
        
        fetch(`${API_URL}/`)
            .then((res) => res.text())
            .then((data) => console.log("✅ Backend connected:", data))
            .catch((err) => console.error("❌ Backend connection failed:", err));

        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const res = await fetch(`${API_URL}/user/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserProfile(data);
                    setEditName(data.name);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();
    }, []);

    // 🔹 Update Handlers
    const handleUpdateName = async () => {
        if (!editName.trim()) return alert("Name cannot be empty");
        try {
            const token = localStorage.getItem("token");
            const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001" : "");
            const res = await fetch(`${API_URL}/user/me/name`, {
                method: "PUT",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ newName: editName })
            });
            const data = await res.json();
            if (res.ok) {
                setUserProfile({ ...userProfile, name: data.name });
                setIsEditingName(false);
                alert("Name updated successfully!");
            } else {
                alert(data.message || "Failed to update name");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) return alert("Please fill all fields");
        if (newPassword !== confirmPassword) return alert("New password and Confirm password do not match!");

        const isConfirmed = window.confirm("Are you sure you want to change your password?");
        if (!isConfirmed) return;

        try {
            const token = localStorage.getItem("token");
            const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001" : "");
            const res = await fetch(`${API_URL}/user/me/password`, {
                method: "PUT",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setIsEditingPassword(false);
                alert("Password updated successfully!");
            } else {
                alert(data.message || "Failed to update password");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    };

    // 🔹 Translate only
    const handleTranslate = async () => {
        if (!file) return;

        setLoading(true);
        setResultText("");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "translate");
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
                throw new Error(data.message || data.error || "Translation failed");
            }
            setResultText(data.output);
        } catch (err) {
            console.error(err);
            if (err.message === "Invalid token" || err.message === "No token provided") {
                alert("Session expired. Please log in again.");
                localStorage.removeItem("token");
                window.location.href = "/login";
            } else {
                setResultText(`❌ Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Translate + Summarize
    const handleTranslateAndSummarize = async () => {
        if (!file) return;

        setLoading(true);
        setResultText("");

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
                throw new Error(data.message || data.error || "Processing failed");
            }
            setResultText(data.output);
        } catch (err) {
            console.error(err);
            if (err.message === "Invalid token" || err.message === "No token provided") {
                alert("Session expired. Please log in again.");
                localStorage.removeItem("token");
                window.location.href = "/login";
            } else {
                setResultText(`❌ Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!resultText) return;
        const ext = file && file.name.endsWith(".pdf") ? "txt" : "txt";
        const filename = file ? `translated_${file.name.split('.')[0]}.${ext}` : "translated.txt";
        
        const blob = new Blob([resultText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDeleteAccount = async () => {
        try {
            const token = localStorage.getItem("token");
            const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001" : "");
            const res = await fetch(`${API_URL}/user/me`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Account deleted permanently.");
                localStorage.removeItem("token");
                window.location.href = "/login";
            } else {
                const data = await res.json();
                alert(data.message || "Failed to delete account");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 flex flex-col font-sans text-gray-800">
            {/* Minimal Navbar */}
            <nav className="flex justify-between items-center px-4 sm:px-8 py-4 bg-white border-b border-gray-200">
                <div className="flex items-center gap-4">
                    {/* Hamburger menu for Profile */}
                    <button onClick={() => setShowProfileDrawer(true)} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border border-gray-300">
                            <svg className="w-7 h-7 text-gray-400 mt-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-800 hidden sm:block">
                            POMSA <span className="font-normal text-gray-500">Translator</span>
                        </h1>
                    </div>
                </div>

                <ul className="flex gap-4 sm:gap-6 font-medium text-sm items-center">
                    <li><span className="text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">Home</span></li>
                    <li><span className="text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">Contact</span></li>
                    <li><span className="text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">Help</span></li>
                    <li className="ml-4">
                        <button 
                            onClick={handleLogout} 
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Profile Drawer */}
            {showProfileDrawer && (
                <>
                    <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={() => setShowProfileDrawer(false)}></div>
                    <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-semibold text-gray-800">Profile</h2>
                            <button onClick={() => setShowProfileDrawer(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="flex flex-col items-center mb-8 pt-4">
                                <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-sm">
                                    {userProfile ? userProfile.name.charAt(0).toUpperCase() : "?"}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 text-center">{userProfile ? userProfile.name : "Loading..."}</h3>
                                <p className="text-gray-500 text-sm mt-1 text-center">{userProfile ? userProfile.email : ""}</p>
                            </div>

                            <div className="space-y-4">
                                {/* Update Name Section */}
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Profile Name</h4>
                                        <button 
                                            onClick={() => {
                                                setIsEditingName(!isEditingName);
                                                if (!isEditingName && userProfile) setEditName(userProfile.name);
                                            }}
                                            className="text-blue-600 text-sm font-medium hover:underline"
                                        >
                                            {isEditingName ? "Cancel" : "Edit"}
                                        </button>
                                    </div>
                                    {isEditingName ? (
                                        <div className="space-y-3">
                                            <input 
                                                type="text" 
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="Enter new name"
                                            />
                                            <button 
                                                onClick={handleUpdateName}
                                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                                            >
                                                Save Name
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-gray-800 font-medium">{userProfile?.name}</p>
                                    )}
                                </div>

                                {/* Update Password Section */}
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Security</h4>
                                        <button 
                                            onClick={() => {
                                                setIsEditingPassword(!isEditingPassword);
                                                setCurrentPassword("");
                                                setNewPassword("");
                                                setConfirmPassword("");
                                            }}
                                            className="text-blue-600 text-sm font-medium hover:underline"
                                        >
                                            {isEditingPassword ? "Cancel" : "Change Password"}
                                        </button>
                                    </div>
                                    {isEditingPassword ? (
                                        <div className="space-y-3">
                                            <input 
                                                type="password" 
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="Current Password"
                                            />
                                            <input 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="New Password"
                                            />
                                            <input 
                                                type="password" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="Confirm New Password"
                                            />
                                            <button 
                                                onClick={handleUpdatePassword}
                                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                                            >
                                                Update Password
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">••••••••</p>
                                    )}
                                </div>

                                {/* Danger Zone */}
                                <div className="p-5 bg-red-50 rounded-xl border border-red-100">
                                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                        Danger Zone
                                    </h4>
                                    <p className="text-sm text-red-600 mb-4 leading-relaxed">Once you delete your account, there is no going back. Please be certain.</p>
                                    <button 
                                        onClick={() => {
                                            setShowProfileDrawer(false);
                                            setShowDeleteModal(true);
                                        }}
                                        className="w-full px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl transform transition-all">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Account</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">Are you sure you want to permanently delete your account? This will remove all your data including name, email, and password. This action cannot be undone.</p>
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteAccount}
                                className="px-5 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors shadow-sm w-full sm:w-auto"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Workspace */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col">
                
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Document Translation</h2>
                    <p className="text-gray-500 mt-1">Upload a document to translate and optionally summarize its content.</p>
                </div>

                {/* Two-Pane Layout */}
                <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 min-h-[500px] overflow-hidden">
                    
                    {/* Left Pane (Source / Input) */}
                    <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 w-full lg:w-1/2">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <span className="font-medium text-gray-600 text-sm uppercase tracking-wider">Source Document</span>
                        </div>
                        
                        <div className="flex-1 p-6 flex flex-col">
                            <FileUpload file={file} setFile={setFile} />
                            
                            <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                                <button
                                    disabled={!file || loading}
                                    onClick={handleTranslate}
                                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                                        file && !loading
                                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    Translate
                                </button>
                                <button
                                    disabled={!file || loading}
                                    onClick={handleTranslateAndSummarize}
                                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                                        file && !loading
                                            ? "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                                            : "bg-white border-2 border-gray-100 text-gray-300 cursor-not-allowed"
                                    }`}
                                >
                                    Translate & Summarize
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Pane (Target / Output) */}
                    <div className="flex-1 flex flex-col bg-white w-full lg:w-1/2">
                        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center space-x-3">
                                <span className="font-medium text-gray-600 text-sm uppercase tracking-wider">Target</span>
                                <div className="h-4 w-px bg-gray-300"></div>
                                <select
                                    value={targetLanguage}
                                    onChange={(e) => setTargetLanguage(e.target.value)}
                                    className="bg-transparent font-medium text-blue-600 text-base outline-none cursor-pointer hover:text-blue-700 appearance-none pr-4"
                                    style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right center", backgroundSize: "1em" }}
                                >
                                    {LANGUAGES.map((lang) => (
                                        <option key={lang} value={lang} className="text-gray-800">{lang}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {loading && (
                                <div className="flex items-center space-x-2 text-blue-600">
                                    <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm font-medium">Translating...</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 p-6 relative flex flex-col">
                            {resultText ? (
                                <div className="h-full flex flex-col">
                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                        <div className={`text-gray-800 text-lg leading-relaxed whitespace-pre-wrap ${resultText.startsWith('❌') ? 'text-red-500' : ''}`}>
                                            {resultText}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={handleDownload}
                                            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            <span>Download Result</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                        </svg>
                                    </div>
                                    <p className="text-base">Translation will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Translator;
