import { api } from "./api";
import type { Dashboard, Project, ProjectRole, Task, TaskPriority, TaskStatus } from "@/types";

export async function getDashboard() {
  const { data } = await api.get<{ dashboard: Dashboard }>("/api/dashboard");
  return data.dashboard;
}

export async function getProjects() {
  const { data } = await api.get<{ projects: Project[] }>("/api/projects");
  return data.projects;
}

export async function createProject(input: { name: string; description?: string }) {
  const { data } = await api.post<{ project: Project }>("/api/projects", input);
  return data.project;
}

export async function getProject(projectId: string) {
  const { data } = await api.get<{ project: Project }>(`/api/projects/${projectId}`);
  return data.project;
}

export async function addMember(
  projectId: string,
  input: { email: string; role: ProjectRole }
) {
  const { data } = await api.post(`/api/projects/${projectId}/members`, input);
  return data.member;
}

export async function removeMember(projectId: string, userId: string) {
  await api.delete(`/api/projects/${projectId}/members/${userId}`);
}

export async function getTasks(
  projectId: string,
  filters?: { status?: TaskStatus; priority?: TaskPriority }
) {
  const { data } = await api.get<{ tasks: Task[] }>(`/api/projects/${projectId}/tasks`, {
    params: filters
  });
  return data.tasks;
}

export async function createTask(
  projectId: string,
  input: {
    title: string;
    description?: string;
    dueDate?: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignedToId?: string;
  }
) {
  const { data } = await api.post<{ task: Task }>(`/api/projects/${projectId}/tasks`, input);
  return data.task;
}

export async function updateTask(
  taskId: string,
  input: Partial<{
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignedToId: string;
  }>
) {
  const { data } = await api.patch<{ task: Task }>(`/api/tasks/${taskId}`, input);
  return data.task;
}

export async function deleteTask(taskId: string) {
  await api.delete(`/api/tasks/${taskId}`);
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const { data } = await api.patch<{ task: Task }>(`/api/tasks/${taskId}/status`, { status });
  return data.task;
}

export async function getProjectDashboard(projectId: string) {
  const { data } = await api.get<{ dashboard: Dashboard }>(`/api/projects/${projectId}/dashboard`);
  return data.dashboard;
}
