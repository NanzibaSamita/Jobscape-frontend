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
  const [isBooking, setIsBooking] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    if (isOpen && jobId) {
      loadAvailableSlots();
    }
  }, [isOpen, jobId]);

  async function loadAvailableSlots() {
    try {
      setLoading(true);
      const data = await getSlotPool(jobId);
      // Ensure data is an array and filter out booked slots
      if (data && Array.isArray(data.slots)) {
        setSlots(data.slots.filter((slot) => !slot.is_booked));
        setHasRequested(data.has_requested_extra_slots);
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
      await bookInterviewSlot(selectedSlotId);
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
                  onClick={() => setSelectedSlotId(slot.id)}
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
                    <div>
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
                        {INTERVIEW_STYLE_LABELS[slot.style as InterviewStyle] || "Interview"} &bull; {slot.duration_minutes}m
                      </div>
                    </div>
                  </div>
                  {selectedSlotId === slot.id && (
                    <CheckCircle2 className="h-5 w-5 text-violet-600" />
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
