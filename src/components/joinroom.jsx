import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addTeamMember, getTeams } from "../services/api";

export default function JoinRoom() {
  const { teamId }                = useParams();
  const { user, dbUser, loading } = useAuth();
  const navigate                  = useNavigate();
  const [status, setStatus]       = useState("loading");
  const [teamName, setTeamName]   = useState("");

  const joinTeam = useCallback(async () => {
    if (!dbUser) return;
    setStatus("joining");
    try {
      const res  = await getTeams();
      const team = (res.data.teams || []).find(t => t._id === teamId);
      if (!team) { setStatus("error"); return; }
      setTeamName(team.team_name);
      const alreadyMember = team.members?.some(m => m._id === dbUser._id);
      if (alreadyMember) { setStatus("already"); return; }
      await addTeamMember(teamId, dbUser._id);
      setStatus("joined");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }, [dbUser, teamId]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      sessionStorage.setItem("pendingJoin", `/join/${teamId}`);
      navigate("/auth");
      return;
    }
    // Avoid calling async function directly in effect
    const runJoinTeam = async () => {
      await joinTeam();
    };
    runJoinTeam();
  }, [loading, user, teamId, navigate, joinTeam]);

  const messages = {
    loading: { icon: "⏳", title: "Checking invite…",        sub: "Hold on a moment." },
    joining: { icon: "🔗", title: "Joining workspace…",      sub: "Adding you to the team." },
    joined:  { icon: "🎉", title: `You joined ${teamName}!`, sub: "You now have access to this workspace." },
    already: { icon: "✅", title: "Already a member",        sub: `You're already part of ${teamName}.` },
    error:   { icon: "❌", title: "Invite not found",        sub: "This link may be invalid or expired." },
  };

  const msg = messages[status];

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: 20 }}>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "48px 40px", textAlign: "center", maxWidth: 400, width: "100%", animation: "scaleIn 0.2s ease" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>{msg.icon}</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{msg.title}</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 28, lineHeight: 1.6 }}>{msg.sub}</p>

        {(status === "joined" || status === "already") && (
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: 12 }} onClick={() => navigate(`/board/${teamId}`)}>
            Go to board →
          </button>
        )}
        {status === "error" && (
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => navigate("/rooms")}>
            Back to rooms
          </button>
        )}
        {(status === "loading" || status === "joining") && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="spinner" style={{ width: 24, height: 24 }} />
          </div>
        )}
      </div>
    </div>
  );
}