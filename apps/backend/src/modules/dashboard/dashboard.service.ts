import { Prisma, ProjectRole, TaskStatus } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { assertMember } from "../projects/project.service.js";

export async function getGlobalDashboard(userId: string) {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true, role: true }
  });

  const projectIds = memberships.map((membership) => membership.projectId);
  const memberProjectIds = memberships
    .filter((membership) => membership.role === ProjectRole.MEMBER)
    .map((membership) => membership.projectId);

  const taskWhere: Prisma.TaskWhereInput = {
    projectId: { in: projectIds },
    OR: [{ projectId: { notIn: memberProjectIds } }, { assignedToId: userId }]
  };

  return buildDashboard(taskWhere, projectIds);
}

export async function getProjectDashboard(projectId: string, userId: string) {
  const membership = await assertMember(projectId, userId);
  const taskWhere =
    membership.role === ProjectRole.MEMBER
      ? { projectId, assignedToId: userId }
      : { projectId };

  return buildDashboard(taskWhere, [projectId]);
}

async function buildDashboard(taskWhere: Prisma.TaskWhereInput, projectIds: string[]) {
  const now = new Date();
  const [totalTasks, statusCounts, tasksPerUser, overdueTasks, recentActivity] = await Promise.all([
    prisma.task.count({ where: taskWhere }),
    prisma.task.groupBy({
      by: ["status"],
      where: taskWhere,
      _count: { id: true }
    }),
    prisma.task.groupBy({
      by: ["assignedToId"],
      where: {
        ...taskWhere,
        assignedToId: { not: null }
      },
      _count: { id: true }
    }),
    prisma.task.findMany({
      where: {
        ...taskWhere,
        dueDate: { lt: now },
        status: { not: TaskStatus.DONE }
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { dueDate: "asc" },
      take: 8
    }),
    prisma.activity.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  const userIds = tasksPerUser
    .map((item) => item.assignedToId)
    .filter((id): id is string => Boolean(id));

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true }
  });

  return {
    totalTasks,
    tasksByStatus: {
      TODO: statusCounts.find((item) => item.status === "TODO")?._count.id ?? 0,
      IN_PROGRESS: statusCounts.find((item) => item.status === "IN_PROGRESS")?._count.id ?? 0,
      DONE: statusCounts.find((item) => item.status === "DONE")?._count.id ?? 0
    },
    tasksPerUser: tasksPerUser.map((item) => ({
      user: users.find((user) => user.id === item.assignedToId),
      total: item._count.id
    })),
    overdueTasks,
    recentActivity
  };
}
