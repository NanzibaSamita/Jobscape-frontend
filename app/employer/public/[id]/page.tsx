"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Building,
  MapPin,
  Globe,
  Briefcase,
  MessageSquare,
  Users,
  ChevronRight,
  ArrowLeft,
  Shield,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  getEmployerPublicProfile,
  EmployerPublicResponse,
} from "@/lib/api/employer";
import { Job } from "@/lib/api/jobs";
import MessageDialog from "@/components/MessageDialogue";

export default function EmployerPublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const employerId = id as string;

  const [data, setData] = useState<EmployerPublicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchData();
  }, [employerId]);

  async function fetchData() {
    try {
      setLoading(true);
      const result = await getEmployerPublicProfile(employerId);
      setData(result);
    } catch (error: any) {
      dispatch(showAlert({
        title: "Load Error",
        message: "Failed to load employer profile",
        type: "error"
      }));
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

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Employer not found</p>
      </div>
    );
  }

  const { employer, active_jobs, employees_on_platform, response_rate } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors p-0 h-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>

        {/* Company Hero Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-start">
              {/* Logo */}
              {employer.logo_url ? (
                <img
                  src={employer.logo_url}
                  alt={employer.company_name}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-purple-100 flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Building className="h-10 w-10 text-purple-600" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {employer.company_name}
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  {employer.full_name}
                  {employer.job_title && ` • ${employer.job_title}`}
                </p>

                <div className="flex gap-2 mt-3 flex-wrap">
                  {employer.verification_tier !== "UNVERIFIED" && (
                    <Badge className="bg-green-100 text-green-800 border-0">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {employer.industry && (
                    <Badge variant="outline">{employer.industry}</Badge>
                  )}
                  {employer.company_size && (
                    <Badge variant="outline">{employer.company_size}</Badge>
                  )}
                  {response_rate != null && (
                    <Badge className="bg-blue-100 text-blue-800 border-0">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {response_rate}% Response Rate
                    </Badge>
                  )}
                </div>
              </div>

              {/* Message Button */}
              <Button
                onClick={() => setIsMessageOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 flex-shrink-0"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>

            {employer.description && (
              <p className="mt-4 text-gray-600 text-sm leading-relaxed">
                {employer.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
              {employer.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {employer.location}
                </span>
              )}
              {employer.company_website && (
                <a
                  href={employer.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline flex items-center gap-1"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {employer.total_job_posts_count} jobs posted
              </span>
              {employer.trust_score > 0 && (
                <span className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Trust Score: {employer.trust_score}/100
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Open Positions ({active_jobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {active_jobs.length === 0 ? (
              <p className="text-gray-500 text-sm">No open positions right now.</p>
            ) : (
              <div className="space-y-3">
                {active_jobs.map((job: Job) => {
                  const daysLeft = Math.ceil(
                    (new Date(job.application_deadline).getTime() - Date.now()) /
                      86400000
                  );
                  return (
                    <Link key={job.id} href={`/jobs/${job.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-colors cursor-pointer group">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-900 group-hover:text-purple-700">
                              {job.title}
                            </p>
                            {daysLeft > 0 && daysLeft <= 3 && (
                              <Badge className="bg-red-100 text-red-700 border-0 text-xs animate-pulse">
                                Closing in {daysLeft}d
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {job.location} • {job.job_type} •{" "}
                            {job.work_mode}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employees on Platform */}
        {employees_on_platform.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                People from {employer.company_name} on Jobscape
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {employees_on_platform.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    {emp.profile_picture_url ? (
                      <img
                        src={emp.profile_picture_url}
                        alt={emp.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                    )}
                    <p className="text-sm font-medium mt-2 text-center text-gray-900 line-clamp-1">
                      {emp.full_name}
                    </p>
                    {emp.primary_industry && (
                      <p className="text-xs text-gray-500 text-center line-clamp-1">
                        {emp.primary_industry}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <MessageDialog
        open={isMessageOpen}
        onOpenChange={setIsMessageOpen}
        recipientId={employerId}
        recipientType="employer"
      />
    </div>
  );
}
