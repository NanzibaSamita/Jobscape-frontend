"use client";

import { useState, useEffect } from "react";
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
import { useAppDispatch } from "@/lib/store";
import { loginUser } from "@/lib/store/slices/authSlice";
import { REDIRECT_URLS } from "@/local/redirectDatas";

// ✅ Your backend route
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

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const router = useRouter();
  const dispatch = useAppDispatch();

  // ✅ ADD THIS: Redirect if already logged in with VALID token
  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("access_token");
      const role = localStorage.getItem("user_role");
      
      // If no token or role, don't do anything
      if (!token || !role) {
        return;
      }
      
      try {
        // Verify token is valid
        const meRes = await axiosInstance.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Token is valid, but DON'T try to fetch profile here
        // Just redirect to the appropriate page
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
        // Token is invalid or expired
        console.log("Token validation failed, clearing storage");
        localStorage.clear();
        sessionStorage.clear();
        // Stay on login page
      }
    }
    
    checkAuth();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  // ✅ Normalize user shape from FastAPI /auth/me
  const handleLogin = async (user: any, token: string, remember: boolean) => {
    console.log("🔵 handleLogin called");
    console.log("user:", user);
    console.log("role:", user?.role);

    const role = user?.role;

    // ✅ Store in localStorage (simple approach)
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_id", user.id);
    localStorage.setItem("user_email", user.email);
    localStorage.setItem("user_role", role);

    // ✅ Set server-side cookies
    await loginAction(user.id, user.email, token, null, role);

    // ✅ Handle redirects based on role
    if (redirectTo && redirectTo !== "" && redirectTo !== "null") {
      console.log("Redirecting to:", redirectTo);
      return window.location.href = redirectTo;
    }

    // ✅ Route based on role - CHECK PROFILE COMPLETION
    if (role === "EMPLOYER") {
      try {
        // Check if employer profile is completed
        const profileRes = await axiosInstance.get("/employer/profile/me");
        
        if (!profileRes.data.profile_completed) {
          console.log("Employer profile incomplete, redirecting to complete registration");
          return window.location.href = "/employer/register/complete";
        } else {
          console.log("Employer profile complete, redirecting to profile page");
          return window.location.href = "/employer/profile";
        }
      } catch (err) {
        console.error("Failed to fetch employer profile:", err);
        return window.location.href = "/employer/register/complete";
      }
    }

    if (role === "JOBSEEKER" || role === "JOB_SEEKER") {
      try {
        // Check if job seeker profile is completed
        const profileRes = await axiosInstance.get("/jobseeker/profile");
        
        if (!profileRes.data.profile_completed) {
          console.log("Job seeker profile incomplete, redirecting to CV upload");
          return window.location.href = "/cv-upload";
        } else {
          console.log("Job seeker profile complete, redirecting to profile");
          return window.location.href = "/jobseeker/profile";
        }
      } catch (err) {
        console.error("Failed to fetch job seeker profile:", err);
        return window.location.href = "/jobseeker/profile";
      }
    }

    // Fallback
    console.log("Redirecting to /");
    return window.location.href = "/";
  };

  const handelContinue = async (data: FormValues) => {
    setLoading(true);

    try {
      // OAuth2PasswordRequestForm expects urlencoded username/password
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

      // ✅ Call handleLogin with user data
      await handleLogin(meRes.data, token, !!data.rememberMe);

    } catch (err: any) {
      const axErr = err as AxiosError<any>;
      const detail =
        axErr?.response?.data?.detail ||
        axErr?.response?.data?.message ||
        "An error occurred while logging in.";

      // Optional routing based on message
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
