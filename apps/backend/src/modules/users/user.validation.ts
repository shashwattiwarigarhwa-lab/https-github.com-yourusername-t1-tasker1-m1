import { z } from "zod";

export const searchUsersSchema = z.object({
  query: z.object({
    search: z.string().min(1).max(80).optional()
  })
});
