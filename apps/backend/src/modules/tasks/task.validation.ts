import { z } from "zod";

const taskBody = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(1000).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  assignedToId: z.string().uuid().optional().nullable()
});

export const listTasksSchema = z.object({
  params: z.object({
    projectId: z.string().uuid()
  }),
  query: z.object({
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional()
  })
});

export const createTaskSchema = z.object({
  params: z.object({
    projectId: z.string().uuid()
  }),
  body: taskBody
});

export const updateTaskSchema = z.object({
  params: z.object({
    taskId: z.string().uuid()
  }),
  body: taskBody.partial()
});

export const taskIdParam = z.object({
  params: z.object({
    taskId: z.string().uuid()
  })
});

export const updateStatusSchema = z.object({
  params: z.object({
    taskId: z.string().uuid()
  }),
  body: z.object({
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"])
  })
});
