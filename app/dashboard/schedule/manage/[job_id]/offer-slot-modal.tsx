"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Send, CalendarIcon, Paperclip, X } from "lucide-react"
import { Candidate, Slot } from "./slot-schedule-page"
import { toast } from "react-toastify"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
// import { maskEmail, maskName } from "@/app/dashboard/jobs/applicants/[job_id]/applicant-card"
import { api } from "@/lib/axios/axios"




interface OfferSlotModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    slot: Slot | null
    candidate?: Candidate,
}

export default function OfferSlotModal({ open, onOpenChange, slot, candidate }: OfferSlotModalProps) {
    const [salary, setSalary] = useState("")
    const [join_by, setJoin_by] = useState<string>("")
    const [sending, setSending] = useState(false)
    const [attachment, setAttachment] = useState<File | null>(null)

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file size (e.g., max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must be less than 10MB")
                return
            }
            setAttachment(file)
        }
    }

    const removeAttachment = () => {
        setAttachment(null)
    }

    const handelSendOffer = async () => {
        console.log("Sending offer email...", candidate, slot, slot?.job_application_id)
        if (!candidate || !slot || !slot?.job_application_id) return

        setSending(true)
        try {
            const formData = new FormData()
            formData.append("salary", salary)
            formData.append("join_by", join_by ? new Date(join_by).toISOString().split("T")[0] : "")

            if (attachment) {
                formData.append("attachment", attachment)
            }

            await api.post(`/api/v1/job-applications/${slot?.job_application_id}/send-offer`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            toast.success("Offer email sent successfully")
            onOpenChange(false)
            // Reset form
            setJoin_by("")
            setSalary("")
            setAttachment(null)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Failed to send offer email:", error)
            const msg = error?.response?.data?.message || "Something went wrong."
            toast.error(msg)
        } finally {
            setSending(false)
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
                                <p className="font-medium">{candidate.full_name ?? ""}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Email</Label>
                                <p className="font-medium">{candidate.email ?? ""}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Interview Time</Label>
                                <p className="font-medium">{formatDateTime(slot.start_time)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Email Form */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="salary">Salary</Label>
                            <Input
                                type="number"
                                id="salary"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                placeholder="Offered Salary"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <Label htmlFor="salary">Join By Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>

                                    <button
                                        type="button"
                                        className={`w-full text-left px-3 py-2 border rounded-md shadow-sm bg-white ${!join_by ? "text-muted-foreground" : ""
                                            }`}
                                    >
                                        {join_by
                                            ? new Date(join_by).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })
                                            : "Select a date"}
                                        <CalendarIcon className="ml-2 inline-block w-4 h-4 text-gray-400 float-right" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[102] bg-white">
                                    <Calendar
                                        mode="single"
                                        selected={join_by ? new Date(join_by) : undefined}
                                        onSelect={(date) => setJoin_by(date?.toDateString() ?? "")}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Attachment Section */}
                        <div>
                            <Label htmlFor="attachment">Attachment (Optional)</Label>
                            <div className="space-y-2">
                                {!attachment ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="file"
                                            id="attachment"
                                            onChange={handleFileChange}
                                            accept=".pdf"
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('attachment')?.click()}
                                            className="flex items-center gap-2"
                                        >
                                            <Paperclip className="w-4 h-4" />
                                            Attach PDF
                                        </Button>
                                        <span className="text-xs text-muted-foreground">PDF files only</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md border">
                                        <div className="flex items-center gap-2">
                                            <Paperclip className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium">{attachment.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                ({(attachment.size / 1024).toFixed(1)} KB)
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeAttachment}
                                            className="h-8 w-8 p-0 hover:bg-red-100"
                                        >
                                            <X className="w-4 h-4 text-red-600" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4">


                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handelSendOffer}
                                disabled={sending}
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
                                        Send Offer
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
