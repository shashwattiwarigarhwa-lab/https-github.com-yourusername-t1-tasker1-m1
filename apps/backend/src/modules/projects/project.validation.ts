import { z } from "zod";

export const projectIdParam = z.object({
  params: z.object({
    projectId: z.string().uuid()
  })
});

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    description: z.string().max(500).optional()
  })
});

export const updateProjectSchema = z.object({
  params: z.object({
    projectId: z.string().uuid()
  }),
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    description: z.string().max(500).optional().nullable()
  })
});

export const addMemberSchema = z.object({
  params: z.object({
    projectId: z.string().uuid()
  }),
  body: z.object({
    email: z.string().email().toLowerCase(),
    role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER")
  })
});

export const removeMemberSchema = z.object({
  params: z.object({
    projectId: z.string().uuid(),
    userId: z.string().uuid()
  })
});
