import axiosInstance from "@/lib/axios/axios";

export interface Resume {
  id: string;
  filename: string;
  is_primary: boolean;
  uploaded_at: string;
  file_url: string;
}

export interface ResumesResponse {
  resumes: Resume[];
  total: number;
}

export interface ResumeUploadResponse {
  message: string;
  resume_id: string;
  parse_status: "SUCCESS" | "FAILED" | "PENDING";
  profile_completed: boolean;
  next_step?: string;
  extracted_data?: any;
  error?: string;
  can_retry?: boolean;
  instructions?: string;
  retry_endpoint?: string;
}

/**
 * Initial CV upload (right after email verification)
 * Uses cv_upload_token from email verification response
 */
export async function uploadResume(file: File): Promise<ResumeUploadResponse> {
  const token = localStorage.getItem("cv_upload_token");
  if (!token) {
    throw new Error("Missing CV upload authorization. Please verify your email again.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await axiosInstance.post("/resume/upload", formData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

/**
 * Re-upload CV from profile page (user already logged in)
 * Uses normal access_token (automatically added by axiosInstance interceptor)
 */
export async function reUploadResume(file: File): Promise<ResumeUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  // ✅ No need to manually add Authorization header
  // axiosInstance will add it automatically from localStorage.getItem("access_token")
  const response = await axiosInstance.post("/resume/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
}

/**
 * Update/replace existing CV
 * Backend endpoint: PUT /resume/update
 */
export async function updateResume(file: File): Promise<ResumeUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.put("/resume/update", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
}

/**
 * Get all resumes for the current job seeker
 * Used in job application modal to let user select which resume to use
 * Backend endpoint: GET /resume/my-resumes
 */
export async function getMyResumes(): Promise<ResumesResponse> {
  const response = await axiosInstance.get<ResumesResponse>("/resume/my-resumes");
  return response.data;
}

/**
 * Get details of a specific resume
 * Backend endpoint: GET /resume/{resume_id}
 */
export async function getResumeById(resumeId: string): Promise<Resume> {
  const response = await axiosInstance.get<Resume>(`/resume/${resumeId}`);
  return response.data;
}

/**
 * Delete a resume
 * Backend endpoint: DELETE /resume/{resume_id}
 */
export async function deleteResume(resumeId: string): Promise<{ message: string }> {
  const response = await axiosInstance.delete<{ message: string }>(`/resume/${resumeId}`);
  return response.data;
}

/**
 * Retry parsing a failed resume
 * Backend endpoint: POST /resume/{resume_id}/retry-parse
 */
export async function retryResumeParsing(resumeId: string): Promise<ResumeUploadResponse> {
  const response = await axiosInstance.post<ResumeUploadResponse>(
    `/resume/${resumeId}/retry-parse`
  );
  return response.data;
}
