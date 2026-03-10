import { axiosInstance } from "@/lib/axios/axios";
import { Job } from "./jobs";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface EmployerPublicBasic {
  id: string;
  full_name: string;
  job_title?: string;
  company_name: string;
  logo_url?: string;
  industry?: string;
  company_size?: string;
  location?: string;
  description?: string;
  company_website?: string;
  verification_tier: string;
  trust_score: number;
  verification_badges: string[];
  total_job_posts_count: number;
  founded_year?: number;
  created_at: string;
}

export interface EmployeeOnPlatform {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  primary_industry?: string;
}

export interface EmployerPublicResponse {
  employer: EmployerPublicBasic;
  active_jobs: Job[];
  employees_on_platform: EmployeeOnPlatform[];
  total_jobs_posted: number;
  response_rate?: number;
}

/**
 * Get public employer profile (no auth required)
 */
export async function getEmployerPublicProfile(
  employerId: string
): Promise<EmployerPublicResponse> {
  const res = await fetch(`${API_BASE}/employer/public/${employerId}`);
  if (!res.ok) throw new Error("Failed to fetch employer profile");
  return res.json();
}

// Legacy helpers kept for backward compat with the old employer/[id]/page.tsx
export async function getEmployerProfile(employerId: string) {
  return getEmployerPublicProfile(employerId).then((d) => d.employer);
}

export async function getEmployerJobs(employerId: string) {
  return getEmployerPublicProfile(employerId).then((d) => ({
    jobs: d.active_jobs,
  }));
}

export async function getCompanyEmployees(employerId: string) {
  return getEmployerPublicProfile(employerId).then((d) => ({
    employees: d.employees_on_platform,
  }));
}
