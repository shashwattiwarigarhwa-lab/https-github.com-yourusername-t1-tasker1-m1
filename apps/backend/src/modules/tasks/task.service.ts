import { ProjectRole, TaskPriority, TaskStatus, ActivityType } from "../../types/enums";

import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { assertAdmin, assertMember } from "../projects/project.service.js";

const taskInclude = {
  assignedTo: {
    select: { id: true, name: true, email: true }
  },
  createdBy: {
    select: { id: true, name: true, email: true }
  }
};

export async function listTasks(
  projectId: string,
  userId: string,
  filters: { status?: TaskStatus; priority?: TaskPriority }
) {
  const membership = await assertMember(projectId, userId);

  return prisma.task.findMany({
    where: {
      projectId,
      status: filters.status,
      priority: filters.priority,
      ...(membership.role === ProjectRole.MEMBER ? { assignedToId: userId } : {})
    },
    include: taskInclude,
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { updatedAt: "desc" }]
  });
}

export async function createTask(
  projectId: string,
  userId: string,
  input: {
    title: string;
    description?: string | null;
    dueDate?: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    assignedToId?: string | null;
  }
) {
  await assertAdmin(projectId, userId);
  await assertAssigneeBelongsToProject(projectId, input.assignedToId);

  const task = await prisma.task.create({
    data: {
      projectId,
      createdById: userId,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      priority: input.priority,
      status: input.status,
      assignedToId: input.assignedToId
    },
    include: taskInclude
  });

  await prisma.activity.create({
    data: {
      projectId,
      userId,
      type: ActivityType.TASK_CREATED,
      message: `Created task "${task.title}"`
    }
  });

  return task;
}

export async function getTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: taskInclude
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const membership = await assertMember(task.projectId, userId);

  if (membership.role === ProjectRole.MEMBER && task.assignedToId !== userId) {
    throw new ApiError(403, "Members can only view assigned tasks");
  }

  return task;
}

export async function updateTask(
  taskId: string,
  userId: string,
  input: {
    title?: string;
    description?: string | null;
    dueDate?: string | null;
    priority?: TaskPriority;
    status?: TaskStatus;
    assignedToId?: string | null;
  }
) {
  const current = await prisma.task.findUnique({ where: { id: taskId } });

  if (!current) {
    throw new ApiError(404, "Task not found");
  }

  await assertAdmin(current.projectId, userId);
  await assertAssigneeBelongsToProject(current.projectId, input.assignedToId);

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...input,
      dueDate: input.dueDate === undefined ? undefined : input.dueDate ? new Date(input.dueDate) : null
    },
    include: taskInclude
  });

  await prisma.activity.create({
    data: {
      projectId: current.projectId,
      userId,
      type: ActivityType.TASK_UPDATED,
      message: `Updated task "${task.title}"`
    }
  });

  return task;
}

export async function deleteTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  await assertAdmin(task.projectId, userId);
  await prisma.task.delete({ where: { id: taskId } });

  await prisma.activity.create({
    data: {
      projectId: task.projectId,
      userId,
      type: ActivityType.TASK_DELETED,
      message: `Deleted task "${task.title}"`
    }
  });
}

export async function updateTaskStatus(taskId: string, userId: string, status: TaskStatus) {
  const current = await prisma.task.findUnique({ where: { id: taskId } });

  if (!current) {
    throw new ApiError(404, "Task not found");
  }

  const membership = await assertMember(current.projectId, userId);

  if (membership.role === ProjectRole.MEMBER && current.assignedToId !== userId) {
    throw new ApiError(403, "Members can only update assigned tasks");
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status },
    include: taskInclude
  });

  await prisma.activity.create({
    data: {
      projectId: current.projectId,
      userId,
      type: ActivityType.TASK_STATUS_UPDATED,
      message: `Moved "${task.title}" to ${status.replace("_", " ").toLowerCase()}`
    }
  });

  return task;
}

async function assertAssigneeBelongsToProject(projectId: string, userId?: string | null) {
  if (!userId) {
    return;
  }

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });

  if (!membership) {
    throw new ApiError(400, "Assigned user must be a member of this project");
  }
}
