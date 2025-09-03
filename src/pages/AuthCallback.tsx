// src/pages/AuthCallback.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Store token securely
      localStorage.setItem("authToken", token);

      // Restore pre-auth route if available
      const preAuthRoute = sessionStorage.getItem("preAuthRoute") || "/dashboard";
      sessionStorage.removeItem("preAuthRoute");

      navigate(preAuthRoute);
    } else {
      navigate("/"); // fallback if no token
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-white">
      <p>Signing you in...</p>
    </div>
  );
};

export default AuthCallback;
