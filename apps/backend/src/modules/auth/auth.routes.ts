import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./auth.controller.js";
import { loginSchema, signupSchema } from "./auth.validation.js";

export const authRoutes = Router();

authRoutes.post("/signup", validate(signupSchema), controller.signup);
authRoutes.post("/login", validate(loginSchema), controller.login);
authRoutes.post("/logout", controller.logout);
authRoutes.get("/me", requireAuth, controller.me);
