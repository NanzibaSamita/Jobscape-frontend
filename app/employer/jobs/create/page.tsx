// app/employer/jobs/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axios/axios";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

// ✅ Validation Schema
const jobCreateSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  salary_min: z.number().min(0, "Minimum salary must be positive").nullable(),
  salary_max: z.number().min(0, "Maximum salary must be positive").nullable(),
  location: z.string().min(2, "Location is required"),
  work_mode: z.enum(["ONSITE", "REMOTE", "HYBRID"], {
    required_error: "Work mode is required",
  }),
  job_type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"], {
    required_error: "Job type is required",
  }),
  experience_level: z.enum(["ENTRY", "MID", "SENIOR", "LEAD"], {
    required_error: "Experience level is required",
  }),
  required_skills: z.array(z.string()).min(1, "Add at least one required skill"),
  preferred_skills: z.array(z.string()).optional(),
  is_fresh_graduate_friendly: z.boolean().default(false),
  application_deadline: z.string().min(1, "Application deadline is required"),
}).refine(
  (data) => {
    if (data.salary_min && data.salary_max) {
      return data.salary_max >= data.salary_min;
    }
    return true;
  },
  {
    message: "Maximum salary must be greater than or equal to minimum salary",
    path: ["salary_max"],
  }
);

type JobCreateValues = z.infer<typeof jobCreateSchema>;

export default function CreateJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [requiredSkillInput, setRequiredSkillInput] = useState("");
  const [preferredSkillInput, setPreferredSkillInput] = useState("");

  const form = useForm<JobCreateValues>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      salary_min: null,
      salary_max: null,
      location: "",
      work_mode: undefined,
      job_type: undefined,
      experience_level: undefined,
      required_skills: [],
      preferred_skills: [],
      is_fresh_graduate_friendly: false,
      application_deadline: "",
    },
  });

  // Skills management
  const addRequiredSkill = () => {
    if (requiredSkillInput.trim()) {
      const currentSkills = form.getValues("required_skills");
      if (!currentSkills.includes(requiredSkillInput.trim())) {
        form.setValue("required_skills", [...currentSkills, requiredSkillInput.trim()]);
        setRequiredSkillInput("");
      }
    }
  };

  const removeRequiredSkill = (skill: string) => {
    const currentSkills = form.getValues("required_skills");
    form.setValue(
      "required_skills",
      currentSkills.filter((s) => s !== skill)
    );
  };

  const addPreferredSkill = () => {
    if (preferredSkillInput.trim()) {
      const currentSkills = form.getValues("preferred_skills") || [];
      if (!currentSkills.includes(preferredSkillInput.trim())) {
        form.setValue("preferred_skills", [...currentSkills, preferredSkillInput.trim()]);
        setPreferredSkillInput("");
      }
    }
  };

  const removePreferredSkill = (skill: string) => {
    const currentSkills = form.getValues("preferred_skills") || [];
    form.setValue(
      "preferred_skills",
      currentSkills.filter((s) => s !== skill)
    );
  };

  const onSubmit = async (data: JobCreateValues) => {
    setIsLoading(true);

    try {
      // Convert deadline to ISO format
      const deadline = new Date(data.application_deadline).toISOString();

      const payload = {
        ...data,
        application_deadline: deadline,
      };

      console.log("📤 Sending job data:", payload);

      const response = await axiosInstance.post("/employer/jobs", payload);

      toast.success("Job posted successfully!");
      router.push("/employer/jobs");
    } catch (error: any) {
      console.error("Job creation error:", error);

      if (error?.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          error.response.data.detail.forEach((err: any) => {
            toast.error(`${err.loc?.join(" > ")}: ${err.msg}`);
          });
        } else {
          toast.error(error.response.data.detail);
        }
      } else {
        toast.error("Failed to create job");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/employer/jobs">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold">Post a New Job</h1>
              <p className="text-gray-600">Fill in the details to create a job posting</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Backend Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the role, responsibilities, and requirements..."
                          rows={8}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Minimum 50 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Dhaka, Bangladesh" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="work_mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Mode *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select work mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ONSITE">On-site</SelectItem>
                            <SelectItem value="REMOTE">Remote</SelectItem>
                            <SelectItem value="HYBRID">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="job_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FULL_TIME">Full-time</SelectItem>
                            <SelectItem value="PART_TIME">Part-time</SelectItem>
                            <SelectItem value="CONTRACT">Contract</SelectItem>
                            <SelectItem value="INTERNSHIP">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ENTRY">Entry Level</SelectItem>
                            <SelectItem value="MID">Mid Level</SelectItem>
                            <SelectItem value="SENIOR">Senior Level</SelectItem>
                            <SelectItem value="LEAD">Lead/Principal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="application_deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Deadline *</FormLabel>
                        <FormControl>
                          <Input type="date" min={today} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_fresh_graduate_friendly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Fresh Graduate Friendly</FormLabel>
                        <FormDescription>
                          Check this if the position is suitable for fresh graduates
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Salary */}
            <Card>
              <CardHeader>
                <CardTitle>Salary Range (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salary_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Salary (BDT)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 40000"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : null)
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salary_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Salary (BDT)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 80000"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : null)
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Python, FastAPI, PostgreSQL"
                    value={requiredSkillInput}
                    onChange={(e) => setRequiredSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addRequiredSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={addRequiredSkill} variant="outline">
                    Add
                  </Button>
                </div>

                {form.getValues("required_skills").length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.getValues("required_skills").map((skill) => (
                      <span
                        key={skill}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeRequiredSkill(skill)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <FormMessage>{form.formState.errors.required_skills?.message}</FormMessage>
              </CardContent>
            </Card>

            {/* Preferred Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Preferred Skills (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Docker, AWS, Redis"
                    value={preferredSkillInput}
                    onChange={(e) => setPreferredSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPreferredSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={addPreferredSkill} variant="outline">
                    Add
                  </Button>
                </div>

                {(form.getValues("preferred_skills") || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(form.getValues("preferred_skills") || []).map((skill) => (
                      <span
                        key={skill}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removePreferredSkill(skill)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link href="/employer/jobs">
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Post Job"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
