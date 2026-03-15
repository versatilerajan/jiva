import React from "react";
import { acceptTask } from "../services/api";

const PRIORITY_ICON = { urgent: "🔴", high: "🟠", medium: "🟡", low: "🟢" };

export default function TaskCard({ task, isDragging, onClick, dbUser, onUpdate }) {
  const canAccept =
    task.status === "To-Do" &&
    dbUser?.role === "member" &&
    (!task.assigned_to || task.assigned_to._id !== dbUser._id);

  const handleAccept = async (e) => {
    e.stopPropagation();
    try { await acceptTask(task._id); onUpdate(); }
    catch (err) { console.error(err); }
  };

  const progressColor =
    task.progress >= 100 ? "var(--purple)"  :
    task.progress >= 60  ? "var(--green)"   :
    task.progress >= 30  ? "var(--yellow)"  : "var(--accent)";

  return (
    <div className={`task-card ${isDragging ? "dragging" : ""}`} onClick={onClick}>
      <div className="task-card-top">
        <span className="task-priority-icon">{PRIORITY_ICON[task.priority] || "🟡"}</span>
        <span className="task-id">{task._id?.slice(-5)?.toUpperCase()}</span>
      </div>

      <p className="task-title">{task.task_title}</p>

      <div className="task-tags">
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
        {task.due_date && (
          <span className="task-due">
            📅 {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      {task.status === "In Progress" && (
        <div className="task-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${task.progress}%`, background: progressColor }} />
          </div>
          <span className="progress-label">{task.progress}%</span>
        </div>
      )}

      <div className="task-card-footer">
        {task.assigned_to ? (
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(task.assigned_to.name || "U")}&background=4f6ef7&color=fff&size=64`}
            alt={task.assigned_to.name}
            className="task-assignee"
            title={task.assigned_to.name}
          />
        ) : (
          <span className="task-unassigned">Unassigned</span>
        )}
        {canAccept && <button className="accept-btn" onClick={handleAccept}>Accept</button>}
      </div>
    </div>
  );
}