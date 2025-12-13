"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function CustomCalendar({
    passSelectedDate,
    initialDate,
}: {
    passSelectedDate?: (date: Date) => void;
    initialDate?: Date | null;
}) {
    const [currentDate, setCurrentDate] = useState<Date | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    // Initialize only once when valid initialDate is available
    useEffect(() => {
        if (initialDate && !currentDate) {
            setCurrentDate(initialDate)
            setSelectedDate(initialDate)
            passSelectedDate?.(initialDate)
        }
    }, [initialDate, currentDate, passSelectedDate])

    const monthNames = [..."January February March April May June July August September October November December".split(" ")]
    const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"]

    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

    const navigateMonth = (direction: "prev" | "next") => {
        setCurrentDate((prev) => {
            if (!prev) return null
            const newDate = new Date(prev)
            newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1))
            return newDate
        })
    }

    const renderCalendarDays = () => {
        if (!currentDate) return null

        const daysInMonth = getDaysInMonth(currentDate)
        const firstDay = getFirstDayOfMonth(currentDate)
        const days = []

        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
        const daysInPrevMonth = prevMonth.getDate()

        for (let i = firstDay - 1; i >= 0; i--) {
            days.push(
                <button key={`prev-${i}`} className="w-5 h-5 text-[#bfc4d6] text-xs font-medium rounded-full mx-auto">
                    {daysInPrevMonth - i}
                </button>
            )
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const fullDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const isSelected = selectedDate &&
                selectedDate.getFullYear() === fullDate.getFullYear() &&
                selectedDate.getMonth() === fullDate.getMonth() &&
                selectedDate.getDate() === fullDate.getDate()

            days.push(
                <button
                    key={day}
                    onClick={() => {
                        setSelectedDate(fullDate)
                        passSelectedDate?.(fullDate)
                    }}
                    className={`w-5 h-5 mx-auto  text-xs font-medium dark:text-muted-foreground text-center hover:bg-gray-100 rounded-full ${isSelected ? "bg-primary hover:bg-primary" : "text-[#7C86A2] hover:bg-gray-100"
                        }`}
                >
                    {day}
                </button>
            )
        }

        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
        const remainingCells = totalCells - (firstDay + daysInMonth)

        for (let day = 1; day <= remainingCells; day++) {
            days.push(
                <button key={`next-${day}`} className="w-5 h-5 text-[#bfc4d6] text-xs font-medium rounded-full mx-auto">
                    {day}
                </button>
            )
        }

        return days
    }

    if (!currentDate) {
        return <div className="text-sm text-muted-foreground">Loading calendar...</div>
    }

    return (
        <div className="w-full h-full rounded-xl flex flex-col justify-start space-y-3">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-medium text-muted-foreground">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex items-center gap-2">
                        <div
                            onClick={() => navigateMonth("prev")}
                            className="bg-dashboard rounded-full hover:bg-primary/80 cursor-pointer"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </div>
                        <div
                            onClick={() => navigateMonth("next")}
                            className="bg-primary text-white rounded-full hover:bg-primary/80 cursor-pointer"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                <div>
                    <div className="grid grid-cols-7">
                        {daysOfWeek.map((day, i) => (
                            <p key={i} className="w-5 h-5 text-xs font-medium text-[#737d8889] mx-auto">
                                {day}
                            </p>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {renderCalendarDays()}
                    </div>
                </div>
            </div>
        </div>
    )
}
