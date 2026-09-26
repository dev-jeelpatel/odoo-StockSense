import { Request, Response } from "express";
import * as authService from "./auth.service";

export async function signupHandler(req: Request, res: Response) {
  const result = await authService.signup(req.body);
  res.status(201).json(result);
}

export async function loginHandler(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.status(200).json(result);
}

export async function forgotPasswordHandler(req: Request, res: Response) {
  await authService.forgotPassword(req.body);
  res.status(200).json({ message: "If that email is registered, a reset code has been sent." });
}

export async function verifyOtpHandler(req: Request, res: Response) {
  await authService.verifyOtp(req.body);
  res.status(200).json({ message: "Code verified" });
}

export async function resetPasswordHandler(req: Request, res: Response) {
  await authService.resetPassword(req.body);
  res.status(200).json({ message: "Password reset successfully" });
}
