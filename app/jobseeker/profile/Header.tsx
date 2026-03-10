"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Edit, MapPin, User, Building2, BadgeCheck } from "lucide-react";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";

export interface ProfileData {
  profile_picture_url?: string | null;
  professional_summary?: string;
  skills?: string[];
  experience?: unknown[];
  education?: unknown[];
  linkedin_url?: string;
  phone?: string;
  projects?: unknown[];
  certifications?: unknown[];
  is_employed?: boolean;
  current_employer_name?: string | null;
}

interface HeaderProps {
  name: string;
  location?: string;
  profilePictureUrl?: string | null;
  profileData?: ProfileData;
}

function calcCompletion(data?: ProfileData): number {
  if (!data) return 0;
  const checks = [
    !!data.profile_picture_url,
    !!data.professional_summary,
    (data.skills?.length ?? 0) >= 3,
    (data.experience?.length ?? 0) >= 1,
    (data.education?.length ?? 0) >= 1,
    !!data.linkedin_url,
    !!data.phone,
    (data.projects?.length ?? 0) >= 1,
    (data.certifications?.length ?? 0) >= 1,
  ];
  const weights = [10, 10, 15, 20, 15, 10, 5, 10, 5];
  return checks.reduce((acc, val, i) => (val ? acc + weights[i] : acc), 0);
}

export default function Header({ name, location, profilePictureUrl, profileData }: HeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const completion = calcCompletion(profileData);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    dispatch(showAlert({
      title: "Success",
      message: "Logged out successfully",
      type: "success"
    }));
    router.push("/login");
  };

  const handleEditProfile = () => {
    router.push("/jobseeker/profile/edit");
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start gap-5">
        {/* Profile Picture */}
        <div className="relative flex-shrink-0">
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt={name}
              className="w-24 h-24 rounded-full object-cover border-4 border-purple-100"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center border-4 border-purple-50">
              <User className="h-10 w-10 text-purple-400" />
            </div>
          )}
        </div>

        {/* Name + Location + Actions */}
        <div className="flex-1 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            {location && (
              <div className="flex items-center gap-1 mt-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{location}</span>
              </div>
            )}

            {profileData?.is_employed && (
              <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-full w-fit">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Currently at {profileData.current_employer_name}
                </span>
                <span className="text-[10px] text-gray-400 font-normal ml-1 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Hired via Jobscape
                </span>
              </div>
            )}

            {/* Profile Completion Bar */}
            {profileData && (
              <div className="mt-3 min-w-[200px]">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Profile Completeness</span>
                  <span className="font-medium">{completion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                {completion < 100 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Complete your profile to increase visibility to employers
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditProfile}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
