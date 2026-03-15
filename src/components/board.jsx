import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAuth } from "../context/AuthContext";
import { getTasks, updateTask, getTeam } from "../services/api";
import Sidebar from "./sidebar";
import TaskCard from "./taskcard";
import TaskModal from "./taskmodal";
import CreateTaskModal from "./createtaskmodal";
import { Plus, Search, RefreshCw } from "lucide-react";

const COLUMNS = [
  { id: "To-Do",       label: "TO DO",      color: "var(--text-muted)" },
  { id: "In Progress", label: "IN PROGRESS", color: "var(--yellow)"    },
  { id: "Review",      label: "REVIEW",      color: "var(--purple)"    },
  { id: "Done",        label: "DONE",        color: "var(--green)"     },
];

export default function Board() {
  const { teamId }  = useParams();
  const navigate    = useNavigate();
  const { dbUser }  = useAuth();

  const [tasks, setTasks]                   = useState([]);
  const [team, setTeam]                     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedTask, setSelectedTask]     = useState(null);
  const [showCreate, setShowCreate]         = useState(false);
  const [createStatus, setCreateStatus]     = useState("To-Do");

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, teamRes] = await Promise.all([
        getTasks(teamId),
        getTeam(teamId),
      ]);
      setTasks(tasksRes.data.tasks || []);
      setTeam(teamRes.data.team || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getColumnTasks = (status) =>
    tasks
      .filter(t => t.status === status)
      .filter(t => search ? t.task_title.toLowerCase().includes(search.toLowerCase()) : true)
      .filter(t => filterPriority !== "all" ? t.priority === filterPriority : true)
      .sort((a, b) => a.column_position - b.column_position);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    setTasks(prev => prev.map(t =>
      t._id === draggableId ? { ...t, status: newStatus, column_position: destination.index } : t
    ));
    try {
      await updateTask(draggableId, { status: newStatus, column_position: destination.index });
    } catch (e) {
      console.error(e);
      fetchData();
    }
  };

  const openCreate = (status) => { setCreateStatus(status); setShowCreate(true); };

  if (loading) {
    return (
      <div className="board-page">
        <Sidebar team={team} />
        <div className="board-loading">
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="board-page">
      <Sidebar team={team} onRefresh={fetchData} />

      <div className="board-main">
        <div className="board-header">
          <div className="board-header-left">
            <button className="back-btn" onClick={() => navigate("/rooms")}>← Rooms</button>
            <div>
              <h1 className="board-title">{team?.team_name || "Board"}</h1>
              <p className="board-sub">Kanban Board · {tasks.length} issues</p>
            </div>
          </div>
          <div className="board-header-right">
            <div className="search-box">
              <Search size={14} className="search-icon" />
              <input className="search-input" placeholder="Search tasks…" value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="all">All priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button className="icon-btn" onClick={fetchData} title="Refresh"><RefreshCw size={15} /></button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-board">
            {COLUMNS.map(col => {
              const colTasks = getColumnTasks(col.id);
              return (
                <div className="kanban-column" key={col.id}>
                  <div className="col-header">
                    <div className="col-title-group">
                      <span className="col-dot" style={{ background: col.color }} />
                      <span className="col-title" style={{ color: col.color }}>{col.label}</span>
                      <span className="col-count">{colTasks.length}</span>
                    </div>
                    <button className="col-add-btn" onClick={() => openCreate(col.id)}>
                      <Plus size={14} />
                    </button>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`col-tasks ${snapshot.isDraggingOver ? "drag-over" : ""}`}
                      >
                        {colTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={provided.draggableProps.style}
                              >
                                <TaskCard
                                  task={task}
                                  isDragging={snapshot.isDragging}
                                  onClick={() => setSelectedTask(task)}
                                  dbUser={dbUser}
                                  onUpdate={fetchData}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="col-empty">
                            <button onClick={() => openCreate(col.id)}>+ Add issue</button>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={fetchData}
          dbUser={dbUser}
        />
      )}

      {showCreate && (
        <CreateTaskModal
          defaultStatus={createStatus}
          teamId={teamId}
          team={team}
          onClose={() => setShowCreate(false)}
          onCreated={fetchData}
          dbUser={dbUser}
        />
      )}
    </div>
  );
}