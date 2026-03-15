import React, { useState, useEffect } from "react";
import { updateTask, deleteTask, getTaskActivity, submitReview, getReviews } from "../services/api";
import { X, Trash2 } from "lucide-react";

const STATUSES   = ["To-Do", "In Progress", "Review", "Done"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

export default function TaskModal({ task: initialTask, onClose, onUpdate, dbUser }) {
  const [task, setTask]         = useState(initialTask);
  const [activity, setActivity] = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [saving, setSaving]     = useState(false);
  const [tab, setTab]           = useState("details");
  const [comment, setComment]   = useState("");
  const [feedback, setFeedback] = useState("");

  const canEdit   = dbUser?.role === "admin" || dbUser?.role === "team_leader";
  const canReview = canEdit && task.status === "Review";

  useEffect(() => {
    getTaskActivity(task._id).then(r => setActivity(r.data.activity || [])).catch(() => {});
    if (task.status === "Review") getReviews(task._id).then(r => setReviews(r.data.reviews || [])).catch(() => {});
  }, [task._id, task.status]);

  const save = async (patch) => {
    setSaving(true);
    try {
      const res = await updateTask(task._id, { ...patch, comment });
      setTask(res.data.task);
      onUpdate();
      if (comment) {
        const actRes = await getTaskActivity(task._id);
        setActivity(actRes.data.activity || []);
        setComment("");
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    await deleteTask(task._id);
    onUpdate(); onClose();
  };

  const handleReview = async (reviewStatus) => {
    if (!feedback.trim() && reviewStatus === "rejected") return alert("Please provide feedback for rejection.");
    setSaving(true);
    try {
      const res = await submitReview(task._id, { review_status: reviewStatus, feedback });
      setTask(res.data.task);
      onUpdate(); setFeedback("");
      const r = await getReviews(task._id);
      setReviews(r.data.reviews || []);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const statusClass = {
    "To-Do": "badge-todo", "In Progress": "badge-inprog",
    "Review": "badge-review", "Done": "badge-done",
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="task-modal animate-scale">
        <div className="task-modal-header">
          <div className="task-modal-id">#{task._id?.slice(-6)?.toUpperCase()}</div>
          <div className="task-modal-actions">
            {canEdit && <button className="icon-btn" onClick={handleDelete}><Trash2 size={15} /></button>}
            <button className="icon-btn" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        <div className="task-modal-body">
          {canEdit ? (
            <input className="task-title-input" defaultValue={task.task_title}
              onBlur={e => { if (e.target.value !== task.task_title) save({ task_title: e.target.value }); }} />
          ) : (
            <h2 className="task-modal-title">{task.task_title}</h2>
          )}

          <div className="task-tabs">
            {["details", "activity", "reviews"].map(t => (
              <button key={t} className={`task-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t === "reviews" && reviews.length > 0 && <span className="tab-badge">{reviews.length}</span>}
              </button>
            ))}
          </div>

          {tab === "details" && (
            <div className="task-detail-grid">
              <div className="detail-col">
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  {canEdit ? (
                    <select className="detail-select" value={task.status} onChange={e => save({ status: e.target.value })}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span className={`badge ${statusClass[task.status]}`}>{task.status}</span>
                  )}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Priority</span>
                  {canEdit ? (
                    <select className="detail-select" value={task.priority} onChange={e => save({ priority: e.target.value })}>
                      {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  ) : (
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  )}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Progress</span>
                  <div className="progress-editor">
                    <input type="range" min="0" max="100" value={task.progress}
                      onChange={e => setTask(t => ({ ...t, progress: +e.target.value }))}
                      onMouseUp={e => save({ progress: +e.target.value })}
                      disabled={!canEdit && dbUser?._id !== task.assigned_to?._id} />
                    <span className="progress-pct">{task.progress}%</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Due date</span>
                  {canEdit ? (
                    <input type="date" className="detail-select"
                      defaultValue={task.due_date ? task.due_date.slice(0,10) : ""}
                      onBlur={e => save({ due_date: e.target.value || null })} />
                  ) : (
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}
                    </span>
                  )}
                </div>
              </div>

              <div className="detail-col">
                <div className="detail-item">
                  <span className="detail-label">Assignee</span>
                  <div className="assignee-display">
                    {task.assigned_to ? (
                      <>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(task.assigned_to.name||"U")}&background=4f6ef7&color=fff&size=64`}
                          alt="" style={{ width: 22, height: 22, borderRadius: "50%" }} />
                        <span style={{ fontSize: 13 }}>{task.assigned_to.name}</span>
                      </>
                    ) : <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Unassigned</span>}
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Reporter</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{task.created_by?.name || "—"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created</span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{new Date(task.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="detail-full">
                <span className="detail-label">Description</span>
                {canEdit ? (
                  <textarea className="task-desc-input" defaultValue={task.task_description}
                    placeholder="Add a description…"
                    onBlur={e => { if (e.target.value !== task.task_description) save({ task_description: e.target.value }); }} />
                ) : (
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {task.task_description || <em style={{ color: "var(--text-muted)" }}>No description.</em>}
                  </p>
                )}
              </div>

              <div className="detail-full">
                <span className="detail-label">Add comment</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" placeholder="Leave a comment…" value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && comment.trim() && save({})} />
                  <button className="btn btn-primary" onClick={() => comment.trim() && save({})} disabled={!comment.trim() || saving}>
                    {saving ? <span className="spinner" /> : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "activity" && (
            <div className="activity-list">
              {activity.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No activity yet.</p>
              ) : activity.map(a => (
                <div className="activity-item" key={a._id}>
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(a.user_id?.name||"U")}&background=4f6ef7&color=fff&size=64`}
                    alt="" className="activity-avatar" />
                  <div className="activity-body">
                    <div className="activity-meta">
                      <strong>{a.user_id?.name}</strong>
                      {a.previous_status && <span> moved from <b>{a.previous_status}</b> → <b>{a.new_status}</b></span>}
                      {a.progress > 0 && <span> · {a.progress}%</span>}
                    </div>
                    {a.comment && <div className="activity-comment">{a.comment}</div>}
                    <div className="activity-time">{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "reviews" && (
            <div className="review-section">
              {canReview && (
                <div className="review-form">
                  <span className="detail-label">Submit review</span>
                  <textarea className="task-desc-input" placeholder="Provide feedback…" value={feedback}
                    onChange={e => setFeedback(e.target.value)} rows={3} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleReview("approved")} disabled={saving}>✓ Approve</button>
                    <button className="btn btn-danger"  style={{ flex: 1 }} onClick={() => handleReview("rejected")} disabled={saving}>✗ Reject</button>
                  </div>
                </div>
              )}
              {reviews.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>No reviews yet.</p>
              ) : reviews.map(r => (
                <div className="review-item" key={r._id}>
                  <div className="review-header">
                    <strong style={{ fontSize: 13 }}>{r.reviewer_id?.name}</strong>
                    <span className={`badge ${r.review_status === "approved" ? "badge-done" : r.review_status === "rejected" ? "badge-urgent" : "badge-todo"}`}>
                      {r.review_status}
                    </span>
                    <span className="activity-time">{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  {r.feedback && <p className="activity-comment">{r.feedback}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}