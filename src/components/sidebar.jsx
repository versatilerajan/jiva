import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, ListTodo, Users, ChevronLeft, LogOut, Hash } from "lucide-react";

export default function Sidebar({ team }) {
  const { user, dbUser, logout } = useAuth();
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [collapsed, setCollapsed] = useState(false);

  const avatarUrl = user?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "U")}&background=4f6ef7&color=fff&size=128`;

  const navItems = [
    { icon: <LayoutDashboard size={16} />, label: "Board",   path: `/board/${teamId}` },
    { icon: <ListTodo size={16} />,        label: "Backlog",  path: `/board/${teamId}/backlog` },
    { icon: <Users size={16} />,           label: "Members",  path: `/board/${teamId}/members` },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <button className="sidebar-brand" onClick={() => navigate("/rooms")}>
          <span className="brand-logo">◆</span>
          {!collapsed && <span className="brand-name">Jiva</span>}
        </button>
        <button className="collapse-btn" onClick={() => setCollapsed(c => !c)}>
          <ChevronLeft size={15} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      </div>

      {team && (
        <div className="sidebar-workspace">
          <div className="workspace-avatar">{team.team_name?.slice(0,2).toUpperCase()}</div>
          {!collapsed && (
            <div className="workspace-info">
              <div className="workspace-name">{team.team_name}</div>
              <div className="workspace-role">{dbUser?.role || "member"}</div>
            </div>
          )}
        </div>
      )}

      <nav className="sidebar-nav">
        {!collapsed && <div className="sidebar-section-label">Project</div>}
        {navItems.map(item => (
          <button key={item.label}
            className={`sidebar-item ${window.location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
            title={collapsed ? item.label : ""}>
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-middle">
        {!collapsed && <div className="sidebar-section-label">Workspaces</div>}
        <button className="sidebar-item" onClick={() => navigate("/rooms")} title={collapsed ? "All rooms" : ""}>
          <Hash size={16} />
          {!collapsed && <span>All rooms</span>}
        </button>
      </div>

      <div className="sidebar-footer">
        <img src={avatarUrl} alt="avatar" className="sidebar-avatar" />
        {!collapsed && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.displayName || "User"}</div>
            <div className="sidebar-user-role">{dbUser?.role}</div>
          </div>
        )}
        <button className="icon-btn" onClick={logout} title="Sign out"><LogOut size={14} /></button>
      </div>
    </aside>
  );
}