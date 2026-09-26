import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { generateOtp, hashOtp, compareOtp } from "../../utils/otp";
import { sendOtpEmail } from "../../utils/mailer";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/tokens";
import type {
  ForgotPasswordInput,
  LoginInput,
  RefreshInput,
  ResetPasswordInput,
  SignupInput,
  VerifyOtpInput,
} from "./auth.schemas";

function toPublicUser(user: { id: string; name: string; email: string; role: string }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function signup(input: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw AppError.conflict("An account with this email already exists", { email: "Already registered" });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash, role: input.role },
  });

  return issueSession(user);
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw AppError.unauthorized("Invalid email or password");
  }

  return issueSession(user);
}

export async function refresh(input: RefreshInput) {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(input.refreshToken);
  } catch {
    throw AppError.unauthorized("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw AppError.unauthorized("Invalid or expired refresh token");
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  return { accessToken };
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  // Always respond the same way whether or not the account exists, to avoid leaking which emails are registered.
  if (!user) return;

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);

  await prisma.passwordResetOtp.create({
    data: { userId: user.id, otpHash, expiresAt },
  });

  await sendOtpEmail(user.email, otp);
}

async function findValidOtp(userId: string, otp: string) {
  const candidates = await prisma.passwordResetOtp.findMany({
    where: { userId, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  for (const candidate of candidates) {
    if (await compareOtp(otp, candidate.otpHash)) {
      return candidate;
    }
  }
  return null;
}

export async function verifyOtp(input: VerifyOtpInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw AppError.badRequest("Invalid or expired code", { otp: "Invalid or expired code" });
  }

  const otpRecord = await findValidOtp(user.id, input.otp);
  if (!otpRecord) {
    throw AppError.badRequest("Invalid or expired code", { otp: "Invalid or expired code" });
  }
}

export async function resetPassword(input: ResetPasswordInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw AppError.badRequest("Invalid or expired code", { otp: "Invalid or expired code" });
  }

  const otpRecord = await findValidOtp(user.id, input.otp);
  if (!otpRecord) {
    throw AppError.badRequest("Invalid or expired code", { otp: "Invalid or expired code" });
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.passwordResetOtp.update({ where: { id: otpRecord.id }, data: { consumedAt: new Date() } }),
  ]);
}

function issueSession(user: { id: string; name: string; email: string; role: "MANAGER" | "STAFF" }) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id });
  return { user: toPublicUser(user), accessToken, refreshToken };
}
