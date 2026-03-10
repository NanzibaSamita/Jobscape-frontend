import { axiosInstance } from "../axios/axios";

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
  ats_score: number;
  ats_report?: string;
  current_round: number;
  applied_at: string;
  updated_at: string;
  // Enriched fields from backend
  job_title?: string;
  company_name?: string;
  applicant_name?: string;
  applicant_email?: string;
  // Booked interview slot
  booked_slot_id?: string | null;
  booked_slot_datetime?: string | null;
  booked_slot_duration_minutes?: number | null;
  booked_slot_location?: string | null;
  booked_slot_style?: string | null;
  booked_slot_meeting_link?: string | null;
  interview_schedule_id?: string | null;
}

export interface ApplicationDetail extends Application {
  employer_notes: string | null;
  interview_scheduled_at: string | null;
  interview_location: string | null;
  interview_notes: string | null;
  rejection_reason: string | null;
  rejected_at: string | null;
  // Booked FCFS interview slot
  booked_slot_id: string | null;
  booked_slot_datetime: string | null;
  booked_slot_duration_minutes: number | null;
  booked_slot_location: string | null;
  booked_slot_style: string | null;
  booked_slot_meeting_link: string | null;
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
 * Advance an application to the next round (Employer)
 */
export async function advanceApplication(applicationId: string): Promise<Application> {
  const response = await axiosInstance.post(`/applications/${applicationId}/advance`);
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
  job_id: string,
  status?: string,
  minMatchScore?: number,
  minAtsScore?: number
): Promise<Application[]> {
  const params: any = {};
  if (status) params.status = status;
  if (minMatchScore !== undefined && minMatchScore !== null) params.min_match_score = minMatchScore;
  if (minAtsScore !== undefined && minAtsScore !== null) params.min_ats_score = minAtsScore;

  const response = await axiosInstance.get(`/applications/job/${job_id}/applications`, { params });
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


// ===== ATS SCORING =====

export interface ATSReport {
  overall_score: number;
  skill_match_score: number;
  experience_match_score: number;
  education_match_score: number;
  keyword_match_score: number;
  matched_required_skills: string[];
  matched_preferred_skills: string[];
  missing_required_skills: string[];
  strengths: string[];
  gaps: string[];
  recommendation: "STRONG_MATCH" | "GOOD_MATCH" | "PARTIAL_MATCH" | "WEAK_MATCH";
  summary: string;
}

export interface BulkATSResult {
  message: string;
  total: number;
  scored: number;
  failed: number;
  skipped_no_resume: number;
}

export interface ATSRankedApplication {
  application_id: string;
  applicant_name: string | null;
  ats_score: number | null;
  match_score: number;
  recommendation: string | null;
  status: ApplicationStatus;
}

// Trigger bulk ATS scoring for all applications of a job
export async function bulkATSScore(jobId: string): Promise<BulkATSResult> {
  const response = await axiosInstance.post(`/applications/job/${jobId}/bulk-ats-score`);
  return response.data;
}

// Score a single application
export async function scoreApplicationATS(applicationId: string): Promise<{ ats_score: number; ats_report: ATSReport }> {
  const response = await axiosInstance.post(`/applications/${applicationId}/ats-score`);
  return response.data;
}

// Get ATS-ranked applications for a job
export async function getATSRankedApplications(jobId: string, minScore = 0): Promise<{ applications: ATSRankedApplication[]; total: number }> {
  const response = await axiosInstance.get(`/applications/job/${jobId}/ats-ranked`, {
    params: { min_score: minScore },
  });
  return response.data;
}

