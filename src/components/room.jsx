import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTeams, createTeam } from "../services/api";
import { Plus, Users, Copy, Check, LogOut, ChevronRight, Hash } from "lucide-react";

const COLORS = [
  "linear-gradient(135deg,#4f6ef7,#7c3aed)",
  "linear-gradient(135deg,#059669,#0d9488)",
  "linear-gradient(135deg,#d97706,#f59e0b)",
  "linear-gradient(135deg,#dc2626,#f97316)",
  "linear-gradient(135deg,#7c3aed,#ec4899)",
  "linear-gradient(135deg,#0284c7,#0ea5e9)",
];

export default function Rooms() {
  const { user, dbUser, logout } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName]     = useState("");
  const [creating, setCreating]     = useState(false);
  const [copied, setCopied]         = useState(null);

  useEffect(() => { fetchTeams(); }, []);

  const fetchTeams = async () => {
    try {
      const res = await getTeams();
      setTeams(res.data.teams || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!roomName.trim() || !dbUser) return;
    setCreating(true);
    try {
      await createTeam({ team_name: roomName });
      setRoomName(""); setShowCreate(false);
      await fetchTeams();
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  const copyInviteLink = (teamId) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${teamId}`);
    setCopied(teamId);
    setTimeout(() => setCopied(null), 2000);
  };

  const avatarUrl = user?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "U")}&background=4f6ef7&color=fff&size=128`;

  return (
    <div className="rooms-page">
      <div className="rooms-sidebar">
        <div className="rooms-brand">
          <span className="brand-logo">◆</span>
          <span className="brand-name">Jiva</span>
        </div>
        <nav className="rooms-nav">
          <button className="rooms-nav-item active"><Hash size={16} /> Your rooms</button>
        </nav>
        <div className="rooms-user">
          <img src={avatarUrl} alt="avatar" className="user-avatar-sm" />
          <div className="user-info">
            <div className="user-name">{user?.displayName || "User"}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <button className="icon-btn" onClick={logout} title="Sign out"><LogOut size={15} /></button>
        </div>
      </div>

      <div className="rooms-main">
        <div className="rooms-header">
          <div>
            <h1 className="rooms-title">Your Workspaces</h1>
            <p className="rooms-sub">Choose a room to start working or create a new one.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New room
          </button>
        </div>

        {loading ? (
          <div className="rooms-loading">{[1,2,3].map(i => <div key={i} className="room-skeleton" />)}</div>
        ) : teams.length === 0 ? (
          <div className="rooms-empty">
            <div className="empty-icon">🏗️</div>
            <h3>No rooms yet</h3>
            <p>Create your first workspace to start managing projects with your team.</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Create your first room</button>
          </div>
        ) : (
          <div className="rooms-grid">
            {teams.map((team, i) => (
              <div key={team._id} className="room-card card animate-fade" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="room-card-top">
                  <div className="room-avatar" style={{ background: COLORS[i % COLORS.length] }}>
                    {team.team_name.slice(0,2).toUpperCase()}
                  </div>
                  <div className="room-meta">
                    <h3 className="room-name">{team.team_name}</h3>
                    <div className="room-members"><Users size={12} />{team.members?.length || 0} member{team.members?.length !== 1 ? "s" : ""}</div>
                  </div>
                </div>
                <div className="room-leader">Led by <strong>{team.team_leader_id?.name || "You"}</strong></div>
                <div className="room-member-avatars">
                  {(team.members || []).slice(0, 5).map((m, j) => (
                    <img key={j} src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.name||"U")}&background=4f6ef7&color=fff&size=64`}
                      alt={m.name} className="member-chip" title={m.name} />
                  ))}
                  {team.members?.length > 5 && <div className="member-chip member-more">+{team.members.length - 5}</div>}
                </div>
                <div className="room-actions">
                  <button className="btn btn-ghost room-invite" onClick={() => copyInviteLink(team._id)}>
                    {copied === team._id ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy invite</>}
                  </button>
                  <button className="btn btn-primary" onClick={() => navigate(`/board/${team._id}`)}>
                    Open <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="modal animate-scale">
            <div className="modal-header">
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Create a new room</h2>
              <button className="icon-btn" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="label">Room name</label>
                <input className="input" placeholder="e.g. Frontend Team, Sprint 4…" value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreate()} autoFocus />
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                You'll be the team leader. Share the invite link with teammates after creating.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={!roomName.trim() || creating}>
                {creating ? <span className="spinner" /> : "Create room"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}