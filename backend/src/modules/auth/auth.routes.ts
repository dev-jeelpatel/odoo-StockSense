import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyOtpSchema,
} from "./auth.schemas";
import {
  forgotPasswordHandler,
  loginHandler,
  resetPasswordHandler,
  signupHandler,
  verifyOtpHandler,
} from "./auth.controller";

export const authRouter = Router();

authRouter.post("/signup", validateRequest({ body: signupSchema }), asyncHandler(signupHandler));
authRouter.post("/login", validateRequest({ body: loginSchema }), asyncHandler(loginHandler));
authRouter.post(
  "/forgot-password",
  validateRequest({ body: forgotPasswordSchema }),
  asyncHandler(forgotPasswordHandler),
);
authRouter.post("/verify-otp", validateRequest({ body: verifyOtpSchema }), asyncHandler(verifyOtpHandler));
authRouter.post(
  "/reset-password",
  validateRequest({ body: resetPasswordSchema }),
  asyncHandler(resetPasswordHandler),
);
