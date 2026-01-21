"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios/axios";

export default function VerifyEmailConfirmPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    async function run() {
      if (!token) {
        setStatus("error");
        setMessage("Missing token.");
        return;
      }

      try {
        const res = await axiosInstance.post("/auth/verify-email/confirm", { token });
        setStatus("success");
        setMessage(res.data?.message || "Email verified!");

        // Optional: redirect after a short delay
        setTimeout(() => router.push("/login"), 1200);
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.response?.data?.detail || "Verification failed or token expired.");
      }
    }
    run();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background text-foreground">
      <div className="max-w-md w-full text-center space-y-3">
        <h1 className="text-2xl font-semibold">
          {status === "loading" ? "Verifying..." : status === "success" ? "Verified ✅" : "Error"}
        </h1>
        <p className="text-sm text-muted-foreground">{message}</p>

        {status === "error" && (
          <button
            className="rounded-md bg-primary text-primary-foreground py-2 px-4"
            onClick={() => router.push("/verify-email")}
          >
            Go back
          </button>
        )}
      </div>
    </div>
  );
}
