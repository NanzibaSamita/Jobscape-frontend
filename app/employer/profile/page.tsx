"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";
import { logoutUser } from "@/lib/store/slices/authSlice";
import { logoutAction } from "@/lib/cookies";
import { axiosInstance } from "@/lib/axios/axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Loader2,
  Building,
  Mail,
  MapPin,
  Globe,
  Edit,
  LogOut,
  User,
  Briefcase,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  Send,
} from "lucide-react";

import Link from "next/link";

interface EmployerProfile {
  id: string;
  full_name: string;
  job_title?: string;
  work_email: string;
  company_name: string;
  company_website?: string;
  industry?: string;
  location?: string;
  company_size?: string;
  description?: string;
  profile_completed: boolean;
  verification_tier: string;
  trust_score: number;
  verification_badges: string[];
  work_email_verified: boolean;
  logo_url?: string;
}

export default function EmployerProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/employer/profile/me");
      setProfile(res.data);
    } catch (error: any) {
      dispatch(
        showAlert({
          title: "Error",
          message: error?.response?.data?.detail || "Failed to load profile",
          type: "error",
        })
      );

      if (error?.response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    try {
      setIsResending(true);

      const res = await axiosInstance.post(
        "/employer/verify-work-email/resend"
      );

      dispatch(
        showAlert({
          title: "Success",
          message:
            res.data.message ||
            "Verification code sent to your work email",
          type: "success",
        })
      );

      setShowVerificationInput(true);
    } catch (error: any) {
      dispatch(
        showAlert({
          title: "Error",
          message: error?.response?.data?.detail || "Failed to send code",
          type: "error",
        })
      );
    } finally {
      setIsResending(false);
    }
  }

  async function handleVerifyWorkEmail() {
    if (!verificationCode || verificationCode.length !== 6) {
      dispatch(
        showAlert({
          title: "Invalid Code",
          message: "Enter the 6 digit code",
          type: "warning",
        })
      );
      return;
    }

    try {
      setIsVerifying(true);

      await axiosInstance.post("/employer/verify-work-email", {
        code: verificationCode,
      });

      dispatch(
        showAlert({
          title: "Verified",
          message: "Work email verified successfully 🎉",
          type: "success",
        })
      );

      setVerificationCode("");
      setShowVerificationInput(false);

      fetchProfile();
    } catch (error: any) {
      dispatch(
        showAlert({
          title: "Verification Failed",
          message: "Invalid or expired code",
          type: "error",
        })
      );
    } finally {
      setIsVerifying(false);
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {}

    dispatch(logoutUser());
    await logoutAction();

    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!profile) return null;

  const getVerificationTierInfo = () => {
    const tier = profile.verification_tier;

    if (tier === "UNVERIFIED") {
      return {
        title: "Unverified",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: AlertCircle,
      };
    }

    if (tier === "EMAIL_VERIFIED") {
      return {
        title: "Email Verified",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        icon: CheckCircle,
      };
    }

    if (tier === "DOCUMENT_VERIFIED") {
      return {
        title: "Document Review",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        icon: Clock,
      };
    }

    return {
      title: "Fully Verified",
      color: "text-green-600",
      bgColor: "bg-green-100",
      icon: Shield,
    };
  };

  const tierInfo = getVerificationTierInfo();
  const TierIcon = tierInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {profile.logo_url ? (
              <img
                src={profile.logo_url}
                className="w-20 h-20 rounded-xl border"
              />
            ) : (
              <div className="w-20 h-20 bg-purple-100 flex items-center justify-center rounded-xl">
                <Building className="h-10 w-10 text-purple-600" />
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold">
                {profile.company_name}
              </h1>

              <p className="text-gray-600">
                {profile.full_name} · {profile.job_title || "Employer"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href="/employer/profile/edit">
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Verification */}

        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Shield className="h-5 w-5" />
              Verification Status
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${tierInfo.bgColor}`}>
                <TierIcon className={`h-6 w-6 ${tierInfo.color}`} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Current Tier</p>
                <p className="text-lg font-semibold">{tierInfo.title}</p>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${profile.trust_score}%` }}
              />
            </div>

            {!profile.work_email_verified && (
              <div className="space-y-3">

                {!showVerificationInput ? (
                  <Button
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="w-full"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Code
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Verification Code
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-2">

                    <Input
                      value={verificationCode}
                      onChange={(e) =>
                        setVerificationCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                      placeholder="Enter code"
                      maxLength={6}
                      className="text-center text-xl"
                    />

                    <Button
                      onClick={handleVerifyWorkEmail}
                      disabled={verificationCode.length !== 6}
                      className="w-full"
                    >
                      Verify Code
                    </Button>

                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Info */}

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{profile.full_name}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Work Email</p>
                <p className="font-medium">{profile.work_email}</p>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Company Info */}

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            {profile.location && (
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <p>{profile.location}</p>
              </div>
            )}

            {profile.company_website && (
              <div className="flex gap-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <a
                  href={profile.company_website}
                  target="_blank"
                  className="text-purple-600 hover:underline"
                >
                  {profile.company_website}
                </a>
              </div>
            )}

            {profile.description && (
              <p className="text-gray-600">{profile.description}</p>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  );
}