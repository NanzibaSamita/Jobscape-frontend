"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building, Mail, MapPin, Globe, Edit } from "lucide-react";
import Link from "next/link";

interface EmployerProfile {
  id: string;
  fullname: string;
  jobtitle?: string;
  workemail: string;
  companyname: string;
  companywebsite?: string;
  industry?: string;
  location?: string;
  companysize?: string;
  description?: string;
  profilecompleted: boolean;
  verificationtier: string;
  trustscore: number;
}

export default function EmployerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/employer/profile/me");
      setProfile(res.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to load profile");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{profile.companyname}</h1>
            <p className="text-gray-600 mt-1">{profile.fullname} · {profile.jobtitle || "Employer"}</p>
          </div>
          <Link href="/employer/profile/edit">
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Company Name</p>
                <p className="font-medium">{profile.companyname}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Work Email</p>
                <p className="font-medium">{profile.workemail}</p>
              </div>
            </div>
            {profile.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{profile.location}</p>
                </div>
              </div>
            )}
            {profile.companywebsite && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <a href={profile.companywebsite} target="_blank" rel="noopener noreferrer" className="font-medium text-purple-600 hover:underline">
                    {profile.companywebsite}
                  </a>
                </div>
              </div>
            )}
            {profile.description && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700">{profile.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Trust Tier</p>
                <p className="text-lg font-semibold">{profile.verificationtier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trust Score</p>
                <p className="text-lg font-semibold">{profile.trustscore}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/employer/jobs/create">
            <Button className="w-full" variant="outline">Post a Job</Button>
          </Link>
          <Link href="/employer/jobs">
            <Button className="w-full" variant="outline">My Jobs</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
