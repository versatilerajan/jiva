import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg-primary)",
      padding: 20, textAlign: "center",
    }}>
      <div>
        <div style={{ fontSize: 80, fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--border)", marginBottom: 12 }}>404</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Page not found</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 28 }}>The page you're looking for doesn't exist.</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>← Go home</button>
      </div>
    </div>
  );
}