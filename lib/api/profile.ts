import { axiosInstance } from "@/lib/axios/axios";

export interface JobSeekerProfile {
  full_name: string;  // ✅ Changed from fullname
  profile_picture_url?: string | null;  // ✅ Changed from profilepictureurl
  phone?: string | null;
  location?: string | null;
  professional_summary?: string | null;  // ✅ Changed from professionalsummary
  inferred_industries: string[];  // ✅ Changed from inferredindustries
  primary_industry?: string | null;  // ✅ Changed from primaryindustry
  skills: string[];
  experience: any[];
  education: any[];
  projects: any[];
  certifications: any[];
  awards: any[];
  languages: any[];
  volunteer_experience: any[];  // ✅ Changed from volunteerexperience
  publications: any[];
  linkedin_url?: string | null;  // ✅ Changed from linkedinurl
  github_url?: string | null;  // ✅ Changed from githuburl
  portfolio_url?: string | null;  // ✅ Changed from portfoliourl
  other_links: string[];  // ✅ Changed from otherlinks
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
  role: "jobseeker";
}

/**
 * Fetch current user's profile with role-specific data
 */
export async function getUserProfile(): Promise<UserProfileResponse> {
  const response = await axiosInstance.get("/auth/me/profile");
  return response.data;
}
