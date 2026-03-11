// app/employer/jobs/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";
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
import { Loader2, Briefcase, ArrowLeft, Trash2, PlusCircle, Info } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { SelectionRound } from "@/lib/api/jobs";

// ✅ Validation Schema
const roundSchema = z.object({
  number: z.number(),
  type: z.enum(["INITIAL_SCREENING", "TECHNICAL_INTERVIEW", "HR_INTERVIEW", "CODING_ROUND", "QUIZ_TASK", "FINAL_CONVERSATION"]),
  title: z.string().min(2, "Title is required"),
  description: z.string(),
  duration_minutes: z.number().nullable(),
  is_online: z.boolean(),
  location_or_link: z.string(),
  time_limit_minutes: z.number().nullable(),
  instructions: z.string(),
});

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
  preferred_skills: z.array(z.string()),
  is_fresh_graduate_friendly: z.boolean(),
  application_deadline: z.string().min(1, "Application deadline is required"),
  hiring_policy: z.string(),
  ats_threshold: z.number().min(0).max(100),
  selection_rounds: z.array(roundSchema).min(1, "At least one selection round is required").max(5, "Maximum 5 rounds allowed"),
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
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      work_mode: "REMOTE",
      job_type: "FULL_TIME",
      experience_level: "ENTRY",
      required_skills: [],
      preferred_skills: [],
      is_fresh_graduate_friendly: false,
      application_deadline: "",
      hiring_policy: "",
      ats_threshold: 60,
      selection_rounds: [
        {
          number: 1,
          type: "INITIAL_SCREENING",
          title: "Initial Screening",
          description: "",
          is_online: true,
          duration_minutes: 30,
          location_or_link: "",
          time_limit_minutes: null,
          instructions: "",
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "selection_rounds",
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
    setIsSubmitting(true);

    try {
      // 1. Create Job
      const deadline = new Date(data.application_deadline).toISOString();
      const jobPayload = {
        title: data.title,
        description: data.description,
        salary_min: data.salary_min || 0,
        salary_max: data.salary_max || 0,
        location: data.location,
        work_mode: data.work_mode,
        job_type: data.job_type,
        experience_level: data.experience_level,
        required_skills: data.required_skills,
        preferred_skills: data.preferred_skills,
        is_fresh_graduate_friendly: data.is_fresh_graduate_friendly,
        application_deadline: deadline,
        hiring_policy: data.hiring_policy,
        ats_threshold: data.ats_threshold,
      };

      const jobResponse = await axiosInstance.post("/employer/jobs", jobPayload);
      const jobId = jobResponse.data.id;

      // 2. Create Selection Process
      const selectionPayload = {
        job_id: jobId,
        rounds: data.selection_rounds.map((r, index) => ({
          ...r,
          number: index + 1, // Ensure sequential
          duration_minutes: r.duration_minutes || undefined,
          time_limit_minutes: ["CODING_ROUND", "QUIZ_TASK"].includes(r.type) ? r.time_limit_minutes : undefined,
          instructions: ["CODING_ROUND", "QUIZ_TASK"].includes(r.type) ? r.instructions : undefined,
        })),
        instructions: data.hiring_policy,
      };

      await axiosInstance.post("/selection/", selectionPayload);

      dispatch(showAlert({
        title: "Success",
        message: "Job and Selection Process created successfully!",
        type: "success"
      }));
      router.push("/employer/profile");
    } catch (error: any) {
      console.error("Creation error:", error);
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        detail.forEach((err: any) => {
          dispatch(showAlert({
            title: "Validation Error",
            message: `${err.loc?.join(" > ") || "Error"}: ${err.msg}`,
            type: "error"
          }));
        });
      } else if (typeof detail === "string") {
        dispatch(showAlert({
          title: "Error",
          message: detail,
          type: "error"
        }));
      } else {
        dispatch(showAlert({
          title: "Error",
          message: "An error occurred during creation",
          type: "error"
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/employer/profile">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Briefcase className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold">Post a New Job</h1>
              <p className="text-gray-600">Define the role and your hiring pipeline</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Job Basics */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold">1. Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Backend Engineer" {...field} />
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
                          placeholder="What is this role about?" 
                          rows={6} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="City, Country" {...field} />
                        </FormControl>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="work_mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Mode</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="REMOTE">Remote</SelectItem>
                            <SelectItem value="ONSITE">On-site</SelectItem>
                            <SelectItem value="HYBRID">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="job_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="FULL_TIME">Full-time</SelectItem>
                            <SelectItem value="PART_TIME">Part-time</SelectItem>
                            <SelectItem value="CONTRACT">Contract</SelectItem>
                            <SelectItem value="INTERNSHIP">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experience_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="ENTRY">Entry Level</SelectItem>
                            <SelectItem value="MID">Mid Level</SelectItem>
                            <SelectItem value="SENIOR">Senior Level</SelectItem>
                            <SelectItem value="LEAD">Lead/Principal</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Settings & ATS */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold">2. ATS & Selection Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="ats_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>ATS Pass Threshold (%)</FormLabel>
                        <Badge variant="outline" className="text-purple-600 bg-purple-50">
                          {field.value}%
                        </Badge>
                      </div>
                      <FormControl>
                        <Input 
                          type="range" 
                          min="0" 
                          max="100" 
                          step="5" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                      </FormControl>
                      <FormDescription>
                        Candidates with matching scores below this will be automatically filtered.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hiring_policy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>General Hiring Policy / Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g. We value problem-solving skills and cultural fit. Final selection depends on technical performance." 
                          rows={3} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Step 3: Selection Rounds Builder */}
            <Card className="border-2 border-purple-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    3. Hiring Pipeline (Rounds)
                  </CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    disabled={fields.length >= 5}
                    onClick={() => append({
                      number: fields.length + 1,
                      type: "TECHNICAL_INTERVIEW",
                      title: `Round ${fields.length + 1}`,
                      description: "",
                      duration_minutes: 60,
                      is_online: true,
                      location_or_link: "",
                      time_limit_minutes: null,
                      instructions: "",
                    })}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Round
                  </Button>
                </div>
                <FormDescription>
                  Define up to 5 rounds. Candidates will progress sequentially.
                </FormDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 rounded-xl border-2 border-gray-100 bg-white space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-purple-600 text-white hover:bg-purple-700">
                        Round {index + 1}
                      </Badge>
                      {fields.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`selection_rounds.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Round Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="INITIAL_SCREENING">Initial Screening</SelectItem>
                                <SelectItem value="TECHNICAL_INTERVIEW">Technical Interview</SelectItem>
                                <SelectItem value="CODING_ROUND">Coding Round</SelectItem>
                                <SelectItem value="QUIZ_TASK">Quiz / Task</SelectItem>
                                <SelectItem value="HR_INTERVIEW">HR Interview</SelectItem>
                                <SelectItem value="FINAL_CONVERSATION">Final Conversation</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`selection_rounds.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Conditional Fields for Coding Round or Quiz */}
                    {["CODING_ROUND", "QUIZ_TASK"].includes(form.watch(`selection_rounds.${index}.type`)) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-purple-50 rounded-lg border border-purple-100 animate-in fade-in slide-in-from-top-1">
                        <FormField
                          control={form.control}
                          name={`selection_rounds.${index}.time_limit_minutes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-purple-700">Time Limit (mins)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g. 60" 
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`selection_rounds.${index}.instructions`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-purple-700">Coding Instructions</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Solve 3 easy LeetCode problems" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-6">
                       <FormField
                        control={form.control}
                        name={`selection_rounds.${index}.is_online`}
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Online / Virtual</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`selection_rounds.${index}.duration_minutes`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 whitespace-nowrap">Duration:</span>
                                <Input 
                                  type="number" 
                                  className="h-8" 
                                  placeholder="mins"
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                  value={field.value || ""}
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Skills Card */}
            <Card className="border-2">
              <CardHeader><CardTitle className="text-xl font-bold">4. Skills & Requirements</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormLabel>Required Skills *</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. React, Node.js"
                    value={requiredSkillInput}
                    onChange={(e) => setRequiredSkillInput(e.target.value)}
                  />
                  <Button type="button" onClick={addRequiredSkill} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch("required_skills").map(s => (
                    <Badge key={s} className="bg-purple-100 text-purple-700 hover:bg-purple-200" onClick={() => removeRequiredSkill(s)}>
                      {s} ×
                    </Badge>
                  ))}
                </div>
                <FormMessage>{form.formState.errors.required_skills?.message}</FormMessage>

                <div className="pt-4 flex items-center gap-2">
                  <Info className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-500">Add preferred skills to improve ATS matching accuracy.</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pb-12">
              <Link href="/employer/profile"><Button type="button" variant="ghost">Cancel</Button></Link>
              <Button type="submit" size="lg" className="bg-purple-600 hover:bg-purple-700 px-8" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Post Job & Build Pipeline"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
