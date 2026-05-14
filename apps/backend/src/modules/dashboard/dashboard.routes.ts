import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./dashboard.controller.js";
import { projectDashboardSchema } from "./dashboard.validation.js";

export const dashboardRoutes = Router();

dashboardRoutes.use(requireAuth);
dashboardRoutes.get("/dashboard", controller.getGlobalDashboard);
dashboardRoutes.get(
  "/projects/:projectId/dashboard",
  validate(projectDashboardSchema),
  controller.getProjectDashboard
);
