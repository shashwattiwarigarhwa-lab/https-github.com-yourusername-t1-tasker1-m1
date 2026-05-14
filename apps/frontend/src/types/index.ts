export type ProjectRole = "ADMIN" | "MEMBER";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectMember = {
  id: string;
  role: ProjectRole;
  userId: string;
  projectId: string;
  user: User;
  joinedAt: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
  _count?: {
    tasks: number;
    members: number;
  };
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  projectId: string;
  assignedToId?: string | null;
  createdById: string;
  assignedTo?: User | null;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
};

export type Dashboard = {
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksPerUser: Array<{ user?: User; total: number }>;
  overdueTasks: Task[];
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
    user: User;
  }>;
};
