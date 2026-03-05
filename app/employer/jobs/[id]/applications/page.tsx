"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getJobApplications, updateApplicationStatus, type ApplicationStatus,
  bulkATSScore, getATSRankedApplications, type ATSRankedApplication, type ATSReport,
} from "@/lib/api/applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Mail, TrendingUp, Loader2, CheckCircle2, XCircle, Clock,
  Eye, Users, FileText, Zap, BarChart3, AlertTriangle, Star,
} from "lucide-react";
import { toast } from "react-toastify";
import { ApplicationDetailModal } from "@/components/ApplicationDetailModal";

// ---- Types ----
interface BackendApplication {
  id: string;
  job_id: string;
  jobseeker_id: string;
  resume_id: string | null;
  status: ApplicationStatus;
  match_score: number;
  ats_score?: number | null;
  ats_report?: ATSReport | null;
  cover_letter: string | null;
  applied_at: string;
  updated_at: string;
  applicant_name?: string;
  applicant_email?: string;
}

type FilterType = ApplicationStatus | "ALL";

// ---- Recommendation color helper ----
const RECOMMENDATION_CONFIG: Record<string, { color: string; label: string }> = {
  STRONG_MATCH:  { color: "bg-green-100 text-green-800 border-green-200",  label: "Strong Match"  },
  GOOD_MATCH:    { color: "bg-blue-100 text-blue-800 border-blue-200",     label: "Good Match"    },
  PARTIAL_MATCH: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Partial Match" },
  WEAK_MATCH:    { color: "bg-red-100 text-red-800 border-red-200",        label: "Weak Match"    },
};

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [applications, setApplications] = useState<BackendApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("applications");

  // ATS state
  const [bulkScoring, setBulkScoring] = useState(false);
  const [atsRanked, setAtsRanked] = useState<ATSRankedApplication[]>([]);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsRun, setAtsRun] = useState(false);

  useEffect(() => { loadApplications(); }, [jobId, filter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const statusFilter = filter !== "ALL" ? filter : undefined;
      const data = await getJobApplications(jobId, statusFilter);
      setApplications(data as BackendApplication[]);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  // ---- Bulk ATS Scoring ----
  const handleBulkATS = async () => {
    try {
      setBulkScoring(true);
      toast.info("Running ATS scoring... this may take a moment ⏳");
      const result = await bulkATSScore(jobId);
      toast.success(`✅ Scored ${result.scored}/${result.total} applications! (${result.skipped_no_resume} skipped - no resume)`);
      // Now fetch ranked results
      await loadAtsRanked();
      setActiveTab("ats");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to run ATS scoring");
    } finally {
      setBulkScoring(false);
    }
  };

  const loadAtsRanked = async () => {
    try {
      setAtsLoading(true);
      const data = await getATSRankedApplications(jobId);
      setAtsRanked(data.applications);
      setAtsRun(true);
    } catch (error: any) {
      toast.error("Failed to load ATS rankings");
    } finally {
      setAtsLoading(false);
    }
  };

  // ---- Status helpers ----
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const config: Record<ApplicationStatus, { color: string; icon: any; label: string }> = {
      PENDING:             { color: "bg-gray-100 text-gray-800",   icon: Clock,        label: "Pending"   },
      REVIEWED:            { color: "bg-blue-100 text-blue-800",   icon: Eye,          label: "Reviewed"  },
      SHORTLISTED:         { color: "bg-indigo-100 text-indigo-800", icon: Users,      label: "Shortlisted" },
      INTERVIEWSCHEDULED:  { color: "bg-purple-100 text-purple-800", icon: Clock,      label: "Interview" },
      ACCEPTED:            { color: "bg-green-200 text-green-900", icon: CheckCircle2, label: "Accepted"  },
      REJECTED:            { color: "bg-red-100 text-red-800",     icon: XCircle,      label: "Rejected"  },
      WITHDRAWN:           { color: "bg-gray-100 text-gray-600",   icon: XCircle,      label: "Withdrawn" },
    };
    const cfg = config[status];
    const Icon = cfg.icon;
    return <Badge className={`${cfg.color} flex items-center gap-1`}><Icon className="h-3 w-3" />{cfg.label}</Badge>;
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      setUpdatingStatus(applicationId);
      await updateApplicationStatus(applicationId, { status: newStatus });
      toast.success("Application status updated");
      loadApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusActions = (app: BackendApplication) => {
    const isUpdating = updatingStatus === app.id;
    switch (app.status) {
      case "PENDING":   return (<><Button size="sm" variant="outline" onClick={() => handleStatusUpdate(app.id, "REVIEWED")} disabled={isUpdating}>{isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Reviewed"}</Button><Button size="sm" onClick={() => handleStatusUpdate(app.id, "SHORTLISTED")} disabled={isUpdating}>Shortlist</Button></>);
      case "REVIEWED":  return <Button size="sm" onClick={() => handleStatusUpdate(app.id, "SHORTLISTED")} disabled={isUpdating}>{isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Shortlist"}</Button>;
      case "SHORTLISTED": return <Button size="sm" onClick={() => handleStatusUpdate(app.id, "INTERVIEWSCHEDULED")} disabled={isUpdating}>{isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Schedule Interview"}</Button>;
      case "INTERVIEWSCHEDULED": return <Button size="sm" onClick={() => handleStatusUpdate(app.id, "ACCEPTED")} disabled={isUpdating}>{isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}</Button>;
      default: return null;
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "PENDING").length,
    reviewed: applications.filter(a => a.status === "REVIEWED").length,
    shortlisted: applications.filter(a => a.status === "SHORTLISTED").length,
    interview: applications.filter(a => a.status === "INTERVIEWSCHEDULED").length,
    accepted: applications.filter(a => a.status === "ACCEPTED").length,
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Back to Jobs</Button>
          <h1 className="text-3xl font-bold mb-2">Job Applications</h1>
          <p className="text-gray-600">Review and manage applications for this position</p>
        </div>
        {/* 🔥 ATS SCORE BUTTON */}
        <Button
          onClick={handleBulkATS}
          disabled={bulkScoring}
          className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2 mt-10"
        >
          {bulkScoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {bulkScoring ? "Scoring resumes..." : "Run ATS Score"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "" },
          { label: "Pending", value: stats.pending, color: "text-gray-600" },
          { label: "Reviewed", value: stats.reviewed, color: "text-blue-600" },
          { label: "Shortlisted", value: stats.shortlisted, color: "text-indigo-600" },
          { label: "Interview", value: stats.interview, color: "text-purple-600" },
          { label: "Accepted", value: stats.accepted, color: "text-green-600" },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-600">{s.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="applications"><Users className="h-4 w-4 mr-2" />Applications</TabsTrigger>
          <TabsTrigger value="ats"><BarChart3 className="h-4 w-4 mr-2" />ATS Rankings {atsRun && <Badge className="ml-2 bg-purple-100 text-purple-800">{atsRanked.length}</Badge>}</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Tabs value={filter} onValueChange={v => setFilter(v as FilterType)}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full mb-6">
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="REVIEWED">Reviewed</TabsTrigger>
              <TabsTrigger value="SHORTLISTED">Shortlisted</TabsTrigger>
              <TabsTrigger value="INTERVIEWSCHEDULED">Interview</TabsTrigger>
              <TabsTrigger value="ACCEPTED">Accepted</TabsTrigger>
            </TabsList>
            <TabsContent value={filter}>
              {applications.length === 0 ? (
                <Card><CardContent className="p-12 text-center"><p className="text-gray-500">No applications found</p></CardContent></Card>
              ) : (
                <div className="space-y-4">
                  {applications.map(app => {
                    const name = app.applicant_name || "Unknown Applicant";
                    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                    return (
                      <Card key={app.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <Avatar className="h-16 w-16"><AvatarFallback className="text-lg bg-primary/10">{initials}</AvatarFallback></Avatar>
                              <div className="flex-1">
                                <CardTitle className="text-xl mb-1">{name}</CardTitle>
                                {app.applicant_email && <div className="flex items-center gap-1 text-sm text-gray-500"><Mail className="h-4 w-4" />{app.applicant_email}</div>}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(app.status)}
                              <Badge className={`${getMatchScoreColor(app.match_score)} flex items-center gap-1`}><TrendingUp className="h-3 w-3" />{app.match_score}% Match</Badge>
                              {/* Show ATS score if available */}
                              {app.ats_score != null && (
                                <Badge className={`${getMatchScoreColor(app.ats_score)} flex items-center gap-1`}>
                                  <Zap className="h-3 w-3" />ATS: {app.ats_score}
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 pt-4 border-t flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => setSelectedApplicationId(app.id)}><FileText className="h-4 w-4 mr-2" />View Full Details</Button>
                            {getStatusActions(app)}
                            {app.status !== "REJECTED" && app.status !== "WITHDRAWN" && app.status !== "ACCEPTED" && (
                              <Button variant="destructive" size="sm" onClick={() => handleStatusUpdate(app.id, "REJECTED")} disabled={updatingStatus === app.id} className="ml-auto">Reject</Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ATS Rankings Tab */}
        <TabsContent value="ats">
          {!atsRun ? (
            <Card>
              <CardContent className="p-12 text-center space-y-4">
                <Zap className="h-16 w-16 text-purple-400 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-700">ATS Scoring Not Run Yet</h3>
                <p className="text-gray-500">Click the <strong>"Run ATS Score"</strong> button above to AI-score all resumes against this job.</p>
                <Button onClick={handleBulkATS} disabled={bulkScoring} className="bg-purple-600 hover:bg-purple-700">
                  {bulkScoring ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Scoring...</> : <><Zap className="h-4 w-4 mr-2" />Run ATS Score Now</>}
                </Button>
              </CardContent>
            </Card>
          ) : atsLoading ? (
            <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>
          ) : atsRanked.length === 0 ? (
            <Card><CardContent className="p-12 text-center"><p className="text-gray-500">No scored applications yet. Make sure resumes are parsed first.</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">📊 Candidates Ranked by ATS Score</h2>
                <Button variant="outline" size="sm" onClick={handleBulkATS} disabled={bulkScoring}>
                  {bulkScoring ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Zap className="h-4 w-4 mr-1" />} Re-run Scoring
                </Button>
              </div>
              {atsRanked.map((app, index) => {
                const recConfig = RECOMMENDATION_CONFIG[app.recommendation ?? ""] ?? { color: "bg-gray-100 text-gray-700", label: app.recommendation };
                const scoreColor = (app.ats_score ?? 0) >= 80 ? "text-green-600" : (app.ats_score ?? 0) >= 60 ? "text-yellow-600" : "text-red-600";
                return (
                  <Card key={app.application_id} className={`border-l-4 ${index === 0 ? "border-l-yellow-400" : index === 1 ? "border-l-gray-400" : index === 2 ? "border-l-orange-400" : "border-l-purple-200"}`}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {/* Rank Badge */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${index === 0 ? "bg-yellow-100 text-yellow-700" : index === 1 ? "bg-gray-100 text-gray-600" : index === 2 ? "bg-orange-100 text-orange-600" : "bg-purple-50 text-purple-600"}`}>
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{app.applicant_name ?? "Unknown"}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={recConfig.color}><Star className="h-3 w-3 mr-1" />{recConfig.label}</Badge>
                              {getStatusBadge(app.status)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-center">
                          <div>
                            <p className="text-xs text-gray-500">ATS Score</p>
                            <p className={`text-2xl font-bold ${scoreColor}`}>{app.ats_score ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Skill Match</p>
                            <p className="text-2xl font-bold text-blue-600">{app.match_score}%</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setSelectedApplicationId(app.application_id)}>
                            <FileText className="h-4 w-4 mr-1" />Details
                          </Button>
                        </div>
                      </div>
                      {/* Score bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${(app.ats_score ?? 0) >= 80 ? "bg-green-500" : (app.ats_score ?? 0) >= 60 ? "bg-yellow-500" : "bg-red-400"}`}
                            style={{ width: `${app.ats_score ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedApplicationId && (
        <ApplicationDetailModal
          applicationId={selectedApplicationId}
          isOpen={!!selectedApplicationId}
          onClose={() => setSelectedApplicationId(null)}
        />
      )}
    </div>
  );
}
