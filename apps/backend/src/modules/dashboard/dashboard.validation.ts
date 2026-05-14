import { z } from "zod";

export const projectDashboardSchema = z.object({
  params: z.object({
    projectId: z.string().uuid()
  })
});
