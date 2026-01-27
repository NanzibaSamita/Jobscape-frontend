"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { axiosInstance } from "@/lib/axios/axios";
import { toast } from "react-toastify";

export default function VerifyEmailConfirmPage() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token");
  const emailFromQuery = params.get("email"); // optional but helps resend UX

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const [email, setEmail] = useState<string | null>(emailFromQuery);
  const [resending, setResending] = useState(false);

  const canResend = useMemo(() => !!email, [email]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token) {
        setStatus("error");
        setMessage("Missing token.");
        return;
      }

      try {
        const res = await axiosInstance.post("/auth/verify-email/confirm", { token });

        if (cancelled) return;

        // backend returns: { message, email, cv_upload_token }
        const verifiedEmail = res.data?.email ?? emailFromQuery ?? null;
        setEmail(verifiedEmail);

        const cvUploadToken = res.data?.cv_upload_token;
        if (!cvUploadToken) {
          // This means backend isn't returning it or you're hitting old backend
          setStatus("error");
          setMessage("Verification succeeded, but CV upload authorization token is missing. Please resend verification email.");
          return;
        }

        // ✅ STORE TOKEN for /cv-upload
        localStorage.setItem("cv_upload_token", cvUploadToken);

        setStatus("success");
        setMessage(res.data?.message || "You are verified. Redirecting to CV upload...");

        window.setTimeout(() => {
          router.replace("/cv-upload");
        }, 1200);
      } catch (err: any) {
        if (cancelled) return;

        setStatus("error");
        setMessage(err?.response?.data?.detail || "Verification failed or token expired.");

        const maybeEmail = err?.response?.data?.email;
        if (maybeEmail && typeof maybeEmail === "string") setEmail(maybeEmail);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [token, emailFromQuery, router]);

  const resendVerification = async () => {
    if (!email) {
      toast.error("Missing email address. Please go back to the verify-email page and resend using your email.");
      return;
    }

    setResending(true);
    try {
      const res = await axiosInstance.post("/auth/verify-email/request", { email });
      toast.success(res.data?.message || "Verification email sent again.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to resend verification email."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background text-foreground">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">
          {status === "loading"
            ? "Verifying..."
            : status === "success"
            ? "Email Verified ✅"
            : "Verification Failed"}
        </h1>

        <p className="text-sm text-muted-foreground">{message}</p>

        {status === "success" && (
          <p className="text-xs text-muted-foreground">Redirecting to CV upload...</p>
        )}

        {status === "error" && (
          <div className="space-y-2">
            <button
              onClick={resendVerification}
              disabled={!canResend || resending}
              className="w-full bg-primary text-primary-foreground py-2 rounded-md disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend verification email"}
            </button>

            <button
              onClick={() =>
                router.push(email ? `/verify-email?email=${encodeURIComponent(email)}` : "/verify-email")
              }
              className="w-full border py-2 rounded-md"
            >
              Back to verify page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
