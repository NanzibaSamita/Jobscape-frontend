"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Star, Loader2, ClipboardCheck, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { axiosInstance } from "@/lib/axios/axios";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";

interface InterviewReviewModalProps {
  interviewId: string;
  applicationId: string;
  candidateName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const METRICS = [
  { id: "technical", label: "Technical Skills" },
  { id: "communication", label: "Communication" },
  { id: "culture", label: "Culture Fit" },
  { id: "problem_solving", label: "Problem Solving" },
  { id: "enthusiasm", label: "Enthusiasm / Interest" },
];

export default function InterviewReviewModal({
  interviewId,
  applicationId,
  candidateName,
  isOpen,
  onClose,
  onSuccess,
}: InterviewReviewModalProps) {
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [metrics, setMetrics] = useState<Record<string, boolean>>(
    METRICS.reduce((acc, m) => ({ ...acc, [m.id]: false }), {})
  );
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useAppDispatch();

  async function handleSubmit() {
    if (rating === 0) {
      dispatch(showAlert({ title: "Rating required", message: "Please provide an overall rating", type: "warning" }));
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post("/interviews/reviews", {
        interview_id: interviewId,
        notes,
        metrics,
        overall_rating: rating,
      });

      dispatch(showAlert({
        title: "Review Submitted",
        message: `Feedback for ${candidateName} has been saved.`,
        type: "success"
      }));
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ClipboardCheck className="h-6 w-6 text-violet-600" />
            Interview Evaluation
          </DialogTitle>
          <DialogDescription>
            Review performance for <span className="font-semibold text-gray-900 dark:text-gray-100">{candidateName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating */}
          <div className="space-y-2 text-center">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Rating</Label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className="transition-transform active:scale-95"
                >
                  <Star
                    className={`h-10 w-10 ${
                      s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-800"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Competencies</Label>
            <div className="grid grid-cols-1 gap-2.5">
              {METRICS.map((m) => (
                <div key={m.id} className="flex items-center space-x-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer" onClick={() => setMetrics({ ...metrics, [m.id]: !metrics[m.id] })}>
                  <Checkbox
                    id={m.id}
                    checked={metrics[m.id]}
                    onCheckedChange={(checked) => setMetrics({ ...metrics, [m.id]: !!checked })}
                  />
                  <Label htmlFor={m.id} className="text-sm font-medium cursor-pointer flex-1">{m.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Detailed Feedback & Notes</Label>
            <Textarea
              placeholder="What were your key impressions of the candidate? Strengths, weaknesses, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={submitting} className="rounded-xl">
            Discard
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-8">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ThumbsUp className="h-4 w-4 mr-2" />}
            Save Evaluation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
