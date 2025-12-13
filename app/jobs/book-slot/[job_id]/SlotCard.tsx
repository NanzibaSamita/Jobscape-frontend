"use client"

import { useState } from "react"
import { Clock, CheckCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { OpenSlot } from "./page"
import { toast } from "react-toastify"
import { api } from "@/lib/axios/axios"
import { useAppSelector } from "@/lib/store"

interface SlotCardProps {
    slot: OpenSlot
    jobId: string
    token: string
    onSlotBooked: (slotId: number) => void
    compact?: boolean
    getDuration: (start_time: string, end_time: string) => string
    overdue: boolean
}

export function SlotCard({ slot, jobId, onSlotBooked, compact = false, getDuration, overdue }: SlotCardProps) {
    const [booking, setBooking] = useState(false)
    const { userId } = useAppSelector((state) => ({ userId: state.auth.user?.id }));
    const formatTime = (timeString: string) => {
        const time = new Date(timeString)
        return time.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
    }

    const bookSlot = async () => {
        try {
            setBooking(true)

            const bookingData = {
                candidate_id: userId,
                interview_slot_id: slot.id,
                job_post_id: Number.parseInt(jobId),
            }

            await api.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/book-interview-slot`, bookingData)
            onSlotBooked(slot.id)
        } catch (error) {
            let errorMessage = "Failed to book slot. Please try again later.";
            if (
                typeof error === "object" &&
                error !== null &&
                "response" in error
            ) {
                const err = error as { response?: { data?: { error?: string } } };
                if (typeof err.response?.data?.error === "string") {
                    errorMessage = err.response.data.error;
                }
            }
            toast.error(errorMessage)
        } finally {
            setBooking(false)
        }
    }

    if (compact) {
        return (
            <div className="flex items-center justify-between flex-wrap lg:flex-nowrap">
                <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </span>
                </div>
                {slot.is_booked ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Booked
                    </Badge>
                ) : (overdue ? <Badge className="bg-destructive/10 text-destructive border-destructive/25 hover:bg-green-100 hover:text-green-800 hover:border-green-200">
                    Deadline Passed
                </Badge> :
                    <Button
                        size="sm"
                        onClick={bookSlot}
                        disabled={booking}
                        className="bg-primary hover:bg-primary/90 text-black font-medium"
                    >
                        {booking ? "Booking..." : "Book"}
                    </Button>
                )}
            </div>
        )
    }

    return (
        <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap lg:flex-nowrap space-y-2">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/40 rounded-full hidden sm:block">
                            <Clock className="h-5 w-5 text-yellow-600 " />
                        </div>
                        <div>
                            <p className="text-lg font-semibold">
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                                <Calendar className="h-4 w-4 mr-1" />
                                Duration: {getDuration(slot.start_time, slot.end_time)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        {slot.is_booked ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200 px-3 py-1">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Booked
                            </Badge>
                        ) : (overdue ? <Badge className="bg-destructive/10 text-destructive border-destructive/25 hover:bg-green-100 hover:text-green-800 hover:border-green-200">
                            Deadline Passed
                        </Badge> :
                            <Button
                                onClick={bookSlot}
                                disabled={booking}
                                className="bg-primary hover:bg-primary/90 font-semibold px-6 py-2"
                            >
                                {booking ? "Booking..." : "Book Slot"}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
