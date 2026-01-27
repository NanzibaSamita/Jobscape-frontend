"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Edit, MapPin } from "lucide-react";
import { toast } from "react-toastify";

interface HeaderProps {
  name: string;
  location?: string;
}

export default function Header({ name, location }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.clear();
    sessionStorage.clear();
    
    // Also clear cookies if you're using them
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Show success message
    toast.success("Logged out successfully");
    
    // Redirect to login page
    router.push("/login");
  };

  const handleEditProfile = () => {
    router.push("/jobseeker/profile/edit");
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          {location && (
            <div className="flex items-center gap-1 mt-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{location}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {/* Edit Profile Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditProfile}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>

          {/* Logout Button */}
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
  );
}
