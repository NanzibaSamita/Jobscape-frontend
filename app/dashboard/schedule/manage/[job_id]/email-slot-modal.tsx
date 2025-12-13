"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Send, Copy } from "lucide-react"
import { Candidate, Slot } from "./slot-schedule-page"
import { toast } from "react-toastify"




interface EmailSlotModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    slot: Slot | null
    candidate?: Candidate,
    jobId: string
}

export default function EmailSlotModal({ open, onOpenChange, slot, candidate }: EmailSlotModalProps) {
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [sending, setSending] = useState(false)

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
    }

    const generateDefaultEmail = () => {
        if (!slot || !candidate) return

        const startTime = formatDateTime(slot.start_time)
        const endTime = new Date(slot.end_time).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })

        setSubject(`Interview Scheduled - ${startTime}`)
        setMessage(`Dear Candidate,

I hope this email finds you well.

Your interview has been scheduled for:
📅 Date & Time: ${startTime} - ${endTime}
🔗 Meeting Link: ${slot.meeting_link || "Will be provided shortly"}

Please make sure to:
- Join the meeting 5 minutes early
- Test your camera and microphone beforehand
- Have your resume and any relevant documents ready
- Prepare questions about the role and company

If you need to reschedule or have any questions, please don't hesitate to reach out.

Looking forward to speaking with you!

Best regards,
HR Team`)
    }

    const handleSendEmail = async () => {
        if (!candidate || !slot) return

        setSending(true)
        try {
            // Simulate API call to send email
            await new Promise((resolve) => setTimeout(resolve, 2000))

            console.log("Email sent to:", candidate.email)
            console.log("Subject:", subject)
            console.log("Message:", message)

            onOpenChange(false)
            // Reset form
            setSubject("")
            setMessage("")
        } catch (error) {
            console.error("Failed to send email:", error)
        } finally {
            setSending(false)
        }
    }

    const copyMeetLink = () => {
        if (slot?.meeting_link) {
            navigator.clipboard.writeText(slot.meeting_link)
        }
    }

    if (!slot || !candidate) {
        onOpenChange(false)
        return toast.error("No slot or candidate selected");
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-2xl sm:max-w-3xl px-4 sm:px-6 overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex gap-2">
                        <Mail className="w-5 h-5" />
                        Send Interview Email
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Recipient Info */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

                            <div>
                                <Label className="text-muted-foreground">Candidate</Label>
                                <p className="font-medium">{candidate.full_name}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Email</Label>
                                <p className="font-medium">{candidate.email}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Interview Time</Label>
                                <p className="font-medium">{formatDateTime(slot.start_time)}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Meeting Link</Label>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-blue-600 truncate">{slot.meeting_link || "Not generated"}</p>
                                    {slot.meeting_link && (
                                        <Button variant="ghost" size="sm" onClick={copyMeetLink}>
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Email Form */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Email subject"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Email message"
                                rows={10}
                                className="resize-none w-full"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4">
                        <Button variant="outline" onClick={generateDefaultEmail}>
                            Generate Default Email
                        </Button>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSendEmail}
                                disabled={!subject || !message || sending}
                                className="flex items-center gap-2"
                            >
                                {sending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Email
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
