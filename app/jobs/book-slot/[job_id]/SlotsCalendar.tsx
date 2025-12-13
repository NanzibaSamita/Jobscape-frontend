"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OpenSlot } from "./page"
import { SlotCard } from "./SlotCard"

interface SlotsCalendarProps {
    slots: OpenSlot[]
    jobId: string
    token: string
    onSlotBooked: (slotId: number) => void
    getDuration: (start_time: string, end_time: string) => string
    overdue: boolean
}

interface GroupedSlots {
    [date: string]: OpenSlot[]
}

export function SlotsCalendar({ slots, jobId, token, onSlotBooked, getDuration, overdue }: SlotsCalendarProps) {
    // Group slots by date
    const groupedSlots: GroupedSlots = slots.reduce((acc, slot) => {
        const date = slot.start_time.split(" ")[0]
        if (!acc[date]) {
            acc[date] = []
        }
        acc[date].push(slot)
        return acc
    }, {} as GroupedSlots)

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        })
    }

    const formatFullDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    if (Object.keys(groupedSlots).length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-black mb-2">No slots available</h3>
                <p className="text-gray-600">There are currently no interview slots available for this position.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(groupedSlots)
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([date, dateSlots]) => (
                    <Card
                        key={date}
                        className="border border-primary hover:border-yellow-400 transition-colors bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/10 dark:to-white/10"
                    >
                        <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/30 dark:from-primary/5 dark:to-primary/10 rounded-t-lg">
                            <CardTitle className="text-lg font-bold">{formatDate(date)}</CardTitle>
                            <p className="text-sm opacity-90">{formatFullDate(date)}</p>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {dateSlots
                                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                                .map((slot) => (
                                    <div key={slot.id} className="border border-gray-200 rounded-lg p-3 bg-dashboard-foreground">
                                        <SlotCard
                                            overdue={overdue}
                                            slot={slot}
                                            jobId={jobId}
                                            token={token}
                                            onSlotBooked={onSlotBooked}
                                            compact={true}
                                            getDuration={getDuration}
                                        />
                                    </div>
                                ))}
                        </CardContent>
                    </Card>
                ))}
        </div>
    )
}
