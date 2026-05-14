import { ProjectRole } from "../types/enums";

import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

export const requireProjectRole =
  (...allowedRoles: ProjectRole[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.projectId as string;

      if (!req.user) {
        throw new ApiError(401, "Authentication required");
      }

      if (!projectId) {
        throw new ApiError(400, "Project id is required");
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: req.user.id,
            projectId
          }
        }
      });

      if (!membership) {
        throw new ApiError(403, "You are not a member of this project");
      }

      if (!allowedRoles.includes(membership.role)) {
        throw new ApiError(403, "You do not have permission to perform this action");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
