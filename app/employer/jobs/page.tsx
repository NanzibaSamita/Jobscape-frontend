"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMyJobs, Job } from "@/lib/api/jobs";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";
import { logoutUser } from "@/lib/store/slices/authSlice";
import { logoutAction } from "@/lib/cookies";
import { axiosInstance } from "@/lib/axios/axios";
import { Loader2, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { EmployerProfileHeader } from "@/components/company/EmployerProfileHeader";
import { EmployerProfileTabs } from "@/components/company/EmployerProfileTabs";
import { EmployerJobList } from "@/components/company/EmployerJobList";

interface EmployerProfile {
  id: string;
  full_name: string;
  job_title?: string;
  company_name: string;
  logo_url?: string;
}

export default function EmployerJobsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchJobs();
  }, []);

  async function fetchProfile() {
    try {
      const res = await axiosInstance.get("/employer/profile/me");
      setProfile(res.data);
    } catch (error: any) {
      console.error("Profile fetch error:", error);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        router.push("/login");
      }
    }
  }

  async function fetchJobs() {
    try {
      setJobsLoading(true);
      const jobsData = await getMyJobs();
      setJobs(jobsData);
    } catch (error: any) {
      dispatch(showAlert({
        title: "Error",
        message: error?.response?.data?.detail || "Failed to load jobs",
        type: "error"
      }));
    } finally {
      setJobsLoading(false);
      setLoading(false);
    }
  }

  async function handleDeleteJob(jobId: string) {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone and will delete all associated applications.")) {
      return;
    }

    try {
      await axiosInstance.delete(`/jobs/${jobId}`);
      dispatch(showAlert({
        title: "Deleted",
        message: "Job deleted successfully",
        type: "success"
      }));
      fetchJobs();
    } catch (error: any) {
      dispatch(showAlert({
        title: "Error",
        message: error?.response?.data?.detail || "Failed to delete job",
        type: "error"
      }));
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout API error:", error);
    }

    dispatch(logoutUser());
    await logoutAction();
    dispatch(showAlert({
      title: "Logged Out",
      message: "Logged out successfully",
      type: "success"
    }));
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <EmployerProfileHeader profile={profile} onLogout={handleLogout} />

        <Tabs defaultValue="jobs" className="w-full">
          <EmployerProfileTabs activeTab="jobs" />

          <TabsContent value="jobs">
            <EmployerJobList 
              jobs={jobs} 
              loading={jobsLoading} 
              onDeleteJob={handleDeleteJob} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

