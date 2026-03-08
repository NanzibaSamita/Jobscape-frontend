"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { axiosInstance } from "@/lib/axios/axios";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";

export default function VerifyEmailConfirmPage() {
  const params = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const token = params.get("token");
  const emailFromQuery = params.get("email");

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
        // ✅ Verify email (works for both job seekers and employers)
        const res = await axiosInstance.post("/auth/verify-email/confirm", { 
          token: token 
        });

        if (cancelled) return;

        const verifiedEmail = res.data?.email ?? emailFromQuery ?? null;
        setEmail(verifiedEmail);

        const role = res.data?.role;
        const accessToken = res.data?.access_token;
        const cvUploadToken = res.data?.cv_upload_token;
        const nextStep = res.data?.next_step;

        setStatus("success");
        setMessage(res.data?.message || "Email verified successfully!");

        // ✅ Store access token
        if (accessToken) {
          localStorage.setItem("access_token", accessToken);
          localStorage.setItem("user_email", verifiedEmail);
          localStorage.setItem("user_role", role);
        }

        // ✅ Role-based redirect
        if (role === "EMPLOYER") {
          dispatch(showAlert({
            title: "Email Verified",
            message: "Please complete your profile.",
            type: "success"
          }));
          window.setTimeout(() => {
            router.replace("/employer/register/complete");
          }, 1500);
        } else if (role === "JOB_SEEKER" || role === "JOBSEEKER") {
          if (cvUploadToken) {
            localStorage.setItem("cv_upload_token", cvUploadToken);
          }
          dispatch(showAlert({
            title: "Email Verified",
            message: "Please upload your CV.",
            type: "success"
          }));
          window.setTimeout(() => {
            router.replace("/cv-upload");
          }, 1500);
        } else {
          // Admin or other roles
          router.replace("/dashboard");
        }

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
      dispatch(showAlert({
        title: "Missing Email",
        message: "Missing email address. Please go back and try again.",
        type: "error"
      }));
      return;
    }

    setResending(true);
    try {
      const res = await axiosInstance.post("/auth/verify-email/request", { 
        email: email 
      });
      dispatch(showAlert({
        title: "Success",
        message: res.data?.message || "Verification email sent again.",
        type: "success"
      }));
    } catch (err: any) {
      dispatch(showAlert({
        title: "Error",
        message: err?.response?.data?.detail || err?.response?.data?.message || "Failed to resend verification email.",
        type: "error"
      }));
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
          <p className="text-xs text-muted-foreground">Redirecting...</p>
        )}

        {status === "error" && (
          <div className="space-y-2">
            <button
              onClick={resendVerification}
              disabled={!canResend || resending}
              className="w-full bg-purple-600 text-white py-2 rounded-md disabled:opacity-50 hover:bg-purple-700"
            >
              {resending ? "Sending..." : "Resend verification email"}
            </button>

            <button
              onClick={() => router.push("/login")}
              className="w-full border py-2 rounded-md hover:bg-gray-100"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
