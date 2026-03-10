"use client";
// app/employer/jobs/[id]/interview-slots/page.tsx
// Employer creates and manages interview slots for a specific job (FCFS pool)

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Plus, Trash2, Calendar, Clock, MapPin, Video, Phone,
  Users, Award, BookOpen, Loader2, CheckCircle2, ChevronLeft, Settings2, AlertCircle,
} from "lucide-react";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const INTERVIEW_STYLES = [
  { value: "in_person",   label: "In-Person",         icon: MapPin    },
  { value: "video_call",  label: "Video Call",         icon: Video     },
  { value: "phone_call",  label: "Phone Call",         icon: Phone     },
  { value: "panel",       label: "Panel Interview",    icon: Users     },
  { value: "technical",   label: "Technical Interview",icon: Award     },
  { value: "case_study",  label: "Case Study",         icon: BookOpen  },
];

interface SlotDraft {
  date: string;
  time: string;
  duration_minutes: number;
  capacity: number;
  style: string | null;
  location: string;
  meeting_link: string;
}

interface ExistingSlot {
  id: string;
  datetime_utc: string;
  duration_minutes: number;
  capacity: number;
  booked_count: number;
  is_booked: boolean;
  style: string | null;
  allow_seeker_style_choice: boolean;
  location: string | null;
  meeting_link: string | null;
}

export default function EmployerInterviewSlotsPage() {
  const params   = useParams() as { id: string };
  const router   = useRouter();
  const dispatch = useAppDispatch();

  const jobId = params.id;

  // Mode: "fcfs" = employer pre-sets style, "seeker_choice" = seeker picks style
  const [mode, setMode] = useState<"fcfs" | "seeker_choice">("fcfs");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [slots, setSlots] = useState<SlotDraft[]>([
    { date: "", time: "10:00", duration_minutes: 60, capacity: 1, style: null, location: "", meeting_link: "" },
  ]);
  const [existingSlots, setExistingSlots] = useState<ExistingSlot[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [shortlistedCount, setShortlistedCount] = useState<number>(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [slotErrors, setSlotErrors] = useState<Record<number, string>>({});

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const authHeaders = (): Record<string, string> => {
    const token = getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  useEffect(() => {
    loadSlots();
  }, []);

  async function loadSlots() {
    try {
      const res = await fetch(`${API_BASE}/interviews/pool/${jobId}`, {
        headers: authHeaders(),
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setExistingSlots(data.slots || []);
      setShortlistedCount(data.shortlisted_count || 0);
    } catch {}
  }

  function addSlot() {
    setSlots(prev => [...prev, { date: "", time: "10:00", duration_minutes: 60, capacity: 1, style: null, location: "", meeting_link: "" }]);
  }

  function removeSlot(i: number) {
    setSlots(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateSlot(i: number, field: keyof SlotDraft, value: any) {
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  }

  function toggleAvailableStyle(style: string) {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  }

  async function handleSubmit() {
    // Validate — collect all per-slot errors
    const errors: Record<number, string> = {};
    slots.forEach((s, i) => {
      if (!s.date || !s.time) {
        errors[i] = "Date and time are required.";
      } else if (mode === "fcfs" && !s.style) {
        errors[i] = "Interview style is required in FCFS mode.";
      } else if (s.style === "in_person" && !s.location.trim()) {
        errors[i] = "Location is required for In-Person interviews.";
      }
    });

    // Client-side overlap detection between new slots
    const intervals = slots.map((s, i) => {
      if (!s.date || !s.time) return null;
      const start = new Date(`${s.date}T${s.time}`).getTime();
      const end = start + s.duration_minutes * 60 * 1000;
      return { start, end, i };
    });

    for (let a = 0; a < intervals.length; a++) {
      for (let b = a + 1; b < intervals.length; b++) {
        const ia = intervals[a];
        const ib = intervals[b];
        if (!ia || !ib) continue;
        const overlap = Math.max(ia.start, ib.start) < Math.min(ia.end, ib.end);
        if (overlap) {
          const timeA = slots[a].time;
          const timeB = slots[b].time;
          if (!errors[a]) errors[a] = `Slot ${a + 1} overlaps with Slot ${b + 1} (${timeA} ↔ ${timeB}).`;
          if (!errors[b]) errors[b] = `Slot ${b + 1} overlaps with Slot ${a + 1} (${timeB} ↔ ${timeA}).`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setSlotErrors(errors);
      dispatch(showAlert({ title: "Validation Error", message: "Please fix the errors highlighted on each slot.", type: "error" }));
      return;
    }

    const existingTotalCapacity = existingSlots.reduce((sum, s) => sum + s.capacity, 0);
    const newTotalCapacity = slots.reduce((sum, s) => sum + s.capacity, 0);
    const totalCapacity = existingTotalCapacity + newTotalCapacity;

    if (totalCapacity !== shortlistedCount) {
      dispatch(showAlert({
        title: "Capacity Mismatch",
        message: `Total capacity (${totalCapacity}) must match the number of shortlisted candidates (${shortlistedCount}). Please add or remove slots/capacity.`,
        type: "error"
      }));
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        job_id: jobId,
        allow_seeker_style_choice: mode === "seeker_choice",
        available_styles: mode === "seeker_choice" ? selectedStyles : [],
        slots: slots.map(s => {
          const dt = new Date(`${s.date}T${s.time}`);
          return {
            datetime_utc: dt.toISOString(),
            duration_minutes: s.duration_minutes,
            capacity: s.capacity,
            style: mode === "fcfs" ? s.style : null,
            location: s.location || undefined,
            meeting_link: s.meeting_link || undefined,
          };
        }),
      };

      const res = await fetch(`${API_BASE}/interviews/pool/bulk-create`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Slot create error:", err);
        throw new Error(err.detail || "Failed to create slots");
      }

      dispatch(showAlert({
        title: "Slots Created!",
        message: `${slots.length} interview slot(s) are now available for shortlisted candidates.`,
        type: "success",
      }));
      setSlots([{ date: "", time: "10:00", duration_minutes: 60, capacity: 1, style: null, location: "", meeting_link: "" }]);
      loadSlots();
    } catch (err: any) {
      dispatch(showAlert({ title: "Error", message: err.message, type: "error" }));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(slotId: string) {
    setDeleting(slotId);
    try {
      const res = await fetch(`${API_BASE}/interviews/pool/${slotId}/delete`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      dispatch(showAlert({ title: "Slot deleted", message: "The slot has been removed.", type: "success" }));
      loadSlots();
    } catch (err: any) {
      dispatch(showAlert({ title: "Error", message: err.message, type: "error" }));
    } finally {
      setDeleting(null);
    }
  }

  function formatDt(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-3 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Interview Slot Manager</h1>
        <p className="text-gray-500 text-sm mt-1">
          Create time slots for shortlisted candidates. They'll book on a first-come, first-served basis.
        </p>
      </div>

      {/* Parity Status Bar */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
        (existingSlots.reduce((sum, s) => sum + s.capacity, 0) + slots.reduce((sum, s) => sum + s.capacity, 0)) === shortlistedCount
          ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800"
          : "bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${(existingSlots.reduce((sum, s) => sum + s.capacity, 0) + slots.reduce((sum, s) => sum + s.capacity, 0)) === shortlistedCount ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {shortlistedCount} Shortlisted Candidate{shortlistedCount !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-gray-500">
              Total Capacity: {existingSlots.reduce((sum, s) => sum + s.capacity, 0) + slots.reduce((sum, s) => sum + s.capacity, 0)} / {shortlistedCount} seats
            </p>
          </div>
        </div>
        {(existingSlots.reduce((sum, s) => sum + s.capacity, 0) + slots.reduce((sum, s) => sum + s.capacity, 0)) === shortlistedCount ? (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4" /> Capacity Aligned
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider">
            <AlertCircle className="h-4 w-4" /> Mismatch
          </div>
        )}
      </div>

      {/* Existing Slots */}
      {existingSlots.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Existing Slots</h2>
          <div className="space-y-2">
            {existingSlots.map(slot => (
              <div
                key={slot.id}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm
                  ${slot.is_booked
                    ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {slot.is_booked
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    : <Calendar className="h-4 w-4 text-violet-400 shrink-0" />
                  }
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatDt(slot.datetime_utc)}</p>
                    <p className="text-xs text-gray-500">
                      {slot.duration_minutes} min
                      {slot.style && ` · ${slot.style.replace("_", " ")}`}
                      {slot.allow_seeker_style_choice && " · Seeker chooses style"}
                      {` · Capacity: ${slot.booked_count}/${slot.capacity}`}
                      {slot.is_booked && " · FULL"}
                    </p>
                    {(slot.meeting_link || slot.location) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {slot.meeting_link && (
                          <div className="flex items-center gap-1 text-[10px] font-medium">
                            <Video className="h-3 w-3 text-violet-400" />
                            {(slot.meeting_link.startsWith("http://") || slot.meeting_link.startsWith("https://")) ? (
                              <a href={slot.meeting_link} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">
                                Link: {slot.meeting_link.split('/')[2] || "External"}
                              </a>
                            ) : (
                              <span className="text-gray-400 italic">Info: {slot.meeting_link}</span>
                            )}
                          </div>
                        )}
                        {slot.location && (
                          <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {slot.location}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {!slot.is_booked && (
                  <button
                    onClick={() => handleDelete(slot.id)}
                    disabled={deleting === slot.id}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    {deleting === slot.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Separator */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Mode Toggle */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-violet-500" />
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Booking Mode</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              key: "fcfs",
              title: "FCFS — Employer sets style",
              desc: "You define the interview format per slot. Candidates race to book.",
            },
            {
              key: "seeker_choice",
              title: "Seeker Chooses Style",
              desc: "Candidates pick their preferred interview format when booking.",
            },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setMode(opt.key as "fcfs" | "seeker_choice")}
              className={`rounded-xl border p-4 text-left transition-all
                ${mode === opt.key
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 hover:border-gray-300"
                }`}
            >
              <div className={`h-3 w-3 rounded-full border-2 mb-2 ${mode === opt.key ? "border-violet-600 bg-violet-600" : "border-gray-400"}`} />
              <p className={`text-sm font-semibold ${mode === opt.key ? "text-violet-700 dark:text-violet-300" : "text-gray-800 dark:text-gray-200"}`}>
                {opt.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Seeker-choice: style selector */}
      {mode === "seeker_choice" && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Which interview styles can seekers choose from?
          </p>
          <div className="flex flex-wrap gap-2">
            {INTERVIEW_STYLES.map(s => {
              const Icon = s.icon;
              const active = selectedStyles.includes(s.value);
              return (
                <button
                  key={s.value}
                  onClick={() => toggleAvailableStyle(s.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                    ${active
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Slot builder */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">New Slots</h2>
        {slots.map((slot, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 space-y-4 ${slotErrors[i] ? "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/10" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900"}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Slot {i + 1}</span>
              {slots.length > 1 && (
                <button onClick={() => removeSlot(i)} className="text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Inline error */}
            {slotErrors[i] && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                ⚠ {slotErrors[i]}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  <Calendar className="inline h-3.5 w-3.5 mr-1" />Date
                </label>
                <input
                  type="date"
                  value={slot.date}
                  onChange={e => updateSlot(i, "date", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  <Clock className="inline h-3.5 w-3.5 mr-1" />Time
                </label>
                <input
                  type="time"
                  value={slot.time}
                  onChange={e => updateSlot(i, "time", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Duration */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  <Clock className="inline h-3.5 w-3.5 mr-1" />Duration (min)
                </label>
                <select
                  value={slot.duration_minutes}
                  onChange={e => updateSlot(i, "duration_minutes", parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {[15, 30, 45, 60, 90, 120].map(d => (
                    <option key={d} value={d}>{d} min</option>
                  ))}
                </select>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  <Users className="inline h-3.5 w-3.5 mr-1" />Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={slot.capacity}
                  onChange={e => updateSlot(i, "capacity", parseInt(e.target.value) || 1)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Style — only shown in FCFS mode */}
              {mode === "fcfs" && (
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Interview Style
                  </label>
                  <select
                    value={slot.style || ""}
                    onChange={e => updateSlot(i, "style", e.target.value || null)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">— Select —</option>
                    {INTERVIEW_STYLES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Location / Link */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  <MapPin className="inline h-3.5 w-3.5 mr-1" />Location (optional)
                </label>
                <input
                  type="text"
                  value={slot.location}
                  onChange={e => updateSlot(i, "location", e.target.value)}
                  placeholder="e.g. Room 2B, 3rd Floor"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  <Video className="inline h-3.5 w-3.5 mr-1" />Meeting Link (optional)
                </label>
                <div className="space-y-1.5">
                  <input
                    type="url"
                    value={slot.meeting_link}
                    onChange={e => updateSlot(i, "meeting_link", e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-400"
                  />
                  <p className="text-[10px] text-violet-500 font-medium italic">
                    Note: An in-app WebRTC video room is automatically created for all video calls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add more slots */}
        <button
          onClick={addSlot}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add another time slot
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold shadow-sm transition-all"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Publish {slots.length} Slot{slots.length > 1 ? "s" : ""}
          </>
        )}
      </button>
    </div>
  );
}
