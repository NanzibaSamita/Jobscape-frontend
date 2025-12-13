"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Trash2 } from "lucide-react"
import { TimeSlot } from "./types"

interface ListViewProps {
    slots: TimeSlot[]
    onRemoveSlot: (id: string) => void
    formatTime: (timeString: string) => string
    formatDate: (dateString: string) => string
}

export function ListView({ slots, onRemoveSlot, formatTime, formatDate }: ListViewProps) {
    const groupSlotsByDate = () => {
        const grouped: { [key: string]: TimeSlot[] } = {}
        slots.forEach((slot) => {
            if (!grouped[slot.date]) {
                grouped[slot.date] = []
            }
            grouped[slot.date].push(slot)
        })
        return grouped
    }

    const groupedSlots = groupSlotsByDate()

    if (slots.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No time slots scheduled yet.</p>
                <p className="text-sm">Add your first slot using the form above or switch to calendar view.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                <div key={date}>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(date)}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {dateSlots.map((slot) => {
                            const hasConflict = dateSlots
                                .filter((s) => s.id !== slot.id)
                                .some((otherSlot) => {
                                    const slotStart = new Date(slot.start_time).getTime()
                                    const slotEnd = new Date(slot.end_time).getTime()
                                    const otherStart = new Date(otherSlot.start_time).getTime()
                                    const otherEnd = new Date(otherSlot.end_time).getTime()
                                    return slotStart < otherEnd && slotEnd > otherStart
                                })

                            return (
                                <div
                                    key={slot.id}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-3 sm:gap-0 ${hasConflict ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
                                        }`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Clock className={`h-4 w-4 flex-shrink-0 ${hasConflict ? "text-red-600" : "text-blue-600"}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                <span className="truncate">
                                                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                </span>
                                                {hasConflict && (
                                                    <Badge variant="destructive" className="text-xs w-fit">
                                                        Conflict
                                                    </Badge>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Duration:{" "}
                                                {Math.round((new Date(slot.end_time).getTime() - new Date(slot.start_time).getTime()) / 60000)}{" "}
                                                minutes
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveSlot(slot.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 self-end sm:self-center flex-shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                    {date !== Object.keys(groupedSlots)[Object.keys(groupedSlots).length - 1] && <Separator className="mt-4" />}
                </div>
            ))}
        </div>
    )
}
