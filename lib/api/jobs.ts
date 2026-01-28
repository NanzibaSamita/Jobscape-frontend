import { axiosInstance } from "@/lib/axios/axios";
export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  location: string;
  work_mode: string;
  job_type: string;
  experience_level: string;
  salary_min: number | null;
  salary_max: number | null;
  required_skills: string[];
  preferred_skills: string[];
  is_fresh_graduate_friendly: boolean;
  is_active: boolean;
  is_closed: boolean;
  application_deadline: string;
  created_at: string;
  updated_at: string;
  company_name?: string;
}

export interface JobSearchParams {
  keyword?: string;
  skills?: string; // comma-separated
  location?: string;
  work_mode?: string;
  job_type?: string;
  experience_level?: string;
  salary_min?: number;
  fresh_grad_friendly?: boolean;
  skip?: number;
  limit?: number;
}

export interface JobSearchResponse {
  items: Job[];
  total: number;
  page: number;
  pages: number;
}

/**
 * Search jobs with filters and pagination
 */
export async function searchJobs(params: JobSearchParams = {}): Promise<JobSearchResponse> {
  const response = await axiosInstance.get("/jobs", { params });
  return response.data;
}

/**
 * Get a single job by ID
 */
export async function getJobById(jobId: string): Promise<Job> {
  const response = await axiosInstance.get(`/jobs/${jobId}`);
  return response.data;
}

/**
 * Get all jobs (employer use)
 */
export async function getMyJobs(skip: number = 0, limit: number = 20): Promise<Job[]> {  // ← Changed return type
  const response = await axiosInstance.get("/employer/jobs", {
    params: { skip, limit },
  });
  return response.data;  // ✅ Returns array directly
}
