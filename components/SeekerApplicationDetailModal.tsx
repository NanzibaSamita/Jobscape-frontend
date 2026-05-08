"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Users,
  Award,
  BookOpen,
  Loader2,
  CheckCircle2,
  ExternalLink,
  FileText,
  Building,
  Briefcase,
  TrendingUp,
  PartyPopper,
} from "lucide-react";
import { getApplicationById, ApplicationDetail } from "@/lib/api/applications";

const STYLE_LABELS: Record<string, string> = {
  in_person: "In-Person",
  video_call: "Video Call",
  phone_call: "Phone Call",
  panel: "Panel Interview",
  technical: "Technical Interview",
  case_study: "Case Study",
};

const STYLE_ICONS: Record<string, React.ElementType> = {
  in_person: MapPin,
  video_call: Video,
  phone_call: Phone,
  panel: Users,
  technical: Award,
  case_study: BookOpen,
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  SHORTLISTED: "bg-purple-100 text-purple-800",
  INTERVIEW_SCHEDULED: "bg-indigo-100 text-indigo-800",
  ACCEPTED: "bg-green-100 text-green-800",
  HIRED: "bg-emerald-600 text-white font-bold animate-pulse",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-gray-100 text-gray-800",
};

interface Props {
  applicationId: string;
  jobTitle: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
}

function formatDt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Build a Google Calendar add-event URL.
 * https://calendar.google.com/calendar/render?action=TEMPLATE&...
 */
function buildGoogleCalendarUrl(params: {
  title: string;
  start: string; // ISO string
  durationMinutes: number;
  location?: string | null;
  description?: string;
}) {
  const startDate = new Date(params.start);
  const endDate = new Date(startDate.getTime() + params.durationMinutes * 60 * 1000);

  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", params.title);
  url.searchParams.set("dates", `${fmt(startDate)}/${fmt(endDate)}`);
  if (params.location) url.searchParams.set("location", params.location);
  if (params.description) url.searchParams.set("details", params.description);
  return url.toString();
}

export default function SeekerApplicationDetailModal({
  applicationId,
  jobTitle,
  companyName,
  isOpen,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState<ApplicationDetail | null>(null);

  useEffect(() => {
    if (isOpen && applicationId) {
      setLoading(true);
      getApplicationById(applicationId)
        .then(setApp)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, applicationId]);

  const slot = app?.booked_slot_datetime
    ? {
        datetime: app.booked_slot_datetime,
        duration: app.booked_slot_duration_minutes ?? 60,
        location: app.booked_slot_location,
        style: app.booked_slot_style,
        meetingLink: app.booked_slot_meeting_link,
      }
    : null;

  const StyleIcon = slot?.style ? (STYLE_ICONS[slot.style] ?? Calendar) : Calendar;

  const gcalUrl = slot
    ? buildGoogleCalendarUrl({
        title: `Interview — ${jobTitle} at ${companyName}`,
        start: slot.datetime,
        durationMinutes: slot.duration,
        location: slot.location ?? undefined,
        description: slot.meetingLink
          ? `Meeting link: ${slot.meetingLink}`
          : undefined,
      })
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {jobTitle}
              </DialogTitle>
              <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                <Building className="h-3.5 w-3.5" />
                {companyName}
              </p>
            </div>
            {app && (
              <Badge className={STATUS_COLORS[app.status] ?? ""}>
                {app.status.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
          </div>
        ) : !app ? null : (
          <ScrollArea className="h-[calc(90vh-130px)]">
            <div className="p-6 space-y-6">

              {/* Application Summary */}
              <section className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Applied On</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(app.applied_at).toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Match Score</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full bg-violet-500"
                        style={{ width: `${app.match_score}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {app.match_score}%
                    </span>
                  </div>
                </div>
              </section>

              {/* Cover Letter */}
              {app.cover_letter && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 mb-2">
                    <FileText className="h-4 w-4" /> Cover Letter
                  </h3>
                  <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {app.cover_letter}
                  </div>
                </section>
              )}

              {/* Employer Notes */}
              {app.employer_notes && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 mb-2">
                    <Briefcase className="h-4 w-4" /> Employer Note
                  </h3>
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4 text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                    {app.employer_notes}
                  </div>
                </section>
              )}

              {/* Rejection Reason */}
              {app.rejection_reason && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Rejection Reason</h3>
                  <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-4 text-sm text-red-800 dark:text-red-300 leading-relaxed">
                    {app.rejection_reason}
                  </div>
                </section>
              )}

              {/* Congratulatory message for ACCEPTED */}
              {app.status === "ACCEPTED" && (
                <section className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 p-6 text-center">
                  <PartyPopper className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-1">Congratulations!</h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    You've successfully cleared all interview rounds. The employer is finalizing the selection and will announce the results soon.
                  </p>
                </section>
              )}

              {/* Final Hired message */}
              {app.status === "HIRED" && (
                <section className="rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-center text-white shadow-xl">
                  <Award className="h-12 w-12 text-white mx-auto mb-4 animate-bounce" />
                  <h3 className="text-2xl font-black mb-2">You're Hired!</h3>
                  <p className="text-violet-100 text-sm leading-relaxed mb-4">
                    Welcome to the team at <strong>{companyName}</strong>. Your employment status has been updated, and you can now access internal company resources.
                  </p>
                  <Button className="bg-white text-violet-600 hover:bg-violet-50 font-bold px-8" onClick={() => window.location.href = "/jobseeker/profile"}>
                    View My Profile
                  </Button>
                </section>
              )}

              <Separator />

              {/* Booked Interview Slot */}
              {slot ? (
                <section>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-1.5 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    Your Interview Slot
                  </h3>

                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/15 p-5 space-y-4">
                    {/* Date / Time */}
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {formatDt(slot.datetime)}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {slot.duration} minutes
                        </p>
                      </div>
                    </div>

                    {/* Style */}
                    {slot.style && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <StyleIcon className="h-4 w-4 text-emerald-600" />
                        {STYLE_LABELS[slot.style] ?? slot.style}
                      </div>
                    )}

                    {/* Location */}
                    {slot.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        {slot.location}
                      </div>
                    )}

                    {/* Meeting Link / Join Button - Hide if Accepted/Hired */}
                    {(slot.meetingLink || slot.style === "video_call") && app.status !== "ACCEPTED" && app.status !== "HIRED" && (
                      <div className="pt-2">
                        {slot.meetingLink && (slot.meetingLink.startsWith("http://") || slot.meetingLink.startsWith("https://")) ? (
                          <div className="flex flex-col gap-3">
                            <a
                              href={slot.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-500/20 transition-all active:scale-[0.98]"
                            >
                              <Video className="h-5 w-5" />
                              Join Interview Meeting
                              <ExternalLink className="h-4 w-4 opacity-70" />
                            </a>
                          </div>
                        ) : (
                          <Button
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-all"
                            onClick={() => {
                              const meetingId = app.booked_slot_id || applicationId;
                              if (slot.meetingLink && (slot.meetingLink.startsWith("http://") || slot.meetingLink.startsWith("https://"))) {
                                window.open(slot.meetingLink, "_blank");
                              } else {
                                window.location.href = `/interview/${meetingId}`;
                              }
                            }}
                          >
                            <Video className="h-5 w-5 mr-2" />
                            Join Interview Room
                          </Button>
                        )}

                        {slot.meetingLink && !slot.meetingLink.startsWith("http") && !["link", "tbd", "none"].includes(slot.meetingLink.toLowerCase()) && (
                          <p className="text-[10px] text-gray-400 mt-2 text-center italic">
                            Meeting ID/Code: {slot.meetingLink}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Instructions */}
                    {app.interview_instructions && (
                      <div className="p-3 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 text-xs text-gray-700 dark:text-gray-300">
                        <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-1 uppercase tracking-wider text-[10px]">Instructions</p>
                        {app.interview_instructions}
                      </div>
                    )}

                    {/* Google Calendar Button - Hide if Accepted/Hired */}
                    {gcalUrl && app.status !== "ACCEPTED" && app.status !== "HIRED" && (
                      <a
                        href={gcalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors shadow-sm"
                      >
                        {/* Google Calendar logo (SVG) */}
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="4" width="18" height="17" rx="2" fill="#fff" stroke="#dadce0"/>
                          <path d="M3 8h18" stroke="#dadce0"/>
                          <rect x="8" y="2" width="2" height="4" rx="1" fill="#1a73e8"/>
                          <rect x="14" y="2" width="2" height="4" rx="1" fill="#1a73e8"/>
                          <text x="12" y="18" textAnchor="middle" fontSize="8" fill="#1a73e8" fontWeight="bold">G</text>
                        </svg>
                        Add to Google Calendar
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      </a>
                    )}
                  </div>
                </section>
              ) : (
                app.status === "INTERVIEW_SCHEDULED" || app.status === "SHORTLISTED" ? (
                  <section className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center">
                    <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No interview slot booked yet.</p>
                    {app.status === "SHORTLISTED" && (
                      <p className="text-xs text-gray-400 mt-1">
                        You can book a slot from your applications list.
                      </p>
                    )}
                  </section>
                ) : null
              )}

            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
