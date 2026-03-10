"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ MUST IMPORT THIS
import { getUserProfile, JobSeekerProfile } from "@/lib/api/profile";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";

import Header from "./Header";
import Skills from "./Skills";
import Experience from "./Experience";
import Education from "./Education";
import Projects from "./Projects";
import Certifications from "./Certifications";
import Awards from "./Awards";
import Languages from "./Languages";
import Volunteer from "./Volunteer";
import Publications from "./Publications";
import Links from "./Links";

export default function Page() {
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const router = useRouter(); // ✅ MUST ADD THIS

  useEffect(() => {
    async function fetchProfile() {
      // ✅ MUST HAVE THIS CHECK - Without it, you'll get the loop error
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.log("❌ No token found, redirecting to login");
        router.push("/login");
        return;
      }

      try {
        console.log("🔵 Fetching profile...");
        const data = await getUserProfile();
        console.log("🔵 Profile data:", data);
        setProfile(data.profile);
      } catch (error: any) {
        console.error("❌ Failed to fetch profile:", error);
        
        // ✅ MUST HAVE THIS - Redirect on 401 error
        if (error?.response?.status === 401) {
          console.log("❌ Unauthorized, redirecting to login");
          localStorage.clear();
          router.push("/login");
          return;
        }
        
        dispatch(showAlert({
          title: "Profile Error",
          message: error?.response?.data?.detail || "Failed to load profile",
          type: "error"
        }));
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]); // ✅ ADD router to dependencies

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-red-500">Profile not found</p>
          <p className="text-sm text-gray-500">
            Please complete your profile setup
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header with name and location */}
        <Header
          name={profile.full_name}
          location={profile.location ?? undefined}
          profilePictureUrl={profile.profile_picture_url}
          profileData={{
            profile_picture_url: profile.profile_picture_url,
            professional_summary: profile.professional_summary ?? undefined,
            skills: profile.skills,
            experience: profile.experience,
            education: profile.education,
            linkedin_url: profile.linkedin_url ?? undefined,
            phone: (profile as any).phone ?? undefined,
            projects: profile.projects,
            certifications: profile.certifications,
            is_employed: profile.is_employed,
            current_employer_name: profile.current_employer_name,
          }}
        />

        {/* Profile sections */}
        <div className="bg-white rounded-xl p-6 space-y-6">
          {/* Professional Summary */}
          {profile.professional_summary && (
            <div>
              <h2 className="text-lg font-semibold mb-3">About</h2>
              <p className="text-sm text-gray-600">
                {profile.professional_summary}
              </p>
            </div>
          )}

          {/* Skills */}
          <Skills data={profile.skills || []} />

          {/* Experience */}
          <Experience data={profile.experience || []} />

          {/* Education */}
          <Education data={profile.education || []} />

          {/* Projects */}
          <Projects data={profile.projects || []} />

          {/* Certifications */}
          <Certifications data={profile.certifications || []} />

          {/* Awards */}
          <Awards data={profile.awards || []} />

          {/* Languages */}
          <Languages data={profile.languages || []} />

          {/* Volunteer */}
          <Volunteer data={profile.volunteer_experience || []} />

          {/* Publications */}
          <Publications data={profile.publications || []} />

          {/* Links */}
          <Links
            linkedin={profile.linkedin_url}
            github={profile.github_url}
            portfolio={profile.portfolio_url}
            other_links={profile.other_links || []}
          />
        </div>
      </div>
    </div>
  );
}
