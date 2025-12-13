"use client"

import { useState } from "react"
import { Calendar, List } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { OpenSlot } from "./page"
import { SlotsList } from "./SlotList"
import { SlotsCalendar } from "./SlotsCalendar"

interface SlotBookingContainerProps {
    slots: OpenSlot[]
    jobId: string
    token: string
    deadline: string
}

export function SlotBookingContainer({ deadline, slots, jobId, token }: SlotBookingContainerProps) {
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
    const [currentSlots, setCurrentSlots] = useState<OpenSlot[]>(slots)
    const overdue = new Date(deadline).getTime() < new Date().getTime();
    const handleSlotBooked = (slotId: number) => {
        setCurrentSlots((prev) => prev.map((slot) => (slot.id === slotId ? { ...slot, is_booked: 1 } : slot)))
    }

    const getDuration = (start_time: string, end_time: string): string => {
        const start = new Date(start_time);
        const end = new Date(end_time);
        const diffMs = end.getTime() - start.getTime();

        const totalMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    return (
        <div className="w-full max-w-6xl">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "calendar")}>
                <TabsList className="mb-2 border-2 border-primary/50">
                    <TabsTrigger
                        value="list"
                        className="flex items-center space-x-2 data-[state=active]:bg-dashboard-foreground data-[state=active]:text-black data-[state=active]:dark:text-muted-foreground dark:text-yellow-400"
                    >
                        <List className="h-4 w-4" />
                        <span>List</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="calendar"
                        className="flex items-center space-x-2 data-[state=active]:bg-dashboard-foreground data-[state=active]:text-black data-[state=active]:dark:text-muted-foreground dark:text-yellow-400"
                    >
                        <Calendar className="h-4 w-4" />
                        <span>Calendar</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                    <SlotsList overdue={overdue} getDuration={getDuration} slots={currentSlots} jobId={jobId} token={token} onSlotBooked={handleSlotBooked} />
                </TabsContent>

                <TabsContent value="calendar">
                    <SlotsCalendar
                        overdue={overdue}
                        slots={currentSlots}
                        jobId={jobId}
                        token={token}
                        onSlotBooked={handleSlotBooked}
                        getDuration={getDuration}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
