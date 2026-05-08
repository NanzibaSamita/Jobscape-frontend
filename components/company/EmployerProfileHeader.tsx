"use client";

import { Button } from "@/components/ui/button";
import { Building, Edit, LogOut } from "lucide-react";
import Link from "next/link";

interface EmployerProfile {
  full_name: string;
  job_title?: string;
  company_name: string;
  logo_url?: string;
}

interface EmployerProfileHeaderProps {
  profile: EmployerProfile;
  onLogout: () => void;
}

export function EmployerProfileHeader({ profile, onLogout }: EmployerProfileHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {profile.logo_url ? (
          <img
            src={profile.logo_url}
            alt={profile.company_name}
            className="w-20 h-20 rounded-xl object-cover border-2 border-purple-200"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-purple-100 flex items-center justify-center">
            <Building className="h-10 w-10 text-purple-500" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">{profile.company_name}</h1>
          <p className="text-gray-600 mt-1">
            {profile.full_name} · {profile.job_title || "Employer"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Link href="/employer/profile/edit">
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
