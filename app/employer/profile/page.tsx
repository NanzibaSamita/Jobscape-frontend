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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Building, Mail, MapPin, Globe, Edit, LogOut, 
  User, Briefcase, Shield, CheckCircle, AlertCircle, 
  Clock, Upload, Send, Plus, Eye, Search, Trash2
} from "lucide-react";
import Link from "next/link";
import { getMyJobs, Job } from "@/lib/api/jobs";

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
  verification_badges: string[];
  work_email_verified: boolean;
  logo_url?: string;
}

export default function EmployerProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchJobs();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/employer/profile/me");
      setProfile(res.data);
    } catch (error: any) {
      console.error("Profile fetch error:", error);
      dispatch(showAlert({
        title: "Error",
        message: error?.response?.data?.detail || "Failed to load profile",
        type: "error"
      }));
      
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchJobs() {
    try {
      setJobsLoading(true);
      const jobsData = await getMyJobs();
      setJobs(jobsData);
    } catch (error: any) {
      console.error("Jobs fetch error:", error);
    } finally {
      setJobsLoading(false);
    }
  }

  async function handleResendCode() {
    try {
      setIsResending(true);
      const res = await axiosInstance.post("/employer/verify-work-email/resend");
      dispatch(showAlert({
        title: "Success",
        message: res.data.message || "Verification code sent to your work email",
        type: "success"
      }));
      setProfile(res.data);
      setShowVerificationInput(true);
    } catch (error: any) {
      dispatch(showAlert({
        title: "Error",
        message: error?.response?.data?.detail || "Failed to send code",
        type: "error"
      }));
    } finally {
      setIsResending(false);
    }
  }

  async function handleVerifyWorkEmail() {
    if (!verificationCode || verificationCode.length !== 6) {
      dispatch(showAlert({
        title: "Invalid Code",
        message: "Please enter the 6-digit code",
        type: "warning"
      }));
      return;
    }

    try {
      setIsVerifying(true);
      await axiosInstance.post("/employer/verify-work-email", { code: verificationCode });
      dispatch(showAlert({
        title: "Verified",
        message: "Work email verified successfully! 🎉",
        type: "success"
      }));
      setShowVerificationInput(false);
      setVerificationCode("");
      
      // Refresh profile
      fetchProfile();
    } catch (error: any) {
      dispatch(showAlert({
        title: "Verification Failed",
        message: error?.response?.data?.detail || "Invalid or expired code",
        type: "error"
      }));
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleDeleteJob(jobId: string) {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone and will delete all associated applications.")) {
      return;
    }

    try {
      await axiosInstance.delete(`/jobs/${jobId}`);
      dispatch(showAlert({
        title: "Deleted",
        message: "Job deleted successfully",
        type: "success"
      }));
      // Refresh jobs list
      fetchJobs();
    } catch (error: any) {
      dispatch(showAlert({
        title: "Error",
        message: error?.response?.data?.detail || "Failed to delete job",
        type: "error"
      }));
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout API error:", error);
    }

    dispatch(logoutUser());
    await logoutAction();
    dispatch(showAlert({
      title: "Logged Out",
      message: "Logged out successfully",
      type: "success"
    }));
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
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Verification Status Card */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
                  
                  <div className="text-center sm:text-right">
                    <p className="text-sm text-gray-500">Trust Level</p>
                    <p className={`text-xl font-bold ${profile.trust_score >= 80 ? 'text-green-600' : profile.trust_score >= 50 ? 'text-blue-600' : 'text-yellow-600'}`}>
                      {profile.trust_score >= 90 ? "Highly Trustable ⭐" : 
                       profile.trust_score >= 70 ? "Trustable" : 
                       profile.trust_score >= 40 ? "Verified" : "New Employer"}
                    </p>
                  </div>
                </div>

                {profile.verification_badges && profile.verification_badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {profile.verification_badges.map((badge, index) => (
                      <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${profile.trust_score}%` }}
                  />
                </div>

                <div className="pt-4 border-t">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Company Bio & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                {profile.company_size && (
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Company Size</p>
                      <p className="font-medium">{profile.company_size}</p>
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
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Posted Jobs</h2>
              <Link href="/employer/jobs/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
              </Link>
            </div>

            {jobsLoading ? (
              <div className="flex py-12 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">You haven't posted any jobs yet.</p>
                  <Link href="/employer/jobs/create" className="mt-4">
                    <Button variant="outline">Create Your First Job Post</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <p className="text-gray-600">{job.location} · {job.work_mode}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={job.is_active ? "default" : "secondary"}>
                            {job.is_active ? "Active" : "Closed"}
                          </Badge>
                          <Link href={`/employer/jobs/${job.id}/applications`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View Applications
                            </Button>
                          </Link>
                          <Link href={`/employer/jobs/${job.id}/edit`}>
                            <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-gray-500">
                          Posted: {new Date(job.created_at).toLocaleDateString()}
                        </p>
                        <p className="font-medium text-purple-600">
                          {job.experience_level}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse">
            <Card>
              <CardHeader>
                <CardTitle>Browse Available Jobs</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                <Search className="h-12 w-12 text-gray-300" />
                <p className="text-gray-500 text-center max-w-md">
                  View how your jobs appear to candidates and discover potential competitors in your industry.
                </p>
                <Link href="/jobs">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                    Go to Job Search
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
