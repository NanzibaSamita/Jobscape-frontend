// app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios/axios";
import { 
  Loader2, 
  Users, 
  Briefcase, 
  Building2, 
  Shield, 
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-toastify";

interface Stats {
  total_users: number;
  total_employers: number;
  total_jobseekers: number;
  active_jobs: number;
  pending_verifications: number;
}

interface Employer {
  id: string;
  user_id: string;
  company_name: string;
  work_email: string;
  verification_tier: string;
  trust_score: number;
  profile_completed: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingEmployers, setPendingEmployers] = useState<Employer[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const role = localStorage.getItem("user_role");

      if (!token || role !== "ADMIN") {
        router.push("/login");
        return;
      }

      // Verify token
      const res = await axiosInstance.get("/auth/me");
      
      if (res.data.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      setAdminData(res.data);
      setLoading(false);
      
      // Load dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/login");
    }
  };

  const fetchDashboardData = async () => {
    setLoadingStats(true);
    try {
      // Fetch stats
      const statsRes = await axiosInstance.get("/admin/stats");
      setStats(statsRes.data);

      // Fetch pending employers
      const employersRes = await axiosInstance.get("/admin/employers/pending");
      setPendingEmployers(employersRes.data);
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoadingStats(false);
    }
  };

  const handleVerifyEmployer = async (employerId: string, approve: boolean) => {
    setVerifyingId(employerId);
    try {
      await axiosInstance.post(`/admin/employers/${employerId}/verify`, {
        approved: approve,
        verification_tier: approve ? "FULLY_VERIFIED" : "REJECTED"
      });

      toast.success(
        approve 
          ? "Employer verified successfully!" 
          : "Employer verification rejected"
      );

      // Refresh data
      fetchDashboardData();
    } catch (error: any) {
      console.error("Verification failed:", error);
      toast.error(
        error?.response?.data?.detail || "Failed to verify employer"
      );
    } finally {
      setVerifyingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login");
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "FULLY_VERIFIED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case "EMAIL_VERIFIED":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="h-3 w-3 mr-1" />
            Email Verified
          </Badge>
        );
      case "DOCUMENT_VERIFIED":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "UNVERIFIED":
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Unverified
          </Badge>
        );
      default:
        return <Badge variant="outline">{tier}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">JBscape Admin Panel</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{adminData?.email}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, Admin! 👋
          </h2>
          <p className="text-gray-600">
            Manage your platform and verify employers.
          </p>
        </div>

        {/* Stats Cards */}
        {loadingStats ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.total_users || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Registered accounts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Employers
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.total_employers || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Total employers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Job Seekers
                  </CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.total_jobseekers || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Active job seekers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Active Jobs
                  </CardTitle>
                  <Briefcase className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.active_jobs || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Currently open
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pending Employer Verifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Pending Employer Verifications
                  {pendingEmployers.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingEmployers.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingEmployers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p>No pending verifications</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Trust Score</TableHead>
                          <TableHead>Registered</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingEmployers.map((employer) => (
                          <TableRow key={employer.id}>
                            <TableCell className="font-medium">
                              {employer.company_name}
                            </TableCell>
                            <TableCell>{employer.work_email}</TableCell>
                            <TableCell>
                              {getTierBadge(employer.verification_tier)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      employer.trust_score >= 70
                                        ? "bg-green-500"
                                        : employer.trust_score >= 40
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{ 
                                      width: `${employer.trust_score}%` 
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600">
                                  {employer.trust_score}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(employer.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleVerifyEmployer(employer.id, true)}
                                  disabled={verifyingId === employer.id}
                                >
                                  {verifyingId === employer.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleVerifyEmployer(employer.id, false)}
                                  disabled={verifyingId === employer.id}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
