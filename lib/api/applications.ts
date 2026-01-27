import { axiosInstance } from "./axios";

export type ApplicationStatus =
  | "PENDING"
  | "REVIEWED"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface Application {
  id: string;
  job_id: string;
  jobseeker_id: string;
  resume_id: string | null;
  status: ApplicationStatus;
  cover_letter: string | null;
  match_score: number;
  applied_at: string;
  updated_at: string;
  // Enriched fields from backend
  job_title?: string;
  company_name?: string;
  applicant_name?: string;
  applicant_email?: string;
}

export interface ApplicationDetail extends Application {
  employer_notes: string | null;
  interview_scheduled_at: string | null;
  interview_location: string | null;
  interview_notes: string | null;
  rejection_reason: string | null;
  rejected_at: string | null;
}

export interface CreateApplicationData {
  job_id: string;
  resume_id: string;
  cover_letter?: string;
}

export interface ApplicationStats {
  total_applications: number;
  pending: number;
  reviewed: number;
  shortlisted: number;
  interview_scheduled: number;
  accepted: number;
  rejected: number;
}

/**
 * Apply to a job (Job Seeker)
 */
export async function applyToJob(data: CreateApplicationData): Promise<Application> {
  const response = await axiosInstance.post("/applications/", data);
  return response.data;
}

/**
 * Get all applications for the current job seeker
 */
export async function getMyApplications(status?: string): Promise<Application[]> {
  const params: any = {};
  if (status) params.status = status;

  const response = await axiosInstance.get("/applications/my-applications", { params });
  return response.data;
}

/**
 * Get a single application by ID with full details
 */
export async function getApplicationById(applicationId: string): Promise<ApplicationDetail> {
  const response = await axiosInstance.get(`/applications/${applicationId}`);
  return response.data;
}

/**
 * Withdraw an application (Job Seeker)
 */
export async function withdrawApplication(applicationId: string): Promise<Application> {
  const response = await axiosInstance.post(`/applications/${applicationId}/withdraw`);
  return response.data;
}

/**
 * Get all applications for a specific job (Employer)
 */
export async function getJobApplications(
  jobId: string,
  status?: string,
  minMatchScore?: number
): Promise<Application[]> {
  const params: any = {};
  if (status) params.status = status;
  if (minMatchScore) params.min_match_score = minMatchScore;

  const response = await axiosInstance.get(`/job/${jobId}/applications`, { params });
  return response.data;
}

/**
 * Get all applications across all employer's jobs (Employer)
 */
export async function getAllEmployerApplications(status?: string): Promise<Application[]> {
  const params: any = {};
  if (status) params.status = status;

  const response = await axiosInstance.get("/applications/employer/all-applications", { params });
  return response.data;
}

/**
 * Update application status (Employer)
 */
export async function updateApplicationStatus(
  applicationId: string,
  data: {
    status: ApplicationStatus;
    employer_notes?: string;
    rejection_reason?: string;
    interview_scheduled_at?: string;
    interview_location?: string;
    interview_notes?: string;
  }
): Promise<ApplicationDetail> {
  const response = await axiosInstance.patch(`/applications/${applicationId}/status`, data);
  return response.data;
}

/**
 * Get application statistics for a job (Employer)
 */
export async function getJobApplicationStats(jobId: string): Promise<ApplicationStats> {
  const response = await axiosInstance.get(`/job/${jobId}/stats`);
  return response.data;
}
