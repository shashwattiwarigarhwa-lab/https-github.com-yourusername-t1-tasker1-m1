import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./project.controller.js";
import {
  addMemberSchema,
  createProjectSchema,
  projectIdParam,
  removeMemberSchema,
  updateProjectSchema
} from "./project.validation.js";

export const projectRoutes = Router();

projectRoutes.use(requireAuth);

projectRoutes.get("/", controller.listProjects);
projectRoutes.post("/", validate(createProjectSchema), controller.createProject);
projectRoutes.get("/:projectId", validate(projectIdParam), controller.getProject);
projectRoutes.patch("/:projectId", validate(updateProjectSchema), controller.updateProject);
projectRoutes.delete("/:projectId", validate(projectIdParam), controller.deleteProject);
projectRoutes.post("/:projectId/members", validate(addMemberSchema), controller.addMember);
projectRoutes.delete(
  "/:projectId/members/:userId",
  validate(removeMemberSchema),
  controller.removeMember
);
