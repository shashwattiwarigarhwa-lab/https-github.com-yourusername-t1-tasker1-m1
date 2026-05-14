import { TaskPriority, TaskStatus } from "../../types/enums";
import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler.js";
import * as taskService from "./task.service.js";

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await taskService.listTasks(req.params.projectId as string, req.user!.id, {
    status: req.query.status as TaskStatus | undefined,
    priority: req.query.priority as TaskPriority | undefined
  });
  res.json({ tasks });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.params.projectId as string, req.user!.id, req.body);
  res.status(201).json({ task });
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.getTask(req.params.taskId as string, req.user!.id);
  res.json({ task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.updateTask(req.params.taskId as string, req.user!.id, req.body);
  res.json({ task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await taskService.deleteTask(req.params.taskId as string, req.user!.id);
  res.status(204).send();
});

export const updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.updateTaskStatus(req.params.taskId as string, req.user!.id, req.body.status);
  res.json({ task });
});
