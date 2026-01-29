import { axiosInstance } from "@/lib/axios/axios";

export interface JobSeekerProfile {
  id: string;
  user_id: string;
  full_name: string;  // Backend uses full_name
  profile_picture_url?: string | null;
  phone?: string | null;
  location?: string | null;
  professional_summary?: string | null;
  inferred_industries: string[];
  primary_industry?: string | null;
  skills: string[];
  experience: any[];
  education: any[];
  projects: any[];
  certifications: any[];
  awards: any[];
  languages: any[];
  volunteer_experience: any[];
  publications: any[];
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  other_links: string[];
}

export interface UserProfileResponse {
  user: {
    id: string;
    email: string;
    role: string;
    is_active: boolean;
    is_email_verified: boolean;
  };
  profile: JobSeekerProfile;
  role: "JOBSEEKER" | "EMPLOYER" | "ADMIN";
}

export interface UpdateJobSeekerProfileData {
  full_name?: string;  // Use full_name for backend
  phone?: string;
  location?: string;
  professional_summary?: string;
  skills?: string[];
  experience?: any[];
  education?: any[];
  projects?: any[];
  certifications?: any[];
  awards?: any[];
  languages?: any[];
  volunteer_experience?: any[];
  publications?: any[];
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  other_links?: string[];
}

/**
 * Fetch current user's profile with role-specific data
 */
export async function getUserProfile(): Promise<UserProfileResponse> {
  const response = await axiosInstance.get("/auth/me/profile"); // **CHANGED**
  return response.data;
}


/**
 * Update job seeker profile
 */
export async function updateJobSeekerProfile(
  data: UpdateJobSeekerProfileData
): Promise<JobSeekerProfile> {
  const response = await axiosInstance.patch("/profile/profile", data);
  return response.data;
}

/**
 * Upload profile picture (works for both job seeker and employer)
 */
export async function uploadProfilePicture(file: File): Promise<{ message: string; url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post("/profile/profile-picture/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

/**
 * Remove profile picture
 */
export async function removeProfilePicture(): Promise<{ message: string }> {
  const response = await axiosInstance.delete("/profile/profile-picture");
  return response.data;
}

