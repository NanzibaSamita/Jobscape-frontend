"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader, Loader2 } from "lucide-react";

import BlackStyleButton from "@/components/custom-UI/Buttons/BlackStyleButton";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { axiosInstance } from "@/lib/axios/axios";
import { loginAction } from "@/lib/cookies";

const LOGIN_URL = "/auth/login";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(true);  // ← Add this
  const hasCheckedAuth = useRef(false);  // ← Prevent multiple checks

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const router = useRouter();

  // ✅ FIXED: Only redirect if user has valid token and NO redirect param
  useEffect(() => {
    if (hasCheckedAuth.current) return;  // ← Prevent running twice
    hasCheckedAuth.current = true;

    async function checkAuth() {
      const token = localStorage.getItem("access_token");
      const role = localStorage.getItem("user_role");
      
      // If no token, user needs to login
      if (!token || !role) {
        setChecking(false);
        return;
      }
      
      // ✅ If there's a redirect param, user was sent here on purpose
      // Don't auto-redirect them away
      if (redirectTo && redirectTo !== "/") {
        console.log("User has redirect param, staying on login page");
        setChecking(false);
        return;
      }
      
      try {
        // Verify token is still valid
        await axiosInstance.get("/auth/me");
        
        // Token is valid, redirect to appropriate page
        console.log("User already logged in, redirecting...");
        
        if (role === "ADMIN") {
          window.location.href = "/admin";
        } else if (role === "EMPLOYER") {
          window.location.href = "/employer/profile";
        } else if (role === "JOBSEEKER" || role === "JOB_SEEKER") {
          window.location.href = "/jobseeker/profile";
        } else {
          window.location.href = "/";
        }
      } catch (error) {
        // Token is invalid, clear and stay on login
        console.log("Token invalid, clearing storage");
        localStorage.clear();
        sessionStorage.clear();
        setChecking(false);
      }
    }
    
    checkAuth();
  }, [redirectTo]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const handleLogin = async (user: any, token: string, remember: boolean) => {
    const role = user?.role;

    // Store in localStorage
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_id", user.id);
    localStorage.setItem("user_email", user.email);
    localStorage.setItem("user_role", role);

    // Set server-side cookies
    await loginAction(user.id, user.email, token, null, role);

    // Handle redirects
    if (redirectTo && redirectTo !== "/" && redirectTo !== "null") {
      return window.location.href = redirectTo;
    }

    // Route based on role
    if (role === "EMPLOYER") {
      try {
        const profileRes = await axiosInstance.get("/employer/profile/me");
        
        if (!profileRes.data.profile_completed) {
          return window.location.href = "/employer/register/complete";
        } else {
          return window.location.href = "/employer/profile";
        }
      } catch (err) {
        return window.location.href = "/employer/register/complete";
      }
    }

    if (role === "JOBSEEKER" || role === "JOB_SEEKER") {
      try {
        const profileRes = await axiosInstance.get("/jobseeker/profile");
        
        if (!profileRes.data.profile_completed) {
          return window.location.href = "/cv-upload";
        } else {
          return window.location.href = "/jobseeker/profile";
        }
      } catch (err) {
        return window.location.href = "/jobseeker/profile";
      }
    }

    return window.location.href = "/";
  };

  const handelContinue = async (data: FormValues) => {
    setLoading(true);

    try {
      const body = new URLSearchParams();
      body.append("username", data.email);
      body.append("password", data.password);

      const loginRes = await axiosInstance.post(LOGIN_URL, body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const token = loginRes?.data?.access_token;

      if (!token) {
        toast.error("Login failed: missing access token from server.");
        return;
      }

      // Fetch user profile
      const meRes = await axiosInstance.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      await handleLogin(meRes.data, token, !!data.rememberMe);

    } catch (err: any) {
      const axErr = err as AxiosError<any>;
      const detail =
        axErr?.response?.data?.detail ||
        axErr?.response?.data?.message ||
        "An error occurred while logging in.";

      if (typeof detail === "string") {
        const d = detail.toLowerCase();
        if (d.includes("verify your email")) {
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } else if (d.includes("upload") || d.includes("cv")) {
          router.push("/signup");
        }
      }

      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show loading while checking auth
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-white px-4">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-[2]">
          <Loader className="h-6 w-6 text-slate-400 animate-spin" />
        </div>
      )}

      <div className="w-full max-w-sm flex flex-col">
        <div className="mb-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold">
            Welcome Back <br /> JBscape!
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handelContinue)} className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="accent-primary w-4 h-4"
                      />
                    </FormControl>
                    <FormLabel className="text-xs font-light cursor-pointer">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />

              <button
                type="button"
                className="text-xs font-light text-muted-foreground hover:text-primary focus:outline-none"
                onClick={() => router.push("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

            <BlackStyleButton
              fullWidth
              disabled={loading}
              title={loading ? <Loader2 className="animate-spin" /> : "Sign in"}
            />
          </form>
        </Form>

        <p className="text-sm font-light text-center mt-3">
          Don&apos;t have an account yet?{" "}
          <span
            className="cursor-pointer text-primary hover:underline"
            onClick={() => router.push("/signup")}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
