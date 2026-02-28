import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import Translator from "./components/Translator";
import ForgotPassword from "./components/ForgotPassword";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/home"
        element={isAuthenticated ? <Translator /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
