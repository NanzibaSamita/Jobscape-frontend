"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Video,
  MapPin,
  Phone,
  Users,
  Award,
  BookOpen,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  getSlotPool,
  bulkCreateSlots,
  deleteInterviewSlot,
  PoolSlot,
  PoolSlotCreate,
} from "@/lib/api/interviews";
import { InterviewStyle, INTERVIEW_STYLE_LABELS } from "@/types/interview";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";

interface ManagePoolModalProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
}

const STYLES = [
  { value: InterviewStyle.VIDEO_CALL, label: "Video",   icon: Video },
  { value: InterviewStyle.IN_PERSON,  label: "Office",  icon: MapPin },
  { value: InterviewStyle.PHONE_CALL,  label: "Phone",   icon: Phone },
  { value: InterviewStyle.PANEL,       label: "Panel",   icon: Users },
  { value: InterviewStyle.TECHNICAL,   label: "Tech",    icon: Award },
  { value: InterviewStyle.CASE_STUDY,  label: "Case",    icon: BookOpen },
];

export default function ManagePoolModal({
  jobId,
  isOpen,
  onClose,
}: ManagePoolModalProps) {
  const dispatch = useAppDispatch();
  const [slots, setSlots] = useState<PoolSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [shortlistedCount, setShortlistedCount] = useState(0);

  // Pool settings
  const [allowSeekerStyleChoice, setAllowSeekerStyleChoice] = useState(false);
  const [newStyle, setNewStyle] = useState<InterviewStyle>(InterviewStyle.VIDEO_CALL);
  const [commonDuration, setCommonDuration] = useState(60);
  const [commonCapacity, setCommonCapacity] = useState(1);
  
  interface SlotDraft {
    datetime: string;
    duration: number;
    capacity: number;
    location: string;
    meeting_link: string;
  }

  const [newSlots, setNewSlots] = useState<SlotDraft[]>([
    { datetime: "", duration: 60, capacity: 1, location: "", meeting_link: "" }
  ]);

  useEffect(() => {
    if (isOpen && jobId) {
      loadSlots();
    }
  }, [isOpen, jobId]);

  async function loadSlots() {
    try {
      setLoading(true);
      const data = await getSlotPool(jobId);
      if (data && Array.isArray(data.slots)) {
        setSlots(data.slots);
        setShortlistedCount(data.shortlisted_count || 0);
      }
    } catch (err: any) {
      dispatch(
        showAlert({
          title: "Error",
          message: "Failed to load interview pool",
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  }

  function addSlotField() {
    setNewSlots([...newSlots, { datetime: "", duration: commonDuration, capacity: commonCapacity, location: "", meeting_link: "" }]);
  }

  function updateSlotField(index: number, field: keyof SlotDraft, value: any) {
    const updated = [...newSlots];
    updated[index] = { ...updated[index], [field]: value };
    setNewSlots(updated);
  }

  function removeSlotField(index: number) {
    if (newSlots.length > 1) {
      setNewSlots(newSlots.filter((_, i) => i !== index));
    }
  }

  async function handleBulkCreate() {
    const validSlots = newSlots.filter((s) => s.datetime.trim() !== "");
    if (validSlots.length === 0) {
      dispatch(showAlert({ title: "Validation", message: "Please add at least one time slot", type: "warning" }));
      return;
    }

    const totalCapacityToAdd = validSlots.reduce((acc, s) => acc + s.capacity, 0);
    const existingTotalCapacity = slots.reduce((acc, s) => acc + s.capacity, 0);
    const finalTotalCapacity = existingTotalCapacity + totalCapacityToAdd;

    if (finalTotalCapacity !== shortlistedCount) {
      dispatch(showAlert({
        title: "Capacity Mismatch",
        message: `Total capacity (${finalTotalCapacity}) must match the number of shortlisted candidates (${shortlistedCount}). Please adjust slot capacities.`,
        type: "error"
      }));
      return;
    }

    try {
      setIsCreating(true);
      const slotsToCreate: PoolSlotCreate[] = validSlots.map((s) => ({
        datetime_utc: new Date(s.datetime).toISOString(),
        duration_minutes: s.duration,
        style: allowSeekerStyleChoice ? null : newStyle,
        location: s.location.trim() || undefined,
        meeting_link: s.meeting_link.trim() || undefined,
        capacity: s.capacity,
      }));

      await bulkCreateSlots({
        job_id: jobId,
        slots: slotsToCreate,
        allow_seeker_style_choice: allowSeekerStyleChoice,
        available_styles: allowSeekerStyleChoice ? STYLES.map(s => s.value) : undefined,
      });
      
      dispatch(
        showAlert({
          title: "Success",
          message: `Created ${slotsToCreate.length} slots`,
          type: "success",
        })
      );
      setNewSlots([{ datetime: "", duration: 60, capacity: 1, location: "", meeting_link: "" }]);
      loadSlots();
    } catch (err: any) {
      dispatch(
        showAlert({
          title: "Error",
          message: err?.response?.data?.detail || "Failed to create slots",
          type: "error",
        })
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteSlot(slotId: string) {
    try {
      await deleteInterviewSlot(slotId);
      setSlots(slots.filter((s) => s.id !== slotId));
      dispatch(
        showAlert({
          title: "Deleted",
          message: "Slot removed from pool",
          type: "success",
        })
      );
    } catch (err: any) {
      dispatch(
        showAlert({
          title: "Error",
          message: err?.response?.data?.detail || "Failed to delete slot",
          type: "error",
        })
      );
    }
  }

  const currentTotalPoolCapacity = slots.reduce((acc, s) => acc + s.capacity, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-violet-600" />
            Manage Interview Slot Pool
          </DialogTitle>
          <DialogDescription>
            Create interview slots for shortlisted candidates to book on a first-come, first-served basis.
          </DialogDescription>
          <div className={`mt-2 p-2 rounded-lg border text-xs font-medium flex items-center justify-between ${
            currentTotalPoolCapacity >= shortlistedCount
              ? "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:text-emerald-400"
              : "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/10 dark:border-amber-900/30 dark:text-amber-400"
          }`}>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Total Pool Capacity: {currentTotalPoolCapacity}
            </span>
            <span>
              Shortlisted Candidates: {shortlistedCount}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Create New Slots Section */}
          <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add New Slots
              </div>
              <div className="flex items-center gap-2">
                 <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Seeker Choice</label>
                 <button
                    onClick={() => setAllowSeekerStyleChoice(!allowSeekerStyleChoice)}
                    className={`h-5 w-9 rounded-full transition-colors relative ${allowSeekerStyleChoice ? 'bg-violet-600' : 'bg-gray-300 dark:bg-zinc-700'}`}
                 >
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${allowSeekerStyleChoice ? 'left-4.5' : 'left-0.5'}`} style={{ left: allowSeekerStyleChoice ? '1.125rem' : '0.125rem' }} />
                 </button>
              </div>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className={allowSeekerStyleChoice ? "opacity-50 pointer-events-none" : ""}>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Default Interview Style
                </label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setNewStyle(s.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        newStyle === s.value
                          ? "bg-violet-600 text-white border-violet-600"
                          : "bg-white dark:bg-zinc-900 text-gray-600 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <s.icon className="h-3.5 w-3.5" />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Bulk Actions
                </label>
                <div className="flex gap-2">
                   <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[10px] h-7 px-2"
                      onClick={() => {
                        const updated = newSlots.map(s => ({ ...s, duration: commonDuration, capacity: commonCapacity }));
                        setNewSlots(updated);
                      }}
                    >
                      Apply Common Settings
                   </Button>
                </div>
              </div>
            </div>

            {/* Quick config for new fields */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Common Duration (m)</label>
                <Input
                  type="number"
                  min={15}
                  step={15}
                  value={commonDuration}
                  onChange={(e) => setCommonDuration(parseInt(e.target.value) || 60)}
                  className="text-sm h-8"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Common Capacity</label>
                <Input
                  type="number"
                  min={1}
                  value={commonCapacity}
                  onChange={(e) => setCommonCapacity(parseInt(e.target.value) || 1)}
                  className="text-sm h-8"
                />
              </div>
            </div>

            <div className="space-y-4 mb-4">
              <label className="text-xs font-medium text-gray-500 block">
                Time Slots
              </label>
              {newSlots.map((slot, idx) => (
                <div key={idx} className="p-3 border rounded-lg space-y-3 bg-white dark:bg-zinc-900 shadow-sm relative">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Date & Time</label>
                      <Input
                        type="datetime-local"
                        value={slot.datetime}
                        onChange={(e) => updateSlotField(idx, "datetime", e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    {newSlots.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSlotField(idx)}
                        className="text-red-500 absolute -top-2 -right-2 bg-white dark:bg-zinc-900 border rounded-full shadow-sm h-6 w-6"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">Duration (m)</label>
                      <Input
                        type="number"
                        min={15}
                        step={15}
                        value={slot.duration}
                        onChange={(e) => updateSlotField(idx, "duration", parseInt(e.target.value) || 60)}
                        className="text-sm h-8"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">Capacity</label>
                      <Input
                        type="number"
                        min={1}
                        value={slot.capacity}
                        onChange={(e) => updateSlotField(idx, "capacity", parseInt(e.target.value) || 1)}
                        className="text-sm h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">Meeting Link</label>
                      <Input
                        placeholder="Zoom/Meet URL"
                        value={slot.meeting_link}
                        onChange={(e) => updateSlotField(idx, "meeting_link", e.target.value)}
                        className="text-xs h-8"
                        disabled={newStyle === InterviewStyle.IN_PERSON}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">Location</label>
                      <Input
                        placeholder="Office/Room"
                        value={slot.location}
                        onChange={(e) => updateSlotField(idx, "location", e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                  {(!allowSeekerStyleChoice && newStyle === InterviewStyle.VIDEO_CALL) && (
                    <p className="text-[9px] text-violet-500 font-medium italic mt-1">
                      Note: An in-app WebRTC room is also automatically created.
                    </p>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addSlotField}
                className="w-full mt-2 text-xs border-dashed"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Another Time Slot
              </Button>
            </div>

            <Button
              onClick={handleBulkCreate}
              disabled={isCreating}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white mt-4"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Slots in Pool
            </Button>
          </div>

          {/* Current Pool Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center justify-between">
              <span>Existing Slots ({slots.length})</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadSlots}
                className="text-xs h-7"
              >
                Refresh
              </Button>
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-xl border-gray-200">
                <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No slots created for this job yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      slot.booked_count > 0
                        ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30"
                        : "bg-white border-gray-100 dark:bg-zinc-900 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${slot.booked_count > 0 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {new Date(slot.datetime_utc).toLocaleString([], {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px] h-4 py-0">
                            {slot.style ? INTERVIEW_STYLE_LABELS[slot.style] : "Seeker's Choice"}
                          </Badge>
                          <span className="flex items-center gap-1">
                             <Clock className="h-2.5 w-2.5" /> {slot.duration_minutes}m
                          </span>
                          <span className="bg-gray-100 dark:bg-zinc-800 px-1 rounded font-mono">
                             Booked: {slot.booked_count}/{slot.capacity}
                          </span>
                          {slot.booked_count >= slot.capacity && (
                            <span className="text-emerald-600 font-semibold uppercase">
                              Full
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {slot.booked_count === 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-gray-400 hover:text-red-500 h-8 w-8"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {slot.booked_count > 0 && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Badge({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: "outline" | "default" }) {
  return (
    <span className={`px-1.5 py-0.5 rounded-full border text-[10px] ${className}`}>
      {children}
    </span>
  )
}
