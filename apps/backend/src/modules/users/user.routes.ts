import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { searchUsers } from "./user.controller.js";
import { searchUsersSchema } from "./user.validation.js";

export const userRoutes = Router();

userRoutes.use(requireAuth);
userRoutes.get("/", validate(searchUsersSchema), searchUsers);
