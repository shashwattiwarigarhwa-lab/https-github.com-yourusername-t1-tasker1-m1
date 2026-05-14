import { ProjectRole, ActivityType } from "../../types/enums";

import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";

const projectInclude = {
  members: {
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { joinedAt: "asc" as const }
  },
  _count: {
    select: { tasks: true, members: true }
  }
};

export async function listProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      members: {
        some: { userId }
      }
    },
    include: projectInclude,
    orderBy: { updatedAt: "desc" }
  });
}

export async function createProject(
  userId: string,
  input: { name: string; description?: string }
) {
  return prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      members: {
        create: {
          userId,
          role: ProjectRole.ADMIN
        }
      },
      activities: {
        create: {
          userId,
          type: ActivityType.PROJECT_CREATED,
          message: `Created project "${input.name}"`
        }
      }
    },
    include: projectInclude
  });
}

export async function getProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: { userId }
      }
    },
    include: projectInclude
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return project;
}

export async function updateProject(
  projectId: string,
  userId: string,
  input: { name?: string; description?: string | null }
) {
  await assertAdmin(projectId, userId);

  return prisma.project.update({
    where: { id: projectId },
    data: {
      name: input.name,
      description: input.description
    },
    include: projectInclude
  });
}

export async function deleteProject(projectId: string, userId: string) {
  await assertAdmin(projectId, userId);
  await prisma.project.delete({ where: { id: projectId } });
}

export async function addMember(
  projectId: string,
  actorId: string,
  input: { email: string; role: ProjectRole }
) {
  await assertAdmin(projectId, actorId);

  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, name: true, email: true }
  });

  if (!user) {
    throw new ApiError(404, "No user found with that email");
  }

  const membership = await prisma.projectMember.upsert({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId
      }
    },
    create: {
      projectId,
      userId: user.id,
      role: input.role
    },
    update: {
      role: input.role
    },
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  });

  await prisma.activity.create({
    data: {
      projectId,
      userId: actorId,
      type: ActivityType.MEMBER_ADDED,
      message: `Added ${user.name} as ${input.role.toLowerCase()}`
    }
  });

  return membership;
}

export async function removeMember(projectId: string, actorId: string, userId: string) {
  await assertAdmin(projectId, actorId);

  if (actorId === userId) {
    throw new ApiError(400, "Admins cannot remove themselves");
  }

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
    include: { user: { select: { name: true } } }
  });

  if (!membership) {
    throw new ApiError(404, "Project member not found");
  }

  await prisma.projectMember.delete({
    where: { userId_projectId: { userId, projectId } }
  });

  await prisma.activity.create({
    data: {
      projectId,
      userId: actorId,
      type: ActivityType.MEMBER_REMOVED,
      message: `Removed ${membership.user.name} from the project`
    }
  });
}

export async function assertMember(projectId: string, userId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });

  if (!membership) {
    throw new ApiError(403, "You are not a member of this project");
  }

  return membership;
}

export async function assertAdmin(projectId: string, userId: string) {
  const membership = await assertMember(projectId, userId);

  if (membership.role !== ProjectRole.ADMIN) {
    throw new ApiError(403, "Admin permission required");
  }

  return membership;
}
