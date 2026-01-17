"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeOff, Eye, Globe, Slack, Mail, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { axiosInstance } from "@/lib/axios/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryCodes } from "@/local/countries";
import BlackStyleButton from "@/components/custom-UI/Buttons/BlackStyleButton";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// ✅ FastAPI auth endpoints (router prefix="/auth")
const REGISTER_EMPLOYER_URL = "/auth/register/employer";
const REQUEST_VERIFY_EMAIL_URL = "/auth/verify-email/request";

// Form schema with validation
const userInfoSchema = z.object({
  full_name: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters." }),

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

  email: z.string().email({
    message: "Please enter a valid email address.",
  }),

  company_name: z
    .string()
    .min(2, { message: "Company name must be at least 2 characters." })
    .max(100, { message: "Company name must not exceed 100 characters." }),

  country_id: z.string().min(1, { message: "Please select a country." }),
  sector_id: z.string().min(1, { message: "Please select a sector." }),

  user_mobile: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits." })
    .max(15, { message: "Phone number must not exceed 15 digits." }),

  user_mobile_code: z
    .string()
    .min(1, { message: "Please select a country code." }),
});

type UserInfoValues = z.infer<typeof userInfoSchema>;

export function Inputs({
  countries,
  sectors,
  isLoading,
  setIsLoading,
}: {
  countries: { id: string; name: string }[];
  sectors: { id: string; name: string }[];
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  // ✅ Verify-link flow UI state
  const [verificationSent, setVerificationSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const form = useForm<UserInfoValues>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      user_mobile_code: "+880",
      email: "",
      full_name: "",
      password: "",
      company_name: "",
      country_id: "",
      sector_id: "",
      user_mobile: "",
    },
  });

  const selectedCountry = useMemo(() => {
    return countryCodes.find((c) => c.code === form.watch("user_mobile_code"));
  }, [form]);

  async function requestVerificationEmail(email: string) {
    setResendLoading(true);
    try {
      await axiosInstance.post(REQUEST_VERIFY_EMAIL_URL, { email });
      toast.success("Verification email sent. Please check your inbox.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to send verification email."
      );
    } finally {
      setResendLoading(false);
    }
  }

  async function onSubmit(data: UserInfoValues) {
    setIsLoading(true);

    try {
      // ✅ FastAPI expects: email, password, full_name
      await axiosInstance.post(REGISTER_EMPLOYER_URL, {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
      });

      // ✅ Save employer extra fields locally for later profile completion (after login)
      // (You can read this in your profile-update page and POST to your own profile endpoint)
      sessionStorage.setItem(
        "pending_employer_profile",
        JSON.stringify({
          company_name: data.company_name,
          country_id: data.country_id,
          sector_id: data.sector_id,
          user_mobile: data.user_mobile,
          user_mobile_code: data.user_mobile_code.replace("-", ""),
        })
      );

      setSentToEmail(data.email);
      setVerificationSent(true);
      toast.success("Account created. Please verify your email.");
    } catch (err: any) {
      const status = err?.response?.status;
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "An error occurred while creating the account.";

      // backend uses 400 for "Email already registered"
      if (status === 400) {
        form.setError("email", { type: "manual", message: detail });
      } else {
        toast.error(detail);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ✅ After submit: show verify-link screen (no OTP)
  if (verificationSent) {
    return (
      <div className="w-full space-y-4">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Mail className="w-6 h-6 text-[#7C3AED]" />
          </div>

          <h2 className="text-2xl font-bold">Verify your email</h2>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to{" "}
            <span className="font-medium text-black">{sentToEmail}</span>.
            <br />
            Open your email and click the link to verify your account.
          </p>
          <p className="text-xs text-muted-foreground">
            If you don’t see it, check Spam/Junk.
          </p>
        </div>

        <div className="space-y-3">
          <BlackStyleButton
            fullWidth
            disabled={resendLoading}
            onClick={() => requestVerificationEmail(sentToEmail)}
            title={resendLoading ? "Sending..." : "Resend verification email"}
          />

          <button
            type="button"
            className="w-full text-sm text-primary hover:underline"
            onClick={() => router.push("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-scroll">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1 m-1">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem className="w-full">
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
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country_id"
            rules={{ required: "Please select a country" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Location</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <div className="flex items-center justify-start gap-2 min-w-0 flex-1">
                        <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="truncate">
                          <SelectValue placeholder="Select country" />
                        </div>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem
                          key={`${country.id}-country`}
                          value={country.id.toString()}
                        >
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sector_id"
            rules={{ required: "Please select a sector" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Sector</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <div className="flex items-center justify-start gap-2 min-w-0 flex-1">
                        <Slack className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="truncate">
                          <SelectValue placeholder="Select sector" />
                        </div>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem
                          key={`${sector.id}-sector`}
                          value={sector.id.toString()}
                        >
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work e-mail</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="user_mobile_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-600">
                  Phone number
                </FormLabel>

                <FormControl>
                  <div className="flex items-center border border-input rounded-lg bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="border-0 shadow-none focus:ring-0 w-auto px-3 rounded-r-none">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {selectedCountry?.flag}
                          </span>
                          <span className="font-medium">
                            {field.value.replace("-", "")}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((country) => (
                          <SelectItem
                            key={`${country.code}-${country.name}`}
                            value={country.code}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{country.flag}</span>
                              <span className="font-medium">
                                {country.code}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {country.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="w-px h-6 bg-border" />

                    <FormField
                      control={form.control}
                      name="user_mobile"
                      render={({ field: phoneField }) => (
                        <FormControl>
                          <Input
                            placeholder="01856459865"
                            value={phoneField.value}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, "");
                              phoneField.onChange(digits);
                            }}
                            className="border-0 shadow-none focus-visible:ring-0 flex-1 px-3 rounded-l-none"
                          />
                        </FormControl>
                      )}
                    />
                  </div>
                </FormControl>

                <FormMessage />
                <FormField
                  control={form.control}
                  name="user_mobile"
                  render={() => <FormMessage />}
                />
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

          <div className="pt-3">
            <BlackStyleButton
              fullWidth
              disabled={isLoading}
              title={
                isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Create Account"
                )
              }
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
