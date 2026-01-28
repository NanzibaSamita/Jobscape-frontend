"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/lib/axios/axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import BlackStyleButton from "@/components/custom-UI/Buttons/BlackStyleButton";

const completeRegistrationSchema = z.object({
  full_name: z.string().min(3, "Full name must be at least 3 characters"),
  job_title: z.string().min(2, "Job title is required"),
  work_email: z.string().email("Invalid work email"),
  company_name: z.string().min(2, "Company name is required"),
  company_website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  industry: z.string().min(2, "Industry is required"),
  location: z.string().min(2, "Location is required"),
  company_size: z.string().min(1, "Company size is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  company_type: z.enum(["REGISTERED", "STARTUP"]),
  is_startup: z.boolean().optional(),
  startup_stage: z.enum(["Idea", "MVP", "Early Revenue", "Growth"]).optional(),
  founded_year: z.number()
    .min(2000, "Founded year must be 2000 or later")
    .max(new Date().getFullYear(), "Founded year cannot be in the future")
    .optional(),
});

type CompleteRegistrationValues = z.infer<typeof completeRegistrationSchema>;

export default function CompleteEmployerRegistrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [companyType, setCompanyType] = useState<"REGISTERED" | "STARTUP">("REGISTERED");

  const form = useForm<CompleteRegistrationValues>({
    resolver: zodResolver(completeRegistrationSchema),
    defaultValues: {
      full_name: "",
      job_title: "",
      work_email: "",
      company_name: "",
      company_website: "",
      industry: "",
      location: "",
      company_size: "1-10",
      description: "",
      company_type: "REGISTERED",
      is_startup: false,
      startup_stage: "Idea",
      founded_year: 2024,
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Please log in first");
      router.push("/login");
    }
  }, [router]);

  const onSubmit = async (data: CompleteRegistrationValues) => {
    setIsLoading(true);

    try {
      const payload = {
        full_name: data.full_name,
        job_title: data.job_title,
        work_email: data.work_email,
        company_name: data.company_name,
        company_website: data.company_website || null,
        industry: data.industry,
        location: data.location,
        company_size: data.company_size,
        description: data.description,
        company_type: data.company_type,
        is_startup: companyType === "STARTUP",
        startup_stage: companyType === "STARTUP" ? data.startup_stage : null,
        founded_year: companyType === "STARTUP" && data.founded_year ? parseInt(String(data.founded_year)) : null,
      };

      console.log("📤 Sending payload:", payload);

      const response = await axiosInstance.post("/employer/register/complete", payload);

      toast.success("Registration completed successfully!");

      // ✅ Store the access token if returned
      if (response.data?.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
      }

      // ✅ Redirect to employer dashboard/profile
      router.push("/login"); // or "/employer/profile"

    } catch (error: any) {
      console.error("❌ Complete registration error:", error);
      
      if (error?.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          error.response.data.detail.forEach((err: any) => {
            toast.error(`${err.loc?.join(" → ")}: ${err.msg}`);
          });
        } else {
          toast.error(error.response.data.detail);
        }
      } else {
        toast.error("Failed to complete registration");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Tell us more about your company to finish registration
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="job_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="CEO, HR Manager, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="work_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@company.com" type="email" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use your official company email address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setCompanyType(value as "REGISTERED" | "STARTUP");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="REGISTERED">Registered Company</SelectItem>
                      <SelectItem value="STARTUP">Startup</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Input placeholder="Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Company Website {companyType === "REGISTERED" && "*"}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://company.com" {...field} />
                  </FormControl>
                  {companyType === "REGISTERED" && (
                    <FormDescription>Required for registered companies</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="Technology, Healthcare, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Dhaka, Bangladesh" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Size</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {companyType === "STARTUP" && (
              <>
                <FormField
                  control={form.control}
                  name="startup_stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Startup Stage</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Idea">Idea Stage</SelectItem>
                          <SelectItem value="MVP">MVP</SelectItem>
                          <SelectItem value="Early Revenue">Early Revenue</SelectItem>
                          <SelectItem value="Growth">Growth Stage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="founded_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Founded Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2024"
                          min={2000}
                          max={new Date().getFullYear()}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Must be 2000 or later</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your company..."
                      rows={4}
                      {...field}
                    />
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
                    Completing Registration...
                  </>
                ) : (
                  "Complete Registration"
                )
              }
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
