"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios/axios";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const emailParam = params.get("email");
  const token = params.get("token"); // backward-compat: old emails may still link here

  const email = useMemo(() => (emailParam ? emailParam.trim() : ""), [emailParam]);

  const [loading, setLoading] = useState(false);

  // ✅ If user opened an email link like /verify-email?token=...
  // Redirect them to the real confirm page that actually calls backend confirm API.
  useEffect(() => {
    if (!token) return;

    const next = `/verify-email/confirm?token=${encodeURIComponent(token)}${
      email ? `&email=${encodeURIComponent(email)}` : ""
    }`;

    router.replace(next);
  }, [token, email, router]);

  const resendVerification = async () => {
    if (!email) {
      dispatch(showAlert({
        title: "Missing Email",
        message: "Missing email address. Please go back to signup and try again.",
        type: "error"
      }));
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/verify-email/request", { email });
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background text-foreground">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">Verify your email</h1>

        <p className="text-sm text-muted-foreground">
          {email ? (
            <>
              We sent a verification link to <b>{email}</b>. Verify your account to proceed.
            </>
          ) : (
            <>We sent you a verification link. Verify your account to proceed.</>
          )}
        </p>

        <button
          onClick={resendVerification}
          disabled={loading || !email}
          className="w-full bg-primary text-white py-2 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Resend verification email"}
        </button>

        <button
          onClick={() => router.push("/signup")}
          className="w-full border py-2 rounded-md"
        >
          Back to signup
        </button>
      </div>
    </div>
  );
}
