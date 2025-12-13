"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, User, Mail, Phone, Video, MoreVertical, Link, AlertCircle, HandHelping, FlagOff } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Candidate, Slot } from "./slot-schedule-page"
import { api } from "@/lib/axios/axios"
import { toast } from "react-toastify"

interface SlotCardProps {
    slot: Slot
    candidate?: Candidate
    candidates?: Candidate[]
    onStatusChange?: (slotId: number, candidate: number | string, status: "taken") => void
    onBookSlot?: (slotId: number, candidateId: number, meetLink: string, status: string) => void
    onSendEmail?: (slot: Slot) => void
    onUpdateMeetLink?: (slotId: number, meetLink: string) => void
    disabled?: boolean
    jobId: string
    onOffer: (slot: Slot) => void
}

export default function SlotCard({
    slot,
    candidate,
    candidates,
    onStatusChange,
    onBookSlot,
    onSendEmail,
    onUpdateMeetLink,
    disabled = false,
    jobId,
    onOffer
}: SlotCardProps) {
    const [selectedCandidate, setSelectedCandidate] = useState<string>("")
    const [meetLink, setMeetLink] = useState<string>(slot.meeting_link || "")
    const [isEditingMeetLink, setIsEditingMeetLink] = useState(false)

    // Mask candidate information
    const maskName = (name: string) => {
        const parts = name.split(" ")
        return parts
            .map((part) => {
                if (part.length <= 2) return part
                return `${part[0]}${"•".repeat(part.length - 2)}${part[part.length - 1]}`
            })
            .join(" ")
    }

    const maskEmail = (email: string) => {
        const [username, domain] = email.split("@")
        const maskedUsername =
            username.length > 2
                ? `${username[0]}${"•".repeat(username.length - 2)}${username[username.length - 1]}`
                : username
        return `${maskedUsername}@${domain}`
    }

    const maskPhone = (phone: string) => {
        if (phone.length <= 4) return phone
        return `${phone.slice(0, 2)}${"•".repeat(phone.length - 4)}${phone.slice(-2)}`
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case "taken":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Taken</Badge>
            case "overdue":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>
            default:
                return <Badge variant="secondary">Pending</Badge>
        }
    }

    const handleBookSlot = () => {
        if (selectedCandidate && onBookSlot && meetLink.trim()) {
            api.post(`api/v1/interview-status-update`, {
                job_post_id: jobId,
                candidate_id: Number.parseInt(selectedCandidate),
                slot_id: slot.id,
                meeting_link: meetLink.trim(),
                status: 0,
            }).then(() => {
                toast.success("Slot booked successfully")
                onBookSlot(slot.id, Number.parseInt(selectedCandidate), meetLink.trim(), "pending")
                setSelectedCandidate("")
                setMeetLink("")
            }).catch((error) => {
                console.error("Booking failed:", error);
                const msg = error?.response?.data?.message || "Something went wrong.";
                toast.error(msg);
            }).finally(() => {
                setIsEditingMeetLink(false)
            });
        }
    }

    const handleUpdateMeetLink = () => {
        if (!candidate?.candidate_id) return toast.error("Cannot update meeting link for booked slots")
        if (onUpdateMeetLink && meetLink.trim()) {
            api.post(`api/v1/interview-status-update`, {
                job_post_id: jobId,
                candidate_id: Number.parseInt(String(candidate?.candidate_id ?? "0")),
                slot_id: slot.id,
                meeting_link: meetLink.trim(),
                status: 0,
            }).then(() => {
                toast.success("Slot booked successfully")
                onUpdateMeetLink(slot.id, meetLink.trim())
                setIsEditingMeetLink(false)

            }).catch((error) => {
                console.error("Booking failed:", error);
                const msg = error?.response?.data?.message || "Something went wrong.";
                toast.error(msg);
            }).finally(() => {
                setIsEditingMeetLink(false)
            });
        }
    }

    const isBooked = slot.is_booked === 1
    const isOverdue = slot.status === "overdue"
    const isDisabled = disabled || isOverdue

    return (
        <Card
            className={`${isBooked ? "border-green-200 bg-green-50/30" : isOverdue ? "border-red-200 bg-red-50/30" : "border-border"}`}
        >
            <CardContent className="p-3 md:p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium text-sm md:text-base">
                                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                </span>
                            </div>
                            <span className="text-xs md:text-sm text-muted-foreground">{formatDate(slot.start_time)}</span>
                            {getStatusBadge(slot.status)}
                            {isOverdue && (
                                <div className="flex items-center gap-1 text-red-600">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-xs">Actions Disabled</span>
                                </div>
                            )}
                        </div>
                        {isBooked && candidate && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <span className="font-medium hidden text-sm md:text-base">{maskName(candidate.full_name)}</span>
                                    <span className="font-medium text-sm md:text-base">{candidate.full_name}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Mail className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate hidden">{maskEmail(candidate.email)}</span>
                                        <span className="truncate">{candidate.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Phone className="w-3 h-3 flex-shrink-0" />
                                        <span className="hidden">{maskPhone(candidate.user_mobile ?? "")}</span>
                                        <span>{candidate.user_mobile ?? ""}</span>
                                    </div>
                                </div>

                                {/* Meet Link Section */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Video className="w-4 h-4 text-blue-600 dark:text-muted-foreground flex-shrink-0" />
                                    {isEditingMeetLink ? (
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <Input
                                                value={meetLink}
                                                onChange={(e) => setMeetLink(e.target.value)}
                                                placeholder="Enter meeting link"
                                                className="text-xs md:text-sm"
                                                disabled={isDisabled}
                                            />
                                            <Button size="sm" onClick={handleUpdateMeetLink} disabled={!meetLink.trim() || isDisabled}>
                                                Save
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setIsEditingMeetLink(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            {slot.meeting_link ? (
                                                <a
                                                    href={slot.meeting_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 dark:text-muted-foreground hover:underline text-xs md:text-sm truncate"
                                                >
                                                    {slot.meeting_link}
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <Input
                                                        value={meetLink}
                                                        onChange={(e) => setMeetLink(e.target.value)}
                                                        placeholder="Enter meeting link"
                                                        className="text-xs md:text-sm"
                                                        disabled={isDisabled}
                                                    />
                                                    <Button size="sm" onClick={handleUpdateMeetLink} disabled={!meetLink.trim() || isDisabled}>
                                                        Save
                                                    </Button>
                                                </div>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setIsEditingMeetLink(true)}
                                                disabled={isDisabled}
                                                className="flex-shrink-0"
                                            >
                                                <Link className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {!isBooked && candidates && !isDisabled && (
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select candidate" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {candidates.map((candidate) => (
                                                <SelectItem key={candidate.candidate_id} value={candidate.candidate_id.toString()}>
                                                    {candidate.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col items-center sm:flex-row gap-2">
                                    <Input
                                        value={meetLink}
                                        onChange={(e) => setMeetLink(e.target.value)}
                                        placeholder="Enter meeting link"
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={handleBookSlot}
                                        disabled={!selectedCandidate || !meetLink.trim()}
                                        size="sm"
                                        className="sm:w-auto"
                                    >
                                        Book Slot
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {isBooked && candidate && onSendEmail && !isDisabled && (
                            <Button variant="outline" size="sm" onClick={() => onSendEmail(slot)} className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                <span className="hidden sm:inline">Email</span>
                            </Button>
                        )}
                        {slot.status === "taken" && candidate && onOffer && !isDisabled && (
                            <Button variant="outline" size="sm" onClick={() => onOffer(slot)} className="flex items-center gap-1">
                                <HandHelping className="w-4 h-4" />
                                <span className="hidden sm:inline">Make Offer</span>
                            </Button>
                        )}
                        {slot.status === "taken" && candidate && !isDisabled && (
                            <Button variant="outline" size="sm" className="items-center hidden gap-1">
                                <FlagOff className="w-4 h-4" />
                                <span className="hidden sm:inline">Reject</span>
                            </Button>
                        )}
                        {onStatusChange && isBooked && !isDisabled && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onStatusChange(slot.id, candidate?.candidate_id ?? "0", "taken")}>Mark as Taken</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
