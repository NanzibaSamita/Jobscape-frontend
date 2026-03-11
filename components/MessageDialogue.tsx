// FILE LOCATION: components/MessageDialog.tsx
// (New component for messaging with attachment support)

"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Paperclip } from "lucide-react";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";
// Assume lib/api/messages.ts has sendMessage function
import { sendMessage } from "@/lib/api/messages";

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientType: "employer";
}

export default function MessageDialog({ open, onOpenChange, recipientId, recipientType }: MessageDialogProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const dispatch = useAppDispatch();

  const MAX_ATTACHMENTS = 3;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const validFiles = newFiles.filter(file => file.size <= MAX_FILE_SIZE);
    if (validFiles.length < newFiles.length) {
      dispatch(showAlert({
        title: "File Size Limit",
        message: "Some files exceed 5MB limit",
        type: "error"
      }));
    }
    if (attachments.length + validFiles.length > MAX_ATTACHMENTS) {
      dispatch(showAlert({
        title: "Attachment Limit",
        message: `Maximum ${MAX_ATTACHMENTS} attachments allowed`,
        type: "error"
      }));
      return;
    }
    setAttachments([...attachments, ...validFiles]);
  }

  async function handleSend() {
    if (!message.trim() && attachments.length === 0) {
      dispatch(showAlert({
        title: "Missing Content",
        message: "Message or attachment required",
        type: "error"
      }));
      return;
    }
    try {
      setSending(true);
      await sendMessage({
        recipient_id: recipientId,
        recipient_type: recipientType,
        content: message,
        attachments, // Assume API handles file uploads
      });
      dispatch(showAlert({
        title: "Success",
        message: "Message sent!",
        type: "success"
      }));
      onOpenChange(false);
      setMessage("");
      setAttachments([]);
    } catch (error: any) {
      dispatch(showAlert({
        title: "Error",
        message: error?.response?.data?.detail || "Failed to send message",
        type: "error"
      }));
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <label>
                <Paperclip className="h-4 w-4 mr-2" />
                Attach File
                <input type="file" multiple hidden onChange={handleFileChange} accept=".pdf,.docx,.jpg,.png" />
              </label>
            </Button>
            <span className="text-sm text-gray-500">{attachments.length}/{MAX_ATTACHMENTS} attachments</span>
          </div>
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span>{file.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}