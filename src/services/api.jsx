import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || "https://jivabackend.vercel.app",
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const syncUser        = (data)              => api.post("/api/auth/sync", data);
export const getMe           = ()                  => api.get("/api/auth/me");

// Tasks — always scoped to a team
export const getTasks        = (teamId)            => api.get(`/api/tasks?team_id=${teamId}`);
export const createTask      = (data)              => api.post("/api/tasks", data);          // data must include team_id
export const updateTask      = (id, data)          => api.patch(`/api/tasks/${id}`, data);
export const acceptTask      = (id)                => api.patch(`/api/tasks/${id}/accept`);
export const deleteTask      = (id)                => api.delete(`/api/tasks/${id}`);
export const getTaskActivity = (id)                => api.get(`/api/tasks/${id}/activity`);

export const submitReview    = (taskId, data)      => api.post(`/api/reviews/${taskId}`, data);
export const getReviews      = (taskId)            => api.get(`/api/reviews/${taskId}`);

// Teams — POST only needs team_name now, backend handles the rest
export const getTeams        = ()                  => api.get("/api/teams");
export const getTeam         = (id)                => api.get(`/api/teams/${id}`);
export const createTeam      = (data)              => api.post("/api/teams", data);          // data: { team_name }
export const addTeamMember   = (teamId, userId)    => api.patch(`/api/teams/${teamId}/add-member`, { user_id: userId });

export default api;