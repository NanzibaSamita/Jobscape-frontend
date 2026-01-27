"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Loader, Loader2 } from "lucide-react";
import { axiosInstance } from "@/lib/axios/axios";
import BlackStyleButton from "@/components/custom-UI/Buttons/BlackStyleButton";
import { toast } from "react-toastify";

const REGISTER_JOB_SEEKER_URL = "/auth/register/job-seeker/basic";
const REGISTER_EMPLOYER_URL = "/employer/register";

const userInfoSchema = z
  .object({
    full_name: z
      .string()
      .min(3, { message: "Full name must be at least 3 characters." })
      .max(100, { message: "Full name must not exceed 100 characters." }),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter.",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character.",
      }),

    confirmPassword: z.string(),
    email: z.string().email({ message: "Please enter a valid email address." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type UserInfoValues = z.infer<typeof userInfoSchema>;

interface UserInfoFormProps {
  email: string;
  onComplete: () => void;
  editableEmail?: boolean;
  recruiter?: boolean;
  defaultValues?: { [key: string]: any };
}

export default function UserInfoForm({
  email: rawEmail,
  onComplete,
  defaultValues,
  editableEmail = false,
  recruiter = false,
}: UserInfoFormProps) {
  const [email, setEmail] = useState<string>(rawEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const form = useForm<UserInfoValues>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      email: !editableEmail ? email : defaultValues?.email || "",
      full_name: defaultValues?.name || "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: UserInfoValues) {
    setIsLoading(true);
    setEmail(data.email);

    const payload = {
      email: data.email,
      password: data.password,
      full_name: data.full_name.trim(),
    };

    try {
      const url = recruiter ? REGISTER_EMPLOYER_URL : REGISTER_JOB_SEEKER_URL;

      const res = await axiosInstance.post(url, payload);

      // ✅ Backend now sends verification email immediately
      const msg =
        res.data?.message || "Account created. Please verify your email to continue.";
      toast.success(msg);

      // ✅ Send to waiting screen (resend available there)
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);

      // ✅ No more "upload step" here; keep callback safe for old UI
      // (PurposeSwitcher may still pass a noop; this won't break anything)
      onComplete?.();
    } catch (err: any) {
      const status = err?.response?.status;
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "An error occurred while creating the account.";

      if (status === 400) {
        // If backend returns "already registered but not verified", still route to verify screen
        const maybeMsg = String(detail || "");
        if (maybeMsg.toLowerCase().includes("not verified")) {
          toast.info(maybeMsg);
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } else {
          form.setError("email", {
            type: "manual",
            message: detail || "Email already registered",
          });
        }
      } else {
        toast.error(detail);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      {isLoading && (
        <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center backdrop-blur-sm z-[2]">
          <Loader className="h-6 w-6 text-slate-400 animate-spin duration-1000" />
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 m-1">
        {editableEmail && (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
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
                    placeholder="Create a password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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

        <BlackStyleButton
          fullWidth
          disabled={isLoading}
          title={
            isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account
              </>
            ) : (
              "Continue"
            )
          }
        />
      </form>
    </Form>
  );
}
