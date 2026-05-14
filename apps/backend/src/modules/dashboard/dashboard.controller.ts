import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as dashboardService from "./dashboard.service.js";

export const getGlobalDashboard = asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await dashboardService.getGlobalDashboard(req.user!.id);
  res.json({ dashboard });
});

export const getProjectDashboard = asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await dashboardService.getProjectDashboard(req.params.projectId as string, req.user!.id);
  res.json({ dashboard });
});
