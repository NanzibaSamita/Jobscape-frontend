"use client";
// app/jobseeker/interviews/page.tsx
// Job seeker sees their interview invitations and can confirm a time slot

import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Video, Phone, Users, Award, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { useNotify } from "@/components/ui/AppNotification";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface InterviewSchedule {
  schedule_id: string;
  application_id: string;
  job_title: string;
  company_name: string;
  style: string;
  proposed_slots: { datetime: string; duration_minutes: number }[];
  confirmed_at: string | null;
  is_confirmed: boolean;
  allow_style_choice: boolean;
  available_styles: string[];
  location: string | null;
  meeting_link: string | null;
  instructions: string | null;
  notes_for_candidate: string | null;
}

const STYLE_ICONS: Record<string, React.ElementType> = {
  in_person: MapPin,
  video_call: Video,
  phone_call: Phone,
  panel: Users,
  technical: Award,
};

const STYLE_LABELS: Record<string, string> = {
  in_person: "In-Person",
  video_call: "Video Call",
  phone_call: "Phone Call",
  panel: "Panel Interview",
  technical: "Technical Interview",
  case_study: "Case Study",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InterviewsPage() {
  const notify = useNotify();
  const [interviews, setInterviews] = useState<InterviewSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, number>>({});
  const [selectedStyles, setSelectedStyles] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInterviews();
  }, []);

  async function loadInterviews() {
    try {
      const res = await fetch(`${API_BASE}/interviews/my-interviews`, { credentials: "include" });
      if (!res.ok) throw new Error();
      setInterviews(await res.json());
    } catch {
      notify.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  }

  async function confirmSlot(scheduleId: string) {
    const slotIndex = selectedSlots[scheduleId];
    if (slotIndex === undefined) {
      notify.warning("Select a time slot", "Please choose your preferred time before confirming");
      return;
    }
    setConfirming(scheduleId);
    try {
      const res = await fetch(`${API_BASE}/interviews/confirm-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          schedule_id: scheduleId,
          slot_index: slotIndex,
          chosen_style: selectedStyles[scheduleId] || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      notify.success("Interview confirmed!", "The employer has been notified of your chosen time.");
      loadInterviews();
    } catch (err: any) {
      notify.error("Confirmation failed", err.message);
    } finally {
      setConfirming(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Interview Invitations</h1>
        <p className="text-gray-500 text-sm mt-1">Review and confirm your interview schedule</p>
      </div>

      {interviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
          <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No interview invitations yet</p>
          <p className="text-sm text-gray-400 mt-1">Interview invitations will appear here when employers schedule them</p>
        </div>
      ) : (
        interviews.map(iv => {
          const StyleIcon = STYLE_ICONS[iv.style] || Calendar;
          const isConfirming = confirming === iv.schedule_id;

          return (
            <div
              key={iv.schedule_id}
              className={`rounded-2xl border overflow-hidden shadow-sm
                ${iv.is_confirmed
                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900"
                }`}
            >
              {/* Header */}
              <div className={`px-5 py-4 flex items-start justify-between gap-4 ${iv.is_confirmed ? "border-b border-emerald-200 dark:border-emerald-800" : "border-b border-gray-100 dark:border-gray-800"}`}>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{iv.job_title}</h3>
                  <p className="text-sm text-gray-500">{iv.company_name}</p>
                </div>
                {iv.is_confirmed ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Confirmed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    Awaiting Your Response
                  </span>
                )}
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* Interview style */}
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <StyleIcon className="h-4 w-4 text-violet-500 shrink-0" />
                  <span className="font-medium">{STYLE_LABELS[iv.style] || iv.style}</span>
                  {iv.location && <span className="text-gray-500">— {iv.location}</span>}
                  {iv.meeting_link && (
                    <a href={iv.meeting_link} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline ml-1">
                      Join link →
                    </a>
                  )}
                </div>

                {/* Confirmed slot */}
                {iv.is_confirmed && iv.confirmed_at && (
                  <div className="rounded-xl bg-emerald-100/50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3.5">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Your confirmed time:</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                      {formatDateTime(iv.confirmed_at)}
                    </p>
                  </div>
                )}

                {/* Slot picker (if not confirmed) */}
                {!iv.is_confirmed && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Choose your preferred time slot:
                    </p>
                    <div className="space-y-2">
                      {iv.proposed_slots.map((slot, i) => {
                        const selected = selectedSlots[iv.schedule_id] === i;
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedSlots(prev => ({ ...prev, [iv.schedule_id]: i }))}
                            className={`w-full text-left rounded-xl border p-3.5 transition-all
                              ${selected
                                ? "border-violet-500 bg-violet-50 dark:bg-violet-900/30"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0
                                ${selected ? "border-violet-600" : "border-gray-400"}`}>
                                {selected && <div className="h-2 w-2 rounded-full bg-violet-600" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {formatDateTime(slot.datetime)}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Duration: {slot.duration_minutes} minutes
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Style choice (if allowed) */}
                {!iv.is_confirmed && iv.allow_style_choice && iv.available_styles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Choose your preferred interview format:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {iv.available_styles.map(s => {
                        const Icon = STYLE_ICONS[s] || Calendar;
                        const selected = selectedStyles[iv.schedule_id] === s;
                        return (
                          <button
                            key={s}
                            onClick={() => setSelectedStyles(prev => ({ ...prev, [iv.schedule_id]: s }))}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                              ${selected
                                ? "border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                              }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {STYLE_LABELS[s] || s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {iv.instructions && (
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3.5">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Instructions from employer:</p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">{iv.instructions}</p>
                  </div>
                )}

                {/* Confirm button */}
                {!iv.is_confirmed && (
                  <button
                    onClick={() => confirmSlot(iv.schedule_id)}
                    disabled={selectedSlots[iv.schedule_id] === undefined || isConfirming}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all
                      ${selectedSlots[iv.schedule_id] !== undefined
                        ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    {isConfirming ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Confirm Interview
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}