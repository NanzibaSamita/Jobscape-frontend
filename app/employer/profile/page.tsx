"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axios/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Loader2, Building, Mail, MapPin, Globe, Edit, LogOut, 
  User, Briefcase, Shield, CheckCircle, AlertCircle, 
  Clock, Upload, Send
} from "lucide-react";
import Link from "next/link";

// ✅ Interfaces
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
  work_email_verified: boolean;
}

interface VerificationStatus {
  status: string; // UNVERIFIED, EMAIL_VERIFIED, DOCUMENT_VERIFIED, FULLY_VERIFIED
  verified_at?: string;
  documents_submitted: number;
  trust_score: number;
  can_submit: boolean;
}

export default function EmployerProfilePage() {
  const router = useRouter();
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
      console.error("Profile fetch error:", error);
      toast.error(error?.response?.data?.detail || "Failed to load profile");
      
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    try {
      setIsResending(true);
      const res = await axiosInstance.post("/employer/verify-work-email/resend");
      toast.success(res.data.message || "Verification code sent to your work email");
      setShowVerificationInput(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to send code");
    } finally {
      setIsResending(false);
    }
  }

  async function handleVerifyWorkEmail() {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    try {
      setIsVerifying(true);
      const res = await axiosInstance.post("/employer/verify-work-email/confirm", {
        verification_code: verificationCode,
      });

      toast.success("Work email verified successfully! 🎉");
      setShowVerificationInput(false);
      setVerificationCode("");
      
      // Refresh profile
      await fetchProfile();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Invalid or expired code");
    } finally {
      setIsVerifying(false);
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout API error:", error);
    }

    localStorage.clear();
    sessionStorage.clear();
    toast.success("Logged out successfully");

    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!profile) return null;

  // Determine verification tier status
  const getVerificationTierInfo = () => {
    const tier = profile.verification_tier;
    
    if (tier === "UNVERIFIED") {
      return {
        title: "Unverified",
        description: "Complete verification to unlock full features",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: AlertCircle,
      };
    } else if (tier === "EMAIL_VERIFIED") {
      return {
        title: "Email Verified",
        description: "Work email verified. Submit documents for higher trust",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        icon: CheckCircle,
      };
    } else if (tier === "DOCUMENT_VERIFIED") {
      return {
        title: "Document Verified",
        description: "Documents submitted. Awaiting admin approval",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        icon: Clock,
      };
    } else if (tier === "FULLY_VERIFIED") {
      return {
        title: "Fully Verified",
        description: "Congratulations! Your company is fully verified",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: Shield,
      };
    }
    
    return {
      title: "Unknown",
      description: "Contact support",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      icon: AlertCircle,
    };
  };

  const tierInfo = getVerificationTierInfo();
  const TierIcon = tierInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{profile.company_name}</h1>
            <p className="text-gray-600 mt-1">
              {profile.full_name} · {profile.job_title || "Employer"}
            </p>
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
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Verification Status Card - ENHANCED */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Tier Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${tierInfo.bgColor}`}>
                  <TierIcon className={`h-6 w-6 ${tierInfo.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Tier</p>
                  <p className="text-lg font-semibold">{tierInfo.title}</p>
                  <p className="text-sm text-gray-600">{tierInfo.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">Trust Score</p>
                <p className="text-2xl font-bold text-purple-600">{profile.trust_score}/100</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${profile.trust_score}%` }}
              />
            </div>

            {/* Tier Actions */}
            <div className="pt-4 border-t">
              {/* TIER 0: UNVERIFIED - Verify Work Email */}
              {profile.verification_tier === "UNVERIFIED" && !profile.work_email_verified && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900">Step 1: Verify Work Email</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Verify your work email ({profile.work_email}) to increase your trust score
                      </p>
                    </div>
                  </div>

                  {!showVerificationInput ? (
                    <Button
                      onClick={handleResendCode}
                      disabled={isResending}
                      className="w-full"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending Code...
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
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleVerifyWorkEmail}
                          disabled={isVerifying || verificationCode.length !== 6}
                          className="flex-1"
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify Code"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleResendCode}
                          disabled={isResending}
                        >
                          Resend
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TIER 1: EMAIL_VERIFIED - Submit Documents */}
              {profile.verification_tier === "EMAIL_VERIFIED" && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900">✓ Work Email Verified</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your work email has been verified successfully
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                    <Upload className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-900">Step 2: Submit Documents</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Upload company documents to get verified and unlock full features
                      </p>
                    </div>
                  </div>

                  <Link href="/employer/verification/submit-documents">
                    <Button className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Verification Documents
                    </Button>
                  </Link>
                </div>
              )}

              {/* TIER 2: DOCUMENT_VERIFIED - Waiting for Approval */}
              {profile.verification_tier === "DOCUMENT_VERIFIED" && (
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-900">Documents Under Review</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your documents have been submitted and are being reviewed by our team. This usually takes 1-2 business days.
                    </p>
                  </div>
                </div>
              )}

              {/* TIER 3: FULLY_VERIFIED - Congratulations */}
              {profile.verification_tier === "FULLY_VERIFIED" && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900">🎉 Fully Verified Company</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your company has been fully verified. You now have access to all premium features!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rest of your existing cards... */}
        {/* Personal Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{profile.full_name}</p>
              </div>
            </div>

            {profile.job_title && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Job Title</p>
                  <p className="font-medium">{profile.job_title}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Work Email</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{profile.work_email}</p>
                  {profile.work_email_verified ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Company Name</p>
                <p className="font-medium">{profile.company_name}</p>
              </div>
            </div>

            {profile.industry && (
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="font-medium">{profile.industry}</p>
                </div>
              </div>
            )}

            {profile.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{profile.location}</p>
                </div>
              </div>
            )}

            {profile.company_size && (
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Company Size</p>
                  <p className="font-medium">{profile.company_size}</p>
                </div>
              </div>
            )}

            {profile.company_website && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <a
                    href={profile.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-purple-600 hover:underline"
                  >
                    {profile.company_website}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/employer/jobs/create">
            <Button className="w-full" variant="outline">
              Post a Job
            </Button>
          </Link>
          <Link href="/employer/jobs">
            <Button className="w-full" variant="outline">
              My Jobs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
