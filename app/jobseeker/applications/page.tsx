"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getMyApplications, withdrawApplication, Application } from "@/lib/api/applications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, Loader2, XCircle, Building, Calendar } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  SHORTLISTED: "bg-purple-100 text-purple-800",
  INTERVIEW_SCHEDULED: "bg-indigo-100 text-indigo-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-gray-100 text-gray-800",
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  async function fetchApplications() {
    try {
      setLoading(true);
      const data = await getMyApplications(statusFilter || undefined);
      setApplications(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw(applicationId: string) {
    if (!confirm("Are you sure you want to withdraw this application?")) return;

    try {
      await withdrawApplication(applicationId);
      toast.success("Application withdrawn successfully");
      fetchApplications();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to withdraw application");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600 mt-1">Track the status of your job applications</p>
          </div>

          {/* Filter */}
          <div className="w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Applications</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REVIEWED">Reviewed</SelectItem>
                <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                <SelectItem value="INTERVIEW_SCHEDULED">Interview Scheduled</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Applications Table */}
        {applications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">No applications yet</h3>
                <p className="text-gray-600 mt-1">
                  Start applying to jobs to see your applications here
                </p>
              </div>
              <Link href="/jobs">
                <Button className="bg-purple-600 hover:bg-purple-700">Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Match Score</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/jobs/${app.job_id}`}
                            className="text-purple-600 hover:underline"
                          >
                            {app.job_title || "Job Title"}
                          </Link>
                        </TableCell>
                        <TableCell>{app.company_name || "Company"}</TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[app.status] || ""}>
                            {app.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${app.match_score}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{app.match_score}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(app.applied_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          {app.status === "PENDING" || app.status === "REVIEWED" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleWithdraw(app.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Withdraw
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-500">No actions</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 space-y-3">
                    <div>
                      <Link
                        href={`/jobs/${app.job_id}`}
                        className="font-medium text-purple-600 hover:underline"
                      >
                        {app.job_title || "Job Title"}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Building className="h-4 w-4" />
                        {app.company_name || "Company"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className={STATUS_COLORS[app.status] || ""}>
                        {app.status.replace(/_/g, " ")}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${app.match_score}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{app.match_score}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(app.applied_at).toLocaleDateString()}
                      </div>
                      {app.status === "PENDING" || app.status === "REVIEWED" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleWithdraw(app.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Withdraw
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
