import React, { useState } from "react";
import { createTask } from "../services/api";
import { X } from "lucide-react";

const STATUSES   = ["To-Do", "In Progress", "Review", "Done"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

export default function CreateTaskModal({ defaultStatus, teamId, team, onClose, onCreated, dbUser }) {
  const [form, setForm] = useState({
    task_title:       "",
    task_description: "",
    status:           defaultStatus || "To-Do",
    priority:         "medium",
    due_date:         "",
    assigned_to:      "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.task_title.trim()) { setError("Task title is required."); return; }
    if (!teamId)                 { setError("team_id is missing. Please go back and reopen the board."); return; }

    setSaving(true);
    try {
      await createTask({
        task_title:       form.task_title.trim(),
        task_description: form.task_description,
        status:           form.status,
        priority:         form.priority,
        due_date:         form.due_date   || undefined,
        assigned_to:      form.assigned_to || undefined,
        team_id:          teamId,                                         // ← key fix
        team_leader_id:   team?.team_leader_id?._id || dbUser?._id,
      });
      onCreated();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create task.");
    } finally {
      setSaving(false);
    }
  };

  const members = team?.members || [];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-scale">
        <div className="modal-header">
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>Create issue</h2>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="label">Title *</label>
            <input
              className="input"
              placeholder="What needs to be done?"
              value={form.task_title}
              onChange={e => set("task_title", e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Add more details…"
              value={form.task_description}
              onChange={e => set("task_description", e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => set("status", e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => set("priority", e.target.value)}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Assignee</label>
              <select className="input" value={form.assigned_to} onChange={e => set("assigned_to", e.target.value)}>
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Due date</label>
              <input
                className="input"
                type="date"
                value={form.due_date}
                onChange={e => set("due_date", e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: "10px 14px",
              background: "var(--red-light)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "var(--radius-sm)",
              fontSize: 13, color: "var(--red)",
            }}>
              ⚠ {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving || !form.task_title.trim()}
          >
            {saving ? <span className="spinner" /> : "Create issue"}
          </button>
        </div>
      </div>
    </div>
  );
}