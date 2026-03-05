"use client";
// app/employer/jobs/[id]/applications/page.tsx
// Full enhanced pipeline: Review → Shortlist → Broadcast → Schedule Interview

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Mail, TrendingUp, Loader2, CheckCircle2, XCircle,
  Clock, Eye, Users, FileText, ChevronRight, Send,
  Calendar, MessageSquare, Award, Filter, Search,
  AlertCircle, Star, ArrowRight, Megaphone, Video,
  MapPin, Phone
} from "lucide-react";
import { getJobApplications, updateApplicationStatus, type ApplicationStatus } from "@/lib/api/applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ApplicationDetailModal from "@/components/ApplicationDetailModal";
import { useNotify } from "@/components/ui/AppNotification";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Application {
  id: string;
  job_id: string;
  status: ApplicationStatus;
  match_score: number;
  cover_letter: string | null;
  applied_at: string;
  applicant_name?: string;
  applicant_email?: string;
}

type FilterType = ApplicationStatus | "ALL";

const STATUS_CONFIG: Record<string, { color: string; bg: string; dot: string; label: string }> = {
  PENDING:             { color: "text-gray-600",   bg: "bg-gray-100 dark:bg-gray-800",    dot: "bg-gray-400",   label: "Pending" },
  REVIEWED:            { color: "text-blue-700",   bg: "bg-blue-50 dark:bg-blue-900/30",  dot: "bg-blue-500",   label: "Reviewed" },
  SHORTLISTED:         { color: "text-violet-700", bg: "bg-violet-50 dark:bg-violet-900/30", dot: "bg-violet-500", label: "Shortlisted" },
  INTERVIEW_SCHEDULED: { color: "text-purple-700", bg: "bg-purple-50 dark:bg-purple-900/30", dot: "bg-purple-500", label: "Interview" },
  ACCEPTED:            { color: "text-emerald-700",bg: "bg-emerald-50 dark:bg-emerald-900/30", dot: "bg-emerald-500", label: "Accepted" },
  REJECTED:            { color: "text-red-600",    bg: "bg-red-50 dark:bg-red-900/30",    dot: "bg-red-400",    label: "Rejected" },
  WITHDRAWN:           { color: "text-gray-500",   bg: "bg-gray-100 dark:bg-gray-800",    dot: "bg-gray-300",   label: "Withdrawn" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-400" : "bg-red-400";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Fair";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Match</span>
        <span className="font-semibold text-gray-700 dark:text-gray-300">{score}% — {label}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// ─── Broadcast Modal ─────────────────────────────────────────────────────────

function BroadcastModal({ jobId, open, onClose, notify }: { jobId: string; open: boolean; onClose: () => void; notify: any }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!subject.trim() || !message.trim()) {
      notify.warning("Missing fields", "Please fill in both subject and message");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/interviews/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ job_id: jobId, subject, message, send_email: true, send_notification: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      notify.success("Message sent!", `Delivered to ${data.recipients_count} shortlisted candidate(s)`);
      onClose();
      setSubject(""); setMessage("");
    } catch (err: any) {
      notify.error("Failed to send", err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-violet-600" />
            Broadcast to Shortlisted Candidates
          </DialogTitle>
          <DialogDescription>
            Send a message to all shortlisted candidates via email and in-app notification.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Subject</label>
            <Input placeholder="e.g. Next Steps for Your Application" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Message</label>
            <Textarea
              placeholder="Write your message to all shortlisted candidates..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{message.length} / 5000</p>
          </div>
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
            <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              This message will be sent to all candidates currently with SHORTLISTED status. It cannot be undone.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>Cancel</Button>
          <Button onClick={handleSend} disabled={sending} className="bg-violet-600 hover:bg-violet-700 text-white">
            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Send to All Shortlisted
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Interview Schedule Modal ─────────────────────────────────────────────────

const STYLES = [
  { value: "in_person", label: "In-Person", icon: MapPin },
  { value: "video_call", label: "Video Call", icon: Video },
  { value: "phone_call", label: "Phone Call", icon: Phone },
  { value: "technical", label: "Technical", icon: Award },
  { value: "panel", label: "Panel", icon: Users },
];

function InterviewModal({ applicationId, open, onClose, notify, onSuccess }: {
  applicationId: string; open: boolean; onClose: () => void; notify: any; onSuccess: () => void;
}) {
  const [style, setStyle] = useState("in_person");
  const [slots, setSlots] = useState([{ datetime: "", duration: 60 }]);
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [instructions, setInstructions] = useState("");
  const [allowStyleChoice, setAllowStyleChoice] = useState(false);
  const [sending, setSending] = useState(false);

  function addSlot() {
    setSlots(prev => [...prev, { datetime: "", duration: 60 }]);
  }
  function removeSlot(i: number) {
    setSlots(prev => prev.filter((_, idx) => idx !== i));
  }
  function updateSlot(i: number, field: "datetime" | "duration", val: string | number) {
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  }

  async function handleSchedule() {
    const validSlots = slots.filter(s => s.datetime);
    if (!validSlots.length) {
      notify.warning("Add at least one time slot");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/interviews/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          application_id: applicationId,
          style,
          proposed_slots: validSlots.map(s => ({ datetime_utc: new Date(s.datetime).toISOString(), duration_minutes: s.duration })),
          location: location || undefined,
          meeting_link: meetingLink || undefined,
          allow_style_choice: allowStyleChoice,
          instructions: instructions || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      notify.success("Interview scheduled!", "The candidate has been notified via email");
      onClose();
      onSuccess();
    } catch (err: any) {
      notify.error("Failed to schedule", err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Schedule Interview
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Style picker */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Interview Style</label>
            <div className="grid grid-cols-3 gap-2">
              {STYLES.map(s => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-all
                      ${style === s.value
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Proposed Time Slots</label>
              <button onClick={addSlot} className="text-xs text-purple-600 hover:underline">+ Add slot</button>
            </div>
            <div className="space-y-2">
              {slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="datetime-local"
                    value={slot.datetime}
                    onChange={e => updateSlot(i, "datetime", e.target.value)}
                    className="flex-1 text-sm border rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                  />
                  <select
                    value={slot.duration}
                    onChange={e => updateSlot(i, "duration", parseInt(e.target.value))}
                    className="text-sm border rounded-lg px-2 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                  >
                    {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d}m</option>)}
                  </select>
                  {slots.length > 1 && (
                    <button onClick={() => removeSlot(i)} className="text-gray-400 hover:text-red-500">
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Location / link */}
          {style === "in_person" || style === "panel" ? (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Location</label>
              <Input placeholder="Office address or building" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
          ) : style !== "phone_call" ? (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Meeting Link</label>
              <Input placeholder="Zoom / Google Meet / Teams URL" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} />
            </div>
          ) : null}

          {/* Instructions */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Instructions for Candidate <span className="text-gray-400 font-normal">(optional)</span></label>
            <Textarea placeholder="e.g. Please prepare a short portfolio presentation..." value={instructions} onChange={e => setInstructions(e.target.value)} rows={3} className="resize-none" />
          </div>

          {/* Allow style choice */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => setAllowStyleChoice(!allowStyleChoice)}
              className={`h-5 w-9 rounded-full transition-colors relative cursor-pointer ${allowStyleChoice ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-700"}`}
            >
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${allowStyleChoice ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Allow candidate to choose interview style</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>Cancel</Button>
          <Button onClick={handleSchedule} disabled={sending} className="bg-purple-600 hover:bg-purple-700 text-white">
            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
            Schedule & Notify Candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const notify = useNotify();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [interviewTarget, setInterviewTarget] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { loadApplications(); }, [jobId, filter]);

  async function loadApplications() {
    try {
      setLoading(true);
      const statusFilter = filter !== "ALL" ? filter : undefined;
      const data = await getJobApplications(jobId, statusFilter);
      setApplications(data as Application[]);
    } catch (err: any) {
      notify.error("Failed to load applications", err?.response?.data?.detail);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(applicationId: string, newStatus: ApplicationStatus, silent = false) {
    try {
      setUpdatingStatus(applicationId);
      await updateApplicationStatus(applicationId, { status: newStatus });
      if (!silent) notify.success("Status updated", `Application marked as ${STATUS_CONFIG[newStatus]?.label}`);
      loadApplications();
    } catch (err: any) {
      notify.error("Failed to update", err?.response?.data?.detail || "Please try again");
    } finally {
      setUpdatingStatus(null);
    }
  }

  const filteredApps = applications.filter(app => {
    const q = search.toLowerCase();
    return !q || app.applicant_name?.toLowerCase().includes(q) || app.applicant_email?.toLowerCase().includes(q);
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "PENDING").length,
    reviewed: applications.filter(a => a.status === "REVIEWED").length,
    shortlisted: applications.filter(a => a.status === "SHORTLISTED").length,
    interview: applications.filter(a => a.status === "INTERVIEW_SCHEDULED").length,
    accepted: applications.filter(a => a.status === "ACCEPTED").length,
  };

  const shortlistedCount = applications.filter(a => a.status === "SHORTLISTED").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <Button variant="ghost" onClick={() => router.back()} className="mb-3 -ml-2">
              <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
              Back to Jobs
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Applications Pipeline</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and progress your candidates through the hiring pipeline</p>
          </div>
          {shortlistedCount > 0 && (
            <Button
              onClick={() => setBroadcastOpen(true)}
              variant="outline"
              className="border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400"
            >
              <Megaphone className="h-4 w-4 mr-2" />
              Message Shortlisted ({shortlistedCount})
            </Button>
          )}
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {[
            { label: "Total", val: stats.total, color: "text-gray-900 dark:text-gray-100" },
            { label: "Pending", val: stats.pending, color: "text-gray-600" },
            { label: "Reviewed", val: stats.reviewed, color: "text-blue-600" },
            { label: "Shortlisted", val: stats.shortlisted, color: "text-violet-600" },
            { label: "Interview", val: stats.interview, color: "text-purple-600" },
            { label: "Accepted", val: stats.accepted, color: "text-emerald-600" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 p-3 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        <Tabs value={filter} onValueChange={v => setFilter(v as FilterType)}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-5">
            {["ALL", "PENDING", "REVIEWED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "ACCEPTED", "REJECTED"].map(tab => (
              <TabsTrigger key={tab} value={tab} className="text-xs rounded-lg">
                {tab === "ALL" ? "All" : STATUS_CONFIG[tab]?.label ?? tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={filter}>
            {filteredApps.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
                <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No applications found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {filter !== "ALL" ? `No ${STATUS_CONFIG[filter]?.label ?? filter} applications` : "Applications will appear here once candidates apply"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApps.map(app => {
                  const name = app.applicant_name || "Unknown Applicant";
                  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                  const isUpdating = updatingStatus === app.id;

                  return (
                    <div
                      key={app.id}
                      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 hover:border-violet-200 dark:hover:border-violet-800 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <Avatar className="h-12 w-12 shrink-0">
                            <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 text-violet-700 dark:text-violet-300">
                              {initials}
                            </AvatarFallback>
                          </Avatar>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
                                {app.applicant_email && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                    <Mail className="h-3 w-3" />
                                    {app.applicant_email}
                                  </div>
                                )}
                                <div className="text-xs text-gray-400 mt-0.5">
                                  Applied {new Date(app.applied_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </div>
                              </div>
                              <StatusBadge status={app.status} />
                            </div>

                            {/* Score */}
                            <div className="mt-3 max-w-xs">
                              <ScoreBar score={app.match_score} />
                            </div>

                            {/* Cover letter preview */}
                            {app.cover_letter && (
                              <p className="mt-2 text-xs text-gray-500 line-clamp-2 italic">
                                "{app.cover_letter}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 flex-wrap">
                          {/* View details */}
                          <Button variant="outline" size="sm" onClick={() => setSelectedApplicationId(app.id)} className="text-xs">
                            <FileText className="h-3.5 w-3.5 mr-1.5" />
                            View Details
                          </Button>

                          {/* Pipeline actions */}
                          {app.status === "PENDING" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(app.id, "REVIEWED")} disabled={isUpdating} className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50">
                                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                                Mark Reviewed
                              </Button>
                              <Button size="sm" onClick={() => handleStatusUpdate(app.id, "SHORTLISTED")} disabled={isUpdating} className="text-xs bg-violet-600 hover:bg-violet-700 text-white">
                                <Star className="h-3.5 w-3.5 mr-1" />
                                Shortlist
                              </Button>
                            </>
                          )}

                          {app.status === "REVIEWED" && (
                            <Button size="sm" onClick={() => handleStatusUpdate(app.id, "SHORTLISTED")} disabled={isUpdating} className="text-xs bg-violet-600 hover:bg-violet-700 text-white">
                              {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Star className="h-3.5 w-3.5 mr-1" />}
                              Shortlist
                            </Button>
                          )}

                          {app.status === "SHORTLISTED" && (
                            <Button size="sm" onClick={() => setInterviewTarget(app.id)} className="text-xs bg-purple-600 hover:bg-purple-700 text-white">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              Schedule Interview
                            </Button>
                          )}

                          {app.status === "INTERVIEW_SCHEDULED" && (
                            <Button size="sm" onClick={() => handleStatusUpdate(app.id, "ACCEPTED")} disabled={isUpdating} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                              {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                              Accept Candidate
                            </Button>
                          )}

                          {/* Chat button (for reviewed and above) */}
                          {!["PENDING", "REJECTED", "WITHDRAWN"].includes(app.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-gray-500 hover:text-violet-700 ml-auto"
                              onClick={() => router.push(`/employer/chat?application=${app.id}`)}
                            >
                              <MessageSquare className="h-3.5 w-3.5 mr-1" />
                              Message
                            </Button>
                          )}

                          {/* Reject */}
                          {!["REJECTED", "WITHDRAWN", "ACCEPTED"].includes(app.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                              disabled={isUpdating}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {selectedApplicationId && (
        <ApplicationDetailModal
          applicationId={selectedApplicationId}
          isOpen={!!selectedApplicationId}
          onClose={() => setSelectedApplicationId(null)}
        />
      )}

      <BroadcastModal
        jobId={jobId}
        open={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        notify={notify}
      />

      {interviewTarget && (
        <InterviewModal
          applicationId={interviewTarget}
          open={!!interviewTarget}
          onClose={() => setInterviewTarget(null)}
          notify={notify}
          onSuccess={loadApplications}
        />
      )}
    </>
  );
}