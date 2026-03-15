import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/protectedroute";
import Landing from "./components/landing";
import Auth from "./components/auth";
import Rooms from "./components/room";
import Board from "./components/board";
import JoinRoom from "./components/joinroom";
import NotFound from "./components/notfound";
import "./index.css";

function PendingJoinHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const pending = sessionStorage.getItem("pendingJoin");
    if (pending) { sessionStorage.removeItem("pendingJoin"); navigate(pending); }
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PendingJoinHandler />
        <Routes>
          <Route path="/"             element={<Landing />} />
          <Route path="/auth"         element={<Auth />} />
          <Route path="/join/:teamId" element={<JoinRoom />} />

          <Route path="/rooms" element={
            <ProtectedRoute><Rooms /></ProtectedRoute>
          } />

          <Route path="/board/:teamId" element={
            <ProtectedRoute><Board /></ProtectedRoute>
          } />

          <Route path="/board/:teamId/*" element={
            <ProtectedRoute><Board /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}