"use client";
// app/jobseeker/interview-slots/[jobId]/page.tsx
// Job seeker views available interview slots for a specific job and books one (FCFS)

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar, Clock, MapPin, Video, Phone, Users, Award,
  BookOpen, CheckCircle2, Loader2, ChevronLeft, AlertCircle,
} from "lucide-react";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STYLE_ICONS: Record<string, React.ElementType> = {
  in_person:   MapPin,
  video_call:  Video,
  phone_call:  Phone,
  panel:       Users,
  technical:   Award,
  case_study:  BookOpen,
};

const STYLE_LABELS: Record<string, string> = {
  in_person:   "In-Person",
  video_call:  "Video Call",
  phone_call:  "Phone Call",
  panel:       "Panel Interview",
  technical:   "Technical Interview",
  case_study:  "Case Study",
};

interface AvailableSlot {
  id: string;
  datetime_utc: string;
  duration_minutes: number;
  is_booked: boolean;
  style: string | null;
  allow_seeker_style_choice: boolean;
  available_styles: string[];
  location: string | null;
}

function formatDt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    month:   "long",
    day:     "numeric",
    hour:    "2-digit",
    minute:  "2-digit",
  });
}

export default function SeekerInterviewSlotsPage() {
  const params   = useParams() as { jobId: string };
  const router   = useRouter();
  const dispatch = useAppDispatch();

  const jobId = params.jobId;

  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading]          = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [booking, setBooking]           = useState(false);
  const [booked, setBooked]             = useState(false);

  useEffect(() => {
    loadSlots();
  }, []);

  async function loadSlots() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/interviews/pool/${jobId}`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data: AvailableSlot[] = await res.json();
      setSlots(data.filter(s => !s.is_booked));
    } catch {
      dispatch(showAlert({ title: "Error", message: "Failed to load interview slots.", type: "error" }));
    } finally {
      setLoading(false);
    }
  }

  const activeSlot = slots.find(s => s.id === selectedSlot);
  const needsStyleChoice = activeSlot?.allow_seeker_style_choice && !activeSlot?.style;
  const canBook = selectedSlot && (!needsStyleChoice || selectedStyle);

  async function handleBook() {
    if (!canBook || !selectedSlot) return;

    setBooking(true);
    try {
      const body: Record<string, any> = {};
      if (needsStyleChoice && selectedStyle) body.chosen_style = selectedStyle;

      const res = await fetch(`${API_BASE}/interviews/pool/${selectedSlot}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.status === 409) {
        dispatch(showAlert({
          title: "Slot just taken!",
          message: "Someone else booked this slot. Please choose another.",
          type: "warning",
        }));
        loadSlots(); // Refresh to show updated availability
        setSelectedSlot(null);
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Booking failed");
      }

      const data = await res.json();
      setBooked(true);
      dispatch(showAlert({
        title: "Interview Booked! 🎉",
        message: `Your interview is confirmed for ${formatDt(activeSlot!.datetime_utc)}. Check your email for details.`,
        type: "success",
      }));
    } catch (err: any) {
      dispatch(showAlert({ title: "Booking failed", message: err.message, type: "error" }));
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
      </div>
    );
  }

  if (booked) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 p-10">
          <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">Interview Booked!</h2>
          <p className="text-emerald-700 dark:text-emerald-300 text-sm">
            {activeSlot && formatDt(activeSlot.datetime_utc)}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
            A confirmation email has been sent to you.
          </p>
          <button
            onClick={() => router.push("/jobseeker/interviews")}
            className="mt-6 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all"
          >
            View My Interviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-3 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Choose Your Interview Slot</h1>
        <p className="text-gray-500 text-sm mt-1">
          Slots are booked on a first-come, first-served basis. Select your preferred time to secure it.
        </p>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-14 text-center">
          <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No available slots</p>
          <p className="text-sm text-gray-400 mt-1">All slots have been booked or none have been created yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map(slot => {
            const isSelected = selectedSlot === slot.id;
            const StyleIcon  = slot.style ? (STYLE_ICONS[slot.style] ?? Calendar) : Calendar;

            return (
              <button
                key={slot.id}
                onClick={() => {
                  setSelectedSlot(slot.id);
                  setSelectedStyle("");
                }}
                className={`w-full text-left rounded-xl border p-4 transition-all
                  ${isSelected
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                <div className="flex items-start gap-3">
                  {/* Radio circle */}
                  <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0
                    ${isSelected ? "border-violet-600" : "border-gray-400"}`}>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-violet-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatDt(slot.datetime_utc)}
                      </p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                        ${isSelected
                          ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                          : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400"
                        }`}>
                        {slot.duration_minutes} min
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      {slot.style ? (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <StyleIcon className="h-3.5 w-3.5" />
                          {STYLE_LABELS[slot.style]}
                        </span>
                      ) : (
                        <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                          You choose the format
                        </span>
                      )}
                      {slot.location && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />{slot.location}
                        </span>
                      )}
                    </div>

                    {/* Seeker style picker (shown when this slot is selected + seeker must choose) */}
                    {isSelected && slot.allow_seeker_style_choice && !slot.style && slot.available_styles.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-violet-200 dark:border-violet-700">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select your preferred interview format:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {slot.available_styles.map(s => {
                            const Icon = STYLE_ICONS[s] ?? Calendar;
                            const active = selectedStyle === s;
                            return (
                              <button
                                key={s}
                                onClick={e => { e.stopPropagation(); setSelectedStyle(s); }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                                  ${active
                                    ? "border-violet-500 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
                                    : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 bg-white dark:bg-zinc-800"
                                  }`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                {STYLE_LABELS[s] ?? s}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Style required warning */}
      {selectedSlot && needsStyleChoice && !selectedStyle && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Please select your preferred interview format above before booking.
          </p>
        </div>
      )}

      {/* Book CTA */}
      {slots.length > 0 && (
        <button
          onClick={handleBook}
          disabled={!canBook || booking}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm
            ${canBook
              ? "bg-violet-600 hover:bg-violet-700 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
            }`}
        >
          {booking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              {selectedSlot ? "Confirm Booking" : "Select a time slot first"}
            </>
          )}
        </button>
      )}
    </div>
  );
}
