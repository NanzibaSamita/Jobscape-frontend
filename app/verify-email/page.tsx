"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios/axios";
import { useState } from "react";
import { toast } from "react-toastify";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email");

  const [loading, setLoading] = useState(false);

  const resendVerification = async () => {
    if (!email) {
      toast.error("Missing email address.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/auth/verify-email/request", {
        email,
      });

      toast.success("Verification email sent again.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to resend verification email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">Verify your email</h1>

        <p className="text-sm text-muted-foreground">
          We sent a verification link to <b>{email}</b>.  
          Open it to activate your account.
        </p>

        <button
          onClick={resendVerification}
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-md"
        >
          {loading ? "Sending..." : "Resend verification email"}
        </button>

        <button
          onClick={() => router.push("/login")}
          className="w-full border py-2 rounded-md"
        >
          Go to login
        </button>
      </div>
    </div>
  );
}
