import { axiosInstance } from "@/lib/axios/axios";

export interface ResumeUploadResponse {
  message: string;
  resume_id: string;
  parse_status: "SUCCESS" | "FAILED" | "PENDING";
  profile_completed: boolean;
  next_step?: string;
  extracted_data?: any;
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
