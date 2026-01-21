"use client";

import { useState } from "react";
import Link from "next/link";
import { axiosInstance } from "@/lib/axios/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";

const REQUEST_RESET = "/auth/password-reset/request";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !isValidEmail(email.trim())) {
      setFormState("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setFormState("loading");

    try {
      await axiosInstance.post(REQUEST_RESET, { email: email.trim() });

      // Even if email doesn't exist, backend returns 200 w/ generic message.
      setFormState("success");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const message = err?.response?.data?.message;

      setFormState("error");
      setErrorMessage(detail || message || "Could not send reset link. Please try again.");
    }
  };

  if (formState === "success") {
    return (
      <div className="space-y-4">
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Check your email</strong>
            <br />
            If an account exists for <span className="font-medium">{email}</span>, we sent a password reset link.
          </AlertDescription>
        </Alert>

        <div className="text-center">
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Back to login
          </Link>
        </div>
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
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>

        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={formState === "loading"}
            autoComplete="email"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={formState === "loading"}>
        {formState === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending reset link...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Send reset link
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        You’ll receive an email with a link to reset your password.
      </p>
    </form>
  );
}
