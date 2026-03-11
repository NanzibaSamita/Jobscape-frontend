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
  MapPin, Phone, PartyPopper, ClipboardCheck
} from "lucide-react";
import { getJobApplications, updateApplicationStatus, type ApplicationStatus } from "@/lib/api/applications";
import { axiosInstance } from "@/lib/axios/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ApplicationDetailModal from "@/components/ApplicationDetailModal";
import ManagePoolModal from "@/components/ManagePoolModal";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";
import InterviewReviewModal from "@/components/InterviewReviewModal";
import AnnounceSelectionModal from "@/components/AnnounceSelectionModal";

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
  ats_score?: number;
  ats_report?: any;
  current_round: number;
  booked_slot_id?: string | null;
  booked_slot_datetime?: string | null;
  booked_slot_duration_minutes?: number | null;
  booked_slot_location?: string | null;
  booked_slot_style?: string | null;
  booked_slot_meeting_link?: string | null;
}

type FilterType = ApplicationStatus | "ALL" | "SCHEDULE";

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

function ATSBadge({ score }: { score: number | undefined }) {
  if (score === undefined || score === null) return null;
  const color = score >= 85 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : score >= 70 ? "text-blue-700 bg-blue-50 border-blue-200" : "text-amber-700 bg-amber-50 border-amber-200";
  return (
    <Badge variant="outline" className={`${color} font-bold`}>
      ATS: {score}%
    </Badge>
  );
}

// ─── Broadcast Modal ─────────────────────────────────────────────────────────

function BroadcastModal({ jobId, open, onClose }: { jobId: string; open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["SHORTLISTED"]);
  const [sending, setSending] = useState(false);

  const BROADCAST_STATUSES = [
    { value: "PENDING", label: "Pending" },
    { value: "REVIEWED", label: "Reviewed" },
    { value: "SHORTLISTED", label: "Shortlisted" },
    { value: "INTERVIEW_SCHEDULED", label: "Interview" },
    { value: "ACCEPTED", label: "Accepted" },
  ];

  function toggleStatus(status: string) {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  }

  async function handleSend() {
    if (!subject.trim() || !message.trim()) {
      dispatch(showAlert({
        title: "Missing fields",
        message: "Please fill in both subject and message",
        type: "warning"
      }));
      return;
    }
    if (selectedStatuses.length === 0) {
      dispatch(showAlert({
        title: "No target selected",
        message: "Please select at least one application stage",
        type: "warning"
      }));
      return;
    }

    setSending(true);
    try {
      const payloadMessage = subject ? `**${subject}**\n\n${message}` : message;
      const res = await axiosInstance.post(`/chat/job/${jobId}/bulk-message`, {
        message: payloadMessage,
        statuses: selectedStatuses
      });
      dispatch(showAlert({
        title: "Message sent!",
        message: `Delivered to ${res.data.sent_count} candidate(s)`,
        type: "success"
      }));
      onClose();
      setSubject(""); setMessage("");
    } catch (err: any) {
      dispatch(showAlert({
        title: "Failed to send",
        message: err?.response?.data?.detail || err.message,
        type: "error"
      }));
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
            Targeted Announcement
          </DialogTitle>
          <DialogDescription>
            Send a message to candidates in specific stages via email and in-app notification.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Target Stages</label>
            <div className="flex flex-wrap gap-2">
              {BROADCAST_STATUSES.map(s => (
                <button
                  key={s.value}
                  onClick={() => toggleStatus(s.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                    ${selectedStatuses.includes(s.value)
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700"
                    }`}
                >
                  {selectedStatuses.includes(s.value) && "✓ "}
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Subject</label>
            <Input placeholder="e.g. Next Steps for Your Application" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Message</label>
            <Textarea
              placeholder="Write your announcement message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{message.length} / 5000</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>Cancel</Button>
          <Button onClick={handleSend} disabled={sending} className="bg-violet-600 hover:bg-violet-700 text-white">
            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Send Announcement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Bulk Shortlist Modal ────────────────────────────────────────────────────

function BulkShortlistModal({ jobId, open, onClose, onSuccess }: { jobId: string; open: boolean; onClose: () => void; onSuccess: () => void; }) {
  const dispatch = useAppDispatch();
  const [threshold, setThreshold] = useState<number>(70);
  const [processing, setProcessing] = useState(false);

  async function handleExecute() {
    setProcessing(true);
    try {
      const res = await axiosInstance.post(`/applications/job/${jobId}/bulk-shortlist`, {
        ats_threshold: threshold
      });
      dispatch(showAlert({
        title: "Bulk shortlisting complete!",
        message: `Shortlisted ${res.data.shortlisted} candidates, rejected ${res.data.rejected}.`,
        type: "success"
      }));
      onSuccess();
      onClose();
    } catch (err: any) {
      dispatch(showAlert({
        title: "Execution failed",
        message: err?.response?.data?.detail || err.message,
        type: "error"
      }));
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-violet-600" />
            Auto-Shortlist Candidates
          </DialogTitle>
          <DialogDescription>
            Automatically shortlist or reject PENDING applications based on their ATS score.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">ATS Minimum Threshold (%)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="0" max="100" 
                value={threshold} 
                onChange={e => setThreshold(parseInt(e.target.value))} 
                className="flex-1 accent-violet-600 cursor-pointer"
              />
              <span className="font-bold text-violet-700 w-12">{threshold}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Candidates meeting or exceeding this threshold will be shortlisted and invited to the first round. Others will receive a standard rejection email.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={processing}>Cancel</Button>
          <Button onClick={handleExecute} disabled={processing} className="bg-violet-600 hover:bg-violet-700 text-white">
            {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Execute Auto-Shortlist
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

function InterviewModal({ applicationId, open, onClose, onSuccess }: {
  applicationId: string; open: boolean; onClose: () => void; onSuccess: () => void;
}) {
  const dispatch = useAppDispatch();
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
    console.log("DEBUG: handleSchedule called. Status of applicationId:", applicationId);
    const validSlots = slots.filter(s => s.datetime);
    console.log("DEBUG: Number of valid slots:", validSlots.length);
    
    if (!validSlots.length) {
      console.warn("DEBUG: No valid slots found. Returning.");
      dispatch(showAlert({
        title: "Validation Error",
        message: "Add at least one time slot",
        type: "warning"
      }));
      return;
    }

    setSending(true);
    try {
      console.log("DEBUG: Constructing payload. Style:", style, "AllowStyleChoice:", allowStyleChoice);
      const payload = {
        application_id: applicationId,
        style,
        proposed_slots: validSlots.map(s => {
          const d = new Date(s.datetime);
          if (isNaN(d.getTime())) {
             console.error("DEBUG: Invalid date encountered:", s.datetime);
             throw new Error(`Invalid date format selected: ${s.datetime}`);
          }
          return { 
            datetime_utc: d.toISOString(), 
            duration_minutes: s.duration 
          };
        }),
        location: location || undefined,
        meeting_link: meetingLink || undefined,
        allow_style_choice: allowStyleChoice,
        instructions: instructions || undefined,
      };

      console.log("DEBUG: Invoking axiosInstance.post('/interviews/schedule') with payload:", payload);
      const response = await axiosInstance.post(`/interviews/schedule`, payload);
      console.log("DEBUG: Received success response from server:", response.data);
      
      dispatch(showAlert({
        title: "Interview scheduled!",
        message: "The candidate has been notified via email",
        type: "success"
      }));
      onClose();
      onSuccess();
    } catch (err: any) {
      console.error("DEBUG: Caught error during schedule attempt:", err);
      const errorMessage = err?.response?.data?.detail || err.message || "An unexpected error occurred. Please check console.";
      dispatch(showAlert({
        title: "Failed to schedule",
        message: errorMessage,
        type: "error"
      }));
    } finally {
      setSending(false);
      console.log("DEBUG: handleSchedule execution complete. sending=false");
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
            <div className={`grid grid-cols-3 gap-2 ${allowStyleChoice ? "opacity-50 pointer-events-none" : ""}`}>
              {STYLES.map(s => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    disabled={allowStyleChoice}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-all
                      ${style === s.value && !allowStyleChoice
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
  const dispatch = useAppDispatch();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [shortlistOpen, setShortlistOpen] = useState(false);
  const [interviewTarget, setInterviewTarget] = useState<string | null>(null);
  const [poolOpen, setPoolOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ id: string; appId: string; name: string } | null>(null);
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [minAtsScore, setMinAtsScore] = useState<number>(0);
  const [selectionProcess, setSelectionProcess] = useState<any>(null);
  const [startingInterview, setStartingInterview] = useState<string | null>(null);

  useEffect(() => { 
    loadApplications(); 
    loadSelectionProcess();
  }, [jobId, filter, minAtsScore]);

  async function loadSelectionProcess() {
    try {
      const res = await axiosInstance.get(`/selection/job/${jobId}`);
      setSelectionProcess(res.data);
    } catch (err) {
      console.error("No selection process found for this job");
    }
  }

  async function loadApplications() {
    try {
      setLoading(true);
      const statusFilter = filter !== "ALL" ? filter : undefined;
      const data = await getJobApplications(jobId, statusFilter, undefined, minAtsScore > 0 ? minAtsScore : undefined);
      setApplications(data as Application[]);
    } catch (err: any) {
      dispatch(showAlert({
        title: "Load Error",
        message: err?.response?.data?.detail || "Failed to load applications",
        type: "error"
      }));
    } finally {
      setLoading(false);
    }
  }

  async function handleAdvance(applicationId: string) {
    try {
      setUpdatingStatus(applicationId);
      await axiosInstance.post(`/applications/${applicationId}/advance`);
      dispatch(showAlert({
        title: "Candidate Advanced",
        message: "Moving to the next selection round",
        type: "success"
      }));
      loadApplications();
    } catch (err: any) {
      dispatch(showAlert({
        title: "Failed to advance",
        message: err?.response?.data?.detail || "Please try again",
        type: "error"
      }));
    } finally {
      setUpdatingStatus(null);
    }
  }

  async function handleStatusUpdate(applicationId: string, newStatus: ApplicationStatus, silent = false) {
    try {
      setUpdatingStatus(applicationId);
      await updateApplicationStatus(applicationId, { status: newStatus });
      if (!silent) {
        dispatch(showAlert({
          title: "Status updated",
          message: `Application marked as ${STATUS_CONFIG[newStatus]?.label}`,
          type: "success"
        }));
      }
      loadApplications();
    } catch (err: any) {
      dispatch(showAlert({
        title: "Failed to update",
        message: err?.response?.data?.detail || "Please try again",
        type: "error"
      }));
    } finally {
      setUpdatingStatus(null);
    }
  }

  async function handleStartInterview(applicationId: string) {
    try {
      setStartingInterview(applicationId);
      const res = await axiosInstance.get(`/interviews/application/${applicationId}`);
      const schedule = res.data;
      
      if (!schedule?.schedule_id) throw new Error("No active interview schedule found");

      await axiosInstance.post(`/interviews/${schedule.schedule_id}/start`);
      
      dispatch(showAlert({
        title: "Interview Started",
        message: "Redirecting to video room...",
        type: "success"
      }));

      // Redirect to the new video room page
      const roomPath = (schedule.meeting_link?.startsWith('/')) ? schedule.meeting_link : `/interview/${schedule.schedule_id}`;
      router.push(roomPath);
    } catch (err: any) {
      dispatch(showAlert({
        title: "Error starting interview",
        message: err?.response?.data?.detail || err.message || "Failed to notify candidate",
        type: "error"
      }));
    } finally {
      setStartingInterview(null);
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

  // Group scheduled interviews by slot
  const scheduledApps = applications.filter(a => !!a.booked_slot_id);
  const slotsMap = new Map<string, {
    id: string;
    datetime: string;
    location: string | null;
    link: string | null;
    style: string | null;
    apps: Application[];
  }>();

  scheduledApps.forEach(a => {
    if (!slotsMap.has(a.booked_slot_id!)) {
      slotsMap.set(a.booked_slot_id!, {
        id: a.booked_slot_id!,
        datetime: a.booked_slot_datetime!,
        location: a.booked_slot_location || null,
        link: a.booked_slot_meeting_link || null,
        style: a.booked_slot_style || null,
        apps: []
      });
    }
    slotsMap.get(a.booked_slot_id!)!.apps.push(a);
  });

  const groupedSlots = Array.from(slotsMap.values()).sort((a, b) => 
    new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );

  const pendingScheduling = applications.filter(a => 
    (a.status === "SHORTLISTED" || a.status === "REVIEWED") && !a.booked_slot_id
  );

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
          <div className="flex gap-2">
            <Button
              onClick={() => setShortlistOpen(true)}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400"
            >
              <Award className="h-4 w-4 mr-2" />
              Auto-Shortlist
            </Button>
            <Button
              onClick={() => setPoolOpen(true)}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Manage Interview Pool
            </Button>
            <Button
              onClick={() => setBroadcastOpen(true)}
              variant="outline"
              className="border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400"
            >
              <Megaphone className="h-4 w-4 mr-2" />
              Group Message
            </Button>
            {stats.accepted > 0 && (
              <Button
                onClick={() => setAnnounceOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
              >
                <PartyPopper className="h-4 w-4 mr-2" />
                Announce Selection
              </Button>
            )}
          </div>
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

          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-lg sm:ml-auto">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Min ATS: {minAtsScore}%</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5"
              value={minAtsScore}
              onChange={e => setMinAtsScore(parseInt(e.target.value))}
              className="w-20 sm:w-24 accent-violet-600 cursor-pointer"
            />
          </div>
        </div>

        <Tabs value={filter} onValueChange={v => setFilter(v as FilterType)}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-5">
            {["ALL", "PENDING", "REVIEWED", "SHORTLISTED", "SCHEDULE", "INTERVIEW_SCHEDULED", "ACCEPTED", "REJECTED"].map(tab => (
              <TabsTrigger key={tab} value={tab} className="text-xs rounded-lg">
                {tab === "ALL" ? "All" : tab === "SCHEDULE" ? "Schedule" : STATUS_CONFIG[tab]?.label ?? tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={filter}>
            {filter === "SCHEDULE" ? (
              <div className="space-y-6">
                {/* Confirmed Interviews Grouped by Slot */}
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 px-1">
                    <Calendar className="h-4 w-4 text-violet-600" />
                    Confirmed Interview Sessions ({groupedSlots.length})
                  </h2>
                  
                  {groupedSlots.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center bg-white dark:bg-zinc-900/50">
                      <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No confirmed sessions yet</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {groupedSlots.map(slot => (
                        <Card key={slot.id} className="overflow-hidden border-violet-100 dark:border-violet-900/30 shadow-sm">
                          <div className="bg-violet-50/50 dark:bg-violet-900/10 px-4 py-3 border-b border-violet-100 dark:border-violet-900/30 flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-white dark:bg-zinc-900 border border-violet-200 dark:border-violet-800 flex flex-col items-center justify-center text-violet-700 dark:text-violet-300">
                                <span className="text-[10px] font-bold uppercase">{new Date(slot.datetime).toLocaleDateString([], { month: 'short' })}</span>
                                <span className="text-sm font-black leading-none">{new Date(slot.datetime).getDate()}</span>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                  {new Date(slot.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                  <Badge variant="outline" className="text-[9px] h-4 px-1 py-0 border-violet-200 text-violet-700 bg-violet-50/50">
                                    {slot.style?.replace('_', ' ') || 'Interview'}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {slot.link && (slot.link.startsWith('http') ? (
                                <Button size="sm" variant="outline" className="h-8 text-xs border-violet-200 text-violet-700 hover:bg-violet-100" asChild>
                                  <a href={slot.link} target="_blank" rel="noopener noreferrer">
                                    <Video className="h-3.5 w-3.5 mr-1.5" />
                                    Join Meeting
                                  </a>
                                </Button>
                              ) : (
                                <div className="text-xs text-gray-500 flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-800">
                                  <MapPin className="h-3.5 w-3.5 text-violet-500" />
                                  {slot.link || slot.location || 'See Instructions'}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              Attendees ({slot.apps.length})
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {slot.apps.map(app => (
                                <div 
                                  key={app.id} 
                                  onClick={() => setSelectedApplicationId(app.id)}
                                  className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer group"
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-[10px] bg-violet-100 text-violet-700">
                                      {app.applicant_name?.split(' ').map(n=>n[0]).join('').slice(0,2) || '??'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 group-hover:text-violet-600 truncate">
                                      {app.applicant_name}
                                    </div>
                                    <div className="text-[10px] text-gray-500 truncate">{app.applicant_email}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Shortlisted but not yet scheduled */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 px-1 mb-4">
                    <Clock className="h-4 w-4 text-amber-500" />
                    Pending Scheduling ({pendingScheduling.length})
                  </h2>
                  
                  {pendingScheduling.length === 0 ? (
                    <p className="text-xs text-center text-gray-400 italic">All shortlisted candidates have booked a slot</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {pendingScheduling.map(app => (
                        <div 
                          key={app.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-transparent"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                              {app.applicant_name?.[0] || '?'}
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{app.applicant_name}</span>
                          </div>
                          <Badge variant="secondary" className="text-[9px] h-4 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-none">
                            Not attending yet
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : filteredApps.length === 0 ? (
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
                              <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={app.status} />
                                <ATSBadge score={app.ats_score} />
                              </div>
                            </div>

                            {/* Score */}
                            <div className="mt-3 max-w-xs">
                              <ScoreBar score={app.match_score} />
                            </div>

                            {/* Pipeline Progress */}
                            {selectionProcess && ["SHORTLISTED", "INTERVIEW_SCHEDULED", "ACCEPTED"].includes(app.status) && (
                              <div className="mt-3 bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-gray-500 font-medium">Pipeline Progress</span>
                                  <span className="text-violet-600 font-bold">Round {app.current_round} / {selectionProcess.rounds.length}</span>
                                </div>
                                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                  {app.current_round > 0 
                                    ? selectionProcess.rounds[app.current_round - 1]?.title 
                                    : "Not Started"}
                                </div>
                              </div>
                            )}
                            
                            {/* Confirmed Interview Slot */}
                            {app.status === "INTERVIEW_SCHEDULED" && app.booked_slot_datetime && (
                              <div className="mt-3 bg-emerald-50 dark:bg-emerald-900/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wider mb-2">
                                  <Calendar className="h-3 w-3" />
                                  Confirmed Interview
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                                    <Clock className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="font-medium">
                                      {new Date(app.booked_slot_datetime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(app.booked_slot_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  
                                  {/* Link or Location */}
                                  <div className="flex items-center gap-1.5 text-xs">
                                    {app.booked_slot_meeting_link && (app.booked_slot_meeting_link.startsWith('http://') || app.booked_slot_meeting_link.startsWith('https://')) ? (
                                      <a 
                                        href={app.booked_slot_meeting_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-medium hover:bg-violet-200 dark:hover:bg-violet-900/60 transition-colors"
                                      >
                                        <Video className="h-3.5 w-3.5" />
                                        Meeting Link
                                      </a>
                                    ) : (
                                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 italic">
                                        <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                                        {app.booked_slot_meeting_link || app.booked_slot_location || "In Person Interview"}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

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

                          {["SHORTLISTED", "INTERVIEW_SCHEDULED"].includes(app.status) && selectionProcess && app.current_round < selectionProcess.rounds.length && (
                            <Button 
                              size="sm" 
                              onClick={() => handleAdvance(app.id)} 
                              disabled={isUpdating} 
                              className="text-xs bg-violet-600 hover:bg-violet-700 text-white"
                            >
                              {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5 mr-1" />}
                              Advance to Round {app.current_round + 1}
                            </Button>
                          )}

                          {/* Accept / Reject at final stage */}
                          {selectionProcess && app.current_round >= selectionProcess.rounds.length && !["REJECTED", "WITHDRAWN", "ACCEPTED"].includes(app.status) && (
                            <>
                              <Button
                                size="sm"
                                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => handleStatusUpdate(app.id, "ACCEPTED")}
                                disabled={isUpdating}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Accept
                              </Button>
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
                            </>
                          )}

                          {app.status === "INTERVIEW_SCHEDULED" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleStartInterview(app.id)} 
                                disabled={startingInterview === app.id} 
                                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                {startingInterview === app.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5 mr-1" />}
                                Start Interview
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                   const res = await axiosInstance.get(`/interviews/application/${app.id}`);
                                   setReviewTarget({ id: res.data.schedule_id, appId: app.id, name });
                                }}
                                className="text-xs border-violet-200 text-violet-700 hover:bg-violet-50"
                              >
                                <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
                                Evaluate
                              </Button>
                            </>
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
          applicationId={selectedApplicationId!}
          isOpen={!!selectedApplicationId}
          onClose={() => setSelectedApplicationId(null)}
        />
      )}

      <BroadcastModal
        jobId={jobId}
        open={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
      />

      <BulkShortlistModal
        jobId={jobId}
        open={shortlistOpen}
        onClose={() => setShortlistOpen(false)}
        onSuccess={loadApplications}
      />

      {interviewTarget && (
        <InterviewModal
          applicationId={interviewTarget!}
          open={!!interviewTarget}
          onClose={() => setInterviewTarget(null)}
          onSuccess={loadApplications}
        />
      )}

      <ManagePoolModal
        jobId={jobId}
        isOpen={poolOpen}
        onClose={() => setPoolOpen(false)}
      />

      {reviewTarget && (
        <InterviewReviewModal
          interviewId={reviewTarget.id}
          applicationId={reviewTarget.appId}
          candidateName={reviewTarget.name}
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={loadApplications}
        />
      )}

      {announceOpen && (
        <AnnounceSelectionModal
          jobId={jobId}
          acceptedApplications={applications.filter(a => a.status === "ACCEPTED")}
          isOpen={announceOpen}
          onClose={() => setAnnounceOpen(false)}
          onSuccess={loadApplications}
        />
      )}
    </>
  );
}