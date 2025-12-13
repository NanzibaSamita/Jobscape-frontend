"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

interface CalendarViewProps {
    currentMonth: Date
    onNavigateMonth: (direction: "prev" | "next") => void
    onTodayClick: () => void
    onDayClick: (date: Date) => void
}

export function CalendarView({ currentMonth, onNavigateMonth, onTodayClick, onDayClick }: CalendarViewProps) {
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days = []

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day))
        }

        return days
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isPastDate = (date: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date < today
    }

    return (
        <div className="space-y-4">
            {/* Calendar Header - make it responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                <h3 className="text-lg font-semibold text-gray-900 text-center sm:text-left">
                    {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onNavigateMonth("prev")} className="h-8 w-8 p-0">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={onTodayClick} className="h-8 px-3 text-xs bg-transparent">
                        Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onNavigateMonth("next")} className="h-8 w-8 p-0">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="rounded-lg overflow-hidden">
                {/* Days of week header */}
                <div className="grid grid-cols-7">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div
                            key={day}
                            className="p-2 text-center sm:text-sm text-xs font-medium text-muted-foreground border-r last:border-r-0"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7">
                    {getDaysInMonth(currentMonth).map((date, index) => {
                        if (!date) {
                            return <div key={index} className="border-r border-b last:border-r-0 h-10 sm:h-20" />
                        }

                        const isCurrentDay = isToday(date)
                        const isPast = isPastDate(date)

                        return (
                            <div
                                key={date.toISOString()}
                                className={`h-10 sm:h-20 border-r border-b p-1 sm:p-2 cursor-pointer hover:bg-dashboard/20 transition-colors flex flex-col items-center justify-center ${isPast ? "bg-dashboard/50 cursor-not-allowed" : "bg-dashboard"
                                    } ${isCurrentDay ? "bg-blue-50" : ""}`}
                                onClick={() => !isPast && onDayClick(date)}
                                title={isPast ? "Cannot schedule in the past" : "Click to add time slot"}
                            >
                                <div
                                    className={`text-xs sm:text-sm font-medium mb-1 ${isPast ? "text-muted-foreground/50" : isCurrentDay ? "text-primary" : "text-muted-foreground"
                                        }`}
                                >
                                    {date.getDate()}
                                </div>
                                {!isPast && (
                                    <div className="opacity-0 hover:opacity-100 transition-opacity">
                                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Calendar Legend */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Plus className="h-3 w-3 text-muted-foreground" />
                    <span>Click day to add slot</span>
                </div>
            </div>
        </div>
    )
}
