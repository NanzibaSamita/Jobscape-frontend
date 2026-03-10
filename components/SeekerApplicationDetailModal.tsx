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

                    {/* Meeting Link */}
                    {slot.meetingLink && (
                      <div className="flex flex-wrap items-center gap-2">
                        {/* External Link: Only if valid protocol */}
                        {(slot.meetingLink.startsWith("http://") || slot.meetingLink.startsWith("https://")) ? (
                          <a
                            href={slot.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-violet-600 hover:underline font-medium"
                          >
                            <Video className="h-4 w-4" />
                            External Join Link
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Alt link: {slot.meetingLink}
                          </span>
                        )}
                        
                        {/* In-App Video Room Button */}
                        {slot.style === "video_call" && (
                          <Button
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-700 text-white h-8 text-xs font-bold shadow-md shadow-violet-500/20"
                            onClick={() => window.location.href = `/interview/${app.booked_slot_id || applicationId}`}
                          >
                            <Video className="h-3.5 w-3.5 mr-1.5" />
                            Join Video Room
                          </Button>
                        )}
                      </div>
                    )}

                    {/* In-App Join Button (Fallback if link is missing but style is video_call) */}
                    {!slot.meetingLink && slot.style === "video_call" && (
                       <Button
                          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-500/20"
                          onClick={() => window.location.href = `/interview/${app.booked_slot_id || applicationId}`}
                       >
                          <Video className="h-4 w-4 mr-2" />
                          Join Interview Room
                       </Button>
                    )}

                    {/* Google Calendar Button */}
                    {gcalUrl && (
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
