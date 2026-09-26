import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOtpSchema,
  type ForgotPasswordFormValues,
  type ResetPasswordFormValues,
  type VerifyOtpFormValues,
} from "@/lib/auth-schemas";
import { AuthLayout } from "./AuthLayout";

type Step = "email" | "otp" | "reset";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const emailForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const otpForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });
  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  async function onSubmitEmail(values: ForgotPasswordFormValues) {
    setSubmitting(true);
    try {
      await apiClient.post("/auth/forgot-password", values);
      setEmail(values.email);
      toast.success("If that email is registered, a reset code has been sent.");
      setStep("otp");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitOtp(values: VerifyOtpFormValues) {
    setSubmitting(true);
    try {
      await apiClient.post("/auth/verify-otp", { email, otp: values.otp });
      setOtp(values.otp);
      setStep("reset");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Invalid or expired code"));
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitReset(values: ResetPasswordFormValues) {
    setSubmitting(true);
    try {
      await apiClient.post("/auth/reset-password", { email, otp, newPassword: values.newPassword });
      toast.success("Password reset successfully. Sign in with your new password.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "email") {
    return (
      <AuthLayout title="Forgot password" description="Enter your email and we'll send you a reset code.">
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@company.com" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Sending..." : "Send reset code"}
            </Button>
          </form>
        </Form>
        <p className="text-center text-sm">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthLayout>
    );
  }

  if (step === "otp") {
    return (
      <AuthLayout title="Enter reset code" description={`We sent a 6-digit code to ${email}.`}>
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="space-y-4">
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>6-digit code</FormLabel>
                  <FormControl>
                    <Input inputMode="numeric" maxLength={6} placeholder="123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Verifying..." : "Verify code"}
            </Button>
          </form>
        </Form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" description="Choose a new password for your account.">
      <Form {...resetForm}>
        <form onSubmit={resetForm.handleSubmit(onSubmitReset)} className="space-y-4">
          <FormField
            control={resetForm.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={resetForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Re-enter password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
