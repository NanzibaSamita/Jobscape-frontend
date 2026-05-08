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
import {
  Loader2,
  Calendar,
  Clock,
  Video,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getSlotPool, bookInterviewSlot, requestMoreSlots, PoolSlot } from "@/lib/api/interviews";
import { InterviewStyle, INTERVIEW_STYLE_LABELS } from "@/types/interview";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";

interface BookSlotModalProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookSlotModal({
  jobId,
  jobTitle,
  isOpen,
  onClose,
  onSuccess,
}: BookSlotModalProps) {
  const dispatch = useAppDispatch();
  const [slots, setSlots] = useState<PoolSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [isBooking, setIsBooking] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    if (isOpen && jobId) {
      setSelectedSlotId(null);
      setSelectedStyle("");
      loadAvailableSlots();
    }
  }, [isOpen, jobId]);

  async function loadAvailableSlots() {
    try {
      setLoading(true);
      const data = await getSlotPool(jobId);
      // Ensure data is an array and filter out booked slots
      if (data && Array.isArray(data.slots)) {
        const available = data.slots.filter((slot) => !slot.is_booked);
        setSlots(available);
        setHasRequested(data.has_requested_extra_slots);
        
        // Auto-select if only one slot
        if (available.length === 1) {
          setSelectedSlotId(available[0].id);
        }
      } else {
        setSlots([]); 
      }
    } catch (err: any) {
      dispatch(
        showAlert({
          title: "Error",
          message: "Failed to load available interview slots",
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleBook() {
    if (!selectedSlotId) return;

    try {
      setIsBooking(true);
      // Find selected slot to check if style choice is needed
      const slot = slots.find(s => s.id === selectedSlotId);
      const needsStyle = slot?.allow_seeker_style_choice && !slot?.style;
      
      if (needsStyle && !selectedStyle) {
        dispatch(showAlert({ title: "Style Required", message: "Please select an interview format.", type: "warning" }));
        setIsBooking(false);
        return;
      }

      await bookInterviewSlot(selectedSlotId, needsStyle ? selectedStyle : undefined);
      dispatch(
        showAlert({
          title: "Success",
          message: "Interview booked successfully!",
          type: "success",
        })
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      dispatch(
        showAlert({
          title: "Booking Failed",
          message: err?.response?.data?.detail || "This slot might have just been taken. Please try another.",
          type: "error",
        })
      );
      // Refresh slots in case of race condition
      loadAvailableSlots();
    } finally {
      setIsBooking(false);
    }
  }

  async function handleRequestSlots() {
    try {
      setIsRequesting(true);
      const res = await requestMoreSlots(jobId);
      dispatch(
        showAlert({
          title: "Request Sent",
          message: res.message || "The employer has been notified to add more slots.",
          type: "success",
        })
      );
      onClose();
    } catch (err: any) {
      dispatch(
        showAlert({
          title: "Request Failed",
          message: err?.response?.data?.detail || "Could not send the request at this time.",
          type: "error",
        })
      );
    } finally {
      setIsRequesting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-violet-600" />
            Book Your Interview
          </DialogTitle>
          <DialogDescription>
            Choose your preferred time for the <strong>{jobTitle}</strong> interview. Slots are available on a first-come, first-served basis.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-xl border-gray-200">
              <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-1">
                {hasRequested ? "Slot request already sent" : "No slots available right now"}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {hasRequested 
                  ? "You've already notified the employer to add more slots. Please wait for an update." 
                  : "The employer hasn't added new slots or they are all fully booked."}
              </p>
              <Button 
                onClick={handleRequestSlots} 
                disabled={isRequesting || hasRequested}
                variant={hasRequested ? "ghost" : "outline"}
                className={hasRequested ? "text-emerald-600 bg-emerald-50 pointer-events-none" : "hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"}
              >
                {isRequesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {hasRequested ? (
                  <span className="flex items-center gap-1.5 ">
                    <CheckCircle2 className="h-4 w-4" /> Request Sent
                  </span>
                ) : (
                  "Request More Slots"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => {
                    setSelectedSlotId(slot.id);
                    setSelectedStyle(""); // Reset style choice when slot changes
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                    selectedSlotId === slot.id
                      ? "border-violet-600 bg-violet-50 dark:bg-violet-900/20"
                      : "border-gray-200 dark:border-gray-800 hover:border-violet-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedSlotId === slot.id ? "bg-violet-600 text-white" : "bg-gray-100 dark:bg-zinc-800 text-gray-500"}`}>
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {new Date(slot.datetime_utc).toLocaleString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {slot.style ? INTERVIEW_STYLE_LABELS[slot.style as InterviewStyle] : "Seeker Chooses Format"} &bull; {slot.duration_minutes}m
                      </div>

                      {/* Style Picker */}
                      {selectedSlotId === slot.id && slot.allow_seeker_style_choice && !slot.style && (
                        <div className="mt-3 pt-3 border-t border-violet-200 dark:border-violet-700">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Select Format:
                          </p>
                          {slot.available_styles && slot.available_styles.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {slot.available_styles.map(s => (
                                <button
                                  key={s}
                                  onClick={(e) => { e.stopPropagation(); setSelectedStyle(s); }}
                                  className={`px-2 py-1 rounded-md border text-[10px] font-medium transition-all ${
                                    selectedStyle === s
                                      ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                                      : "bg-white dark:bg-zinc-800 border-gray-200 dark:border-gray-700 text-gray-600 hover:border-violet-300"
                                  }`}
                                >
                                  {INTERVIEW_STYLE_LABELS[s as InterviewStyle] || s}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] italic text-amber-500">
                              No formats specified by employer. Please contact support.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedSlotId === slot.id && (
                    <CheckCircle2 className="h-5 w-5 text-violet-600 self-start" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isBooking}>
            Cancel
          </Button>
          <Button
            onClick={handleBook}
            disabled={!selectedSlotId || isBooking || loading}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isBooking ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
