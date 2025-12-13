"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Trash2, Calendar } from "lucide-react"
import { TimeSlot } from "./types"

interface CreatedSlotsProps {
    slots: TimeSlot[]
    onRemoveSlot: (id: string) => void
    formatTime: (timeString: string) => string
    formatDate: (dateString: string) => string
}

export function CreatedSlots({ slots, onRemoveSlot, formatTime, formatDate }: CreatedSlotsProps) {
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

    return (
        <Card className="border backdrop-blur-sm">
            <CardHeader className="p-2 sm:p-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    Created Slots ({slots.length})
                </CardTitle>
                {slots.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                        {Object.keys(groupedSlots).length} day{Object.keys(groupedSlots).length !== 1 ? "s" : ""} scheduled
                    </p>
                )}
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
                {slots.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No time slots created yet</p>
                        <p className="text-sm">Use the calendar or form above to create your first slot</p>
                    </div>
                ) : (
                    <div className="space-y-6 max-h-96 overflow-y-auto px-1">
                        {Object.entries(groupedSlots)
                            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                            .map(([date, dateSlots]) => (
                                <div key={date}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="font-semibold text-muted-foreground sm:text-base text-xs">{formatDate(date)}</h3>
                                        <Badge variant="secondary" className="ml-auto shrink-0 bg-primary/15 text-muted-foreground sm:text-base text-xs">
                                            {dateSlots.length} slot{dateSlots.length !== 1 ? "s" : ""}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        {dateSlots
                                            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                                            .map((slot) => {
                                                // Check for conflicts with other slots on the same date
                                                const hasConflict = dateSlots
                                                    .filter((s) => s.id !== slot.id)
                                                    .some((otherSlot) => {
                                                        const slotStart = new Date(slot.start_time).getTime()
                                                        const slotEnd = new Date(slot.end_time).getTime()
                                                        const otherStart = new Date(otherSlot.start_time).getTime()
                                                        const otherEnd = new Date(otherSlot.end_time).getTime()
                                                        // console.log(slotStart, otherEnd, slotEnd, otherStart, (slotStart < otherEnd && slotEnd > otherStart))
                                                        return slotStart < otherEnd && slotEnd > otherStart
                                                    })

                                                const duration = Math.round(
                                                    (new Date(slot.end_time).getTime() - new Date(slot.start_time).getTime()) / 60000,
                                                )

                                                return (
                                                    <div
                                                        key={slot.id}
                                                        className={`flex sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-colors gap-3 sm:gap-0 ${hasConflict
                                                            ? "bg-red-50 border-red-200 hover:bg-red-100"
                                                            : "bg-blue-50 dark:bg-primary/20 dark:border-primary/20 border-blue-200 hover:dark:bg-primary/30 hover:bg-blue-100"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <Clock
                                                                className={`h-4 w-4 flex-shrink-0 ${hasConflict ? "text-red-600" : "text-muted-foreground"}`}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                                    <p className="font-medium text-muted-foreground sm:text-base text-xs truncate">
                                                                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                                    </p>
                                                                    {hasConflict && (
                                                                        <Badge variant="destructive" className="text-xs w-fit">
                                                                            Conflict
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-muted-foreground sm:text-sm text-xs">
                                                                    Duration: {duration} minute{duration !== 1 ? "s" : ""}
                                                                </p>
                                                                {hasConflict && (
                                                                    <p className="text-xs text-red-600 mt-1">
                                                                        This slot overlaps with another slot on the same day
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onRemoveSlot(slot.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-100 self-end sm:self-center flex-shrink-0"
                                                            title="Remove slot"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )
                                            })}
                                    </div>

                                    {date !== Object.keys(groupedSlots)[Object.keys(groupedSlots).length - 1] && (
                                        <Separator className="mt-4" />
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
