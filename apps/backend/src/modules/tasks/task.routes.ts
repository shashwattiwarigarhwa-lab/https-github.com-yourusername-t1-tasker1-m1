import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./task.controller.js";
import {
  createTaskSchema,
  listTasksSchema,
  taskIdParam,
  updateStatusSchema,
  updateTaskSchema
} from "./task.validation.js";

export const taskRoutes = Router();

taskRoutes.use(requireAuth);

taskRoutes.get("/projects/:projectId/tasks", validate(listTasksSchema), controller.listTasks);
taskRoutes.post("/projects/:projectId/tasks", validate(createTaskSchema), controller.createTask);
taskRoutes.get("/tasks/:taskId", validate(taskIdParam), controller.getTask);
taskRoutes.patch("/tasks/:taskId", validate(updateTaskSchema), controller.updateTask);
taskRoutes.delete("/tasks/:taskId", validate(taskIdParam), controller.deleteTask);
taskRoutes.patch("/tasks/:taskId/status", validate(updateStatusSchema), controller.updateTaskStatus);
