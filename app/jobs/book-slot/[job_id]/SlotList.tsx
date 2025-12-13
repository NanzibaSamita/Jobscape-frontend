"use client"

import type { OpenSlot } from "./page"
import { SlotCard } from "./SlotCard"

interface SlotsListProps {
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

export function SlotsList({ slots, jobId, token, onSlotBooked, getDuration, overdue }: SlotsListProps) {
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
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    if (Object.keys(groupedSlots).length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No slots available</h3>
                <p className="text-muted-foreground">There are currently no interview slots available for this position.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {Object.entries(groupedSlots)
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([date, dateSlots]) => (
                    <div key={date} className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h3 className="text-2xl font-bold">{formatDate(date)}</h3>
                            <p className="text-muted-foreground">{dateSlots.length} slots available</p>
                        </div>
                        <div className="grid gap-4">
                            {dateSlots
                                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                                .map((slot) => (
                                    <SlotCard
                                        overdue={overdue}
                                        key={slot.id}
                                        slot={slot}
                                        jobId={jobId}
                                        token={token}
                                        onSlotBooked={onSlotBooked}
                                        getDuration={getDuration}
                                    />
                                ))}
                        </div>
                    </div>
                ))}
        </div>
    )
}
