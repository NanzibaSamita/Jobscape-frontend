"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Megaphone, Loader2, CheckCircle2, Users, PartyPopper } from "lucide-react";
import { axiosInstance } from "@/lib/axios/axios";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";

interface AnnounceSelectionModalProps {
  jobId: string;
  acceptedApplications: any[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AnnounceSelectionModal({
  jobId,
  acceptedApplications,
  isOpen,
  onClose,
  onSuccess,
}: AnnounceSelectionModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    acceptedApplications.map(a => a.id)
  );
  const [announcing, setAnnouncing] = useState(false);
  const dispatch = useAppDispatch();

  function toggleCandidate(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  async function handleAnnounce() {
    if (selectedIds.length === 0) {
      dispatch(showAlert({ title: "No candidates selected", message: "Please select at least one candidate to hire", type: "warning" }));
      return;
    }

    setAnnouncing(true);
    try {
      await axiosInstance.post(`/selection/job/${jobId}/announce`, {
        hired_application_ids: selectedIds,
      });

      dispatch(showAlert({
        title: "Selection Announced!",
        message: `${selectedIds.length} candidate(s) have been officially hired.`,
        type: "success"
      }));
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to announce selection:", err);
    } finally {
      setAnnouncing(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
             <PartyPopper className="h-6 w-6 text-violet-600" />
          </div>
          <DialogTitle className="text-2xl font-bold">Announce Selection</DialogTitle>
          <DialogDescription>
            Confirm the final candidates you want to hire. This will notify them and update their employee status.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Final Selection Pool ({acceptedApplications.length})</Label>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {acceptedApplications.map((app) => (
              <div 
                key={app.id} 
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer
                  ${selectedIds.includes(app.id) 
                    ? "border-violet-600 bg-violet-50 dark:bg-violet-900/10" 
                    : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-zinc-700"}`}
                onClick={() => toggleCandidate(app.id)}
              >
                <Checkbox 
                  id={app.id} 
                  checked={selectedIds.includes(app.id)}
                  onCheckedChange={() => toggleCandidate(app.id)}
                  className="rounded-md border-gray-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                />
                
                <Avatar className="h-10 w-10 border border-white/20">
                  <AvatarFallback className="bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 text-xs font-bold">
                    {app.applicant_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "??"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{app.applicant_name}</div>
                  <div className="text-xs text-gray-500 truncate">{app.applicant_email}</div>
                </div>

                {selectedIds.includes(app.id) && (
                  <CheckCircle2 className="h-5 w-5 text-violet-600 shrink-0" />
                )}
              </div>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl">
             <div className="flex gap-3">
                <Megaphone className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  Selected candidates will receive a formal notification. Their profiles will be updated to show they are currently working for your company.
                </p>
             </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={announcing} className="rounded-xl flex-1">
            Re-evaluate
          </Button>
          <Button onClick={handleAnnounce} disabled={announcing} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl flex-[2]">
            {announcing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Confirm & Announce
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
