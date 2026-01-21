"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Loader2, Eye, EyeOff, CheckCircle, AlertCircle, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { validatePassword } from "./validation";
import { axiosInstance } from "@/lib/axios/axios";

type FormState = "idle" | "loading" | "success" | "error";

const SUBMIT_PASSWORD = "/auth/password-reset/confirm";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [resetToken, setResetToken] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setErrorMessage("Invalid reset link. Please request a new password reset.");
      setFormState("error");
      return;
    }
    setResetToken(token);
  }, [searchParams]);

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
    return strength;
  };

  const getStrengthText = (strength: number) => {
    if (strength < 40) return "Weak";
    if (strength < 80) return "Medium";
    return "Strong";
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!resetToken) {
      setFormState("error");
      setErrorMessage("Invalid reset token.");
      return;
    }

    if (!passwordValidation.isValid) {
      setFormState("error");
      setErrorMessage("Please fix the password requirements.");
      return;
    }

    if (!passwordsMatch) {
      setFormState("error");
      setErrorMessage("Passwords do not match.");
      return;
    }

    setFormState("loading");

    try {
      const res = await axiosInstance.post(SUBMIT_PASSWORD, {
        token: resetToken,
        new_password: password,
      });

      // Optional: log response
      // console.log("Reset response:", res.data);

      setFormState("success");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const message = err?.response?.data?.message;

      setFormState("error");
      setErrorMessage(detail || message || "Reset failed. Please try again.");
    }
  };

  if (formState === "success") {
    return (
      <div className="space-y-4">
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Password reset successful!</strong>
            <br />
            Your password has been updated. Redirecting to login…
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formState === "error" && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          New Password
        </Label>

        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            disabled={formState === "loading"}
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={formState === "loading"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {password && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Password strength:</span>
              <span
                className={`text-xs font-medium ${
                  passwordStrength < 40
                    ? "text-red-600"
                    : passwordStrength < 80
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {getStrengthText(passwordStrength)}
              </span>
            </div>
            <Progress value={passwordStrength} className="h-2" />
          </div>
        )}

        {password && !passwordValidation.isValid && (
          <div className="space-y-1">
            {passwordValidation.errors.map((error: string, index: number) => (
              <p key={index} className="text-xs text-red-600 dark:text-red-400">
                • {error}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm New Password
        </Label>

        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`pl-10 pr-10 ${
              confirmPassword && !passwordsMatch ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            disabled={formState === "loading"}
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={formState === "loading"}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {confirmPassword && !passwordsMatch && (
          <p className="text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
        )}

        {confirmPassword && passwordsMatch && (
          <p className="text-xs text-green-600 dark:text-green-400">✓ Passwords match</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={
          formState === "loading" ||
          !passwordValidation.isValid ||
          !passwordsMatch ||
          !password ||
          !confirmPassword ||
          !resetToken
        }
      >
        {formState === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating Password...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Update Password
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Make sure to use a strong password that you haven&apos;t used before.
        </p>
      </div>
    </form>
  );
}
