"use client"

import { useState } from "react"
import {
    Calendar,
    Clock,
    Plus,
    Trash2,
    Save,
    Users,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Grid,
    List,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DashboardLayout } from "@/components/layouts/DashboardLayout"

interface TimeSlot {
    id: string
    start_time: string
    end_time: string
    date: string
}

interface ScheduleData {
    job_post_id: number
    slot_selection_deadline: string
    slots: TimeSlot[]
    candidates: number[]
}

export default function SchedulePage() {
    const [selectedDate, setSelectedDate] = useState("")
    const [startTime, setStartTime] = useState("")
    const [duration, setDuration] = useState("")
    const [slots, setSlots] = useState<TimeSlot[]>([])
    const [jobPostId, setJobPostId] = useState(27)
    const [deadline, setDeadline] = useState("")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [candidates, setCandidates] = useState<number[]>([89, 92])
    const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar")
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const [showSlotModal, setShowSlotModal] = useState(false)
    const [modalDate, setModalDate] = useState("")
    const [modalStartTime, setModalStartTime] = useState("")
    const [modalDuration, setModalDuration] = useState("")


    const [validationError, setValidationError] = useState("")


    const durationOptions = [
        { value: "30", label: "30 minutes" },
        { value: "60", label: "1 hour" },
        { value: "90", label: "1 hour 30 minutes" },
        { value: "120", label: "2 hours" },
        { value: "150", label: "2 hours 30 minutes" },
        { value: "180", label: "3 hours" },
    ]

    const generateTimeOptions = () => {
        const times = []
        const startHour = 0
        const endHour = 24

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
                times.push(timeString)
            }
        }
        return times
    }

    const addTimeSlot = () => {
        if (!selectedDate || !startTime || !duration) return

        // Clear previous validation error
        setValidationError("")

        // Validate the time slot
        const validationResult = validateTimeSlot(selectedDate, startTime, duration)
        if (validationResult) {
            setValidationError(validationResult)
            return
        }

        const startDateTime = new Date(`${selectedDate}T${startTime}:00`)
        const endDateTime = new Date(startDateTime.getTime() + Number.parseInt(duration) * 60000)

        const newSlot: TimeSlot = {
            id: Date.now().toString(),
            start_time: `${selectedDate} ${startTime}:00`,
            end_time: `${selectedDate} ${endDateTime.toTimeString().slice(0, 8)}`,
            date: selectedDate,
        }

        setSlots([...slots, newSlot])
        setStartTime("")
        setDuration("")
    }

    const removeSlot = (id: string) => {
        setSlots(slots.filter((slot) => slot.id !== id))
    }

    const formatTime = (timeString: string) => {
        const date = new Date(timeString)
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

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

    const generateAPIData = (): ScheduleData => {
        return {
            job_post_id: jobPostId,
            slot_selection_deadline: deadline ? `${deadline} 23:59:59` : "",
            slots: slots.map((slot) => ({
                start_time: slot.start_time,
                end_time: slot.end_time,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            })) as any,
            candidates: candidates,
        }
    }

    const handleSave = () => {
        const apiData = generateAPIData()
        console.log("API Data:", JSON.stringify(apiData, null, 2))
        // Here you would typically send this data to your API
    }



    const hasOverlappingSlots = (newSlot: { start_time: string; end_time: string; date: string }): boolean => {
        const existingSlotsForDate = slots.filter((slot) => slot.date === newSlot.date)

        const newStart = new Date(newSlot.start_time).getTime()
        const newEnd = new Date(newSlot.end_time).getTime()

        return existingSlotsForDate.some((existingSlot) => {
            const existingStart = new Date(existingSlot.start_time).getTime()
            const existingEnd = new Date(existingSlot.end_time).getTime()

            // Check for any overlap
            return newStart < existingEnd && newEnd > existingStart
        })
    }

    const validateTimeSlot = (date: string, startTime: string, duration: string): string | null => {
        const startDateTime = new Date(`${date}T${startTime}:00`)
        const endDateTime = new Date(startDateTime.getTime() + Number.parseInt(duration) * 60000)


        // Check for overlapping slots
        const newSlot = {
            start_time: `${date} ${startTime}:00`,
            end_time: `${date} ${endDateTime.toTimeString().slice(0, 8)}`,
            date: date,
        }

        if (hasOverlappingSlots(newSlot)) {
            return "This time slot overlaps with an existing slot"
        }

        return null
    }

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day))
        }

        return days
    }

    const getSlotsForDate = (date: Date) => {
        const dateString = date.toISOString().split("T")[0]
        return slots.filter((slot) => slot.date === dateString)
    }

    const navigateMonth = (direction: "prev" | "next") => {
        setCurrentMonth((prev) => {
            const newDate = new Date(prev)
            if (direction === "prev") {
                newDate.setMonth(prev.getMonth() - 1)
            } else {
                newDate.setMonth(prev.getMonth() + 1)
            }
            return newDate
        })
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

    const handleDayClick = (date: Date) => {
        const dateString = date.toISOString().split("T")[0]
        setModalDate(dateString)
        setModalStartTime("")
        setModalDuration("")
        setValidationError("")
        setShowSlotModal(true)
    }

    const addSlotFromModal = () => {
        if (!modalDate || !modalStartTime || !modalDuration) return

        // Clear previous validation error
        setValidationError("")

        // Validate the time slot
        const validationResult = validateTimeSlot(modalDate, modalStartTime, modalDuration)
        if (validationResult) {
            setValidationError(validationResult)
            return
        }

        const startDateTime = new Date(`${modalDate}T${modalStartTime}:00`)
        const endDateTime = new Date(startDateTime.getTime() + Number.parseInt(modalDuration) * 60000)

        const newSlot: TimeSlot = {
            id: Date.now().toString(),
            start_time: `${modalDate} ${modalStartTime}:00`,
            end_time: `${modalDate} ${endDateTime.toTimeString().slice(0, 8)}`,
            date: modalDate,
        }

        setSlots([...slots, newSlot])
        setModalStartTime("")
        setModalDuration("")
        setShowSlotModal(false)
    }

    const groupedSlots = groupSlotsByDate()

    return (
        <DashboardLayout>
            <div className="w-full relative h-full space-y-2 overflow-y-auto">
                {/* <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100"> */}
                <div className="">
                    <div className="mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Management</h1>
                            <p className="text-gray-600">Create and manage interview time slots for candidates.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Slot Creation */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Information */}
                                <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <CalendarDays className="h-5 w-5 text-blue-600" />
                                            Basic Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="jobPostId" className="text-sm font-medium text-gray-700">
                                                    Job Post ID
                                                </Label>
                                                <Input
                                                    id="jobPostId"
                                                    type="number"
                                                    value={jobPostId}
                                                    onChange={(e) => setJobPostId(Number.parseInt(e.target.value))}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="deadline" className="text-sm font-medium text-gray-700">
                                                    Selection Deadline
                                                </Label>
                                                <Input
                                                    id="deadline"
                                                    type="datetime-local"
                                                    value={deadline}
                                                    onChange={(e) => setDeadline(e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Add New Slot */}
                                <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Plus className="h-5 w-5 text-blue-600" />
                                                Add Time Slot
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                                                    Select Date
                                                </Label>
                                                <Input
                                                    id="date"
                                                    type="date"
                                                    value={selectedDate}
                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                                                    Start Time
                                                </Label>
                                                <Select value={startTime} onValueChange={setStartTime}>
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select time" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-60">
                                                        {generateTimeOptions().map((time) => (
                                                            <SelectItem key={time} value={time}>
                                                                {time}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                                                    Duration
                                                </Label>
                                                <Select value={duration} onValueChange={setDuration}>
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select duration" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {durationOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        {validationError && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                <p className="text-sm text-red-800 flex items-center gap-2">
                                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    {validationError}
                                                </p>
                                            </div>
                                        )}
                                        <Button
                                            onClick={addTimeSlot}
                                            disabled={!selectedDate || !startTime || !duration}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Time Slot
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Scheduled Slots */}
                                <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Clock className="h-5 w-5 text-blue-600" />
                                                Scheduled Slots ({slots.length})
                                            </CardTitle>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant={viewMode === "list" ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setViewMode("list")}
                                                    className="h-8"
                                                >
                                                    <List className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant={viewMode === "calendar" ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setViewMode("calendar")}
                                                    className="h-8"
                                                >
                                                    <Grid className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {viewMode === "list" ? (
                                            slots.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                    <p>No time slots scheduled yet.</p>
                                                    <p className="text-sm">Add your first slot using the form above or switch to calendar view.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                                                        <div key={date}>
                                                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                                <Calendar className="h-4 w-4" />
                                                                {formatDate(date)}
                                                            </h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                                                            className={`flex items-center justify-between p-3 rounded-lg border ${hasConflict ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <Clock className={`h-4 w-4 ${hasConflict ? "text-red-600" : "text-blue-600"}`} />
                                                                                <div>
                                                                                    <p className="font-medium text-gray-900 flex items-center gap-2">
                                                                                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                                                        {hasConflict && (
                                                                                            <Badge variant="destructive" className="text-xs">
                                                                                                Conflict
                                                                                            </Badge>
                                                                                        )}
                                                                                    </p>
                                                                                    <p className="text-sm text-gray-600">
                                                                                        Duration:{" "}
                                                                                        {Math.round(
                                                                                            (new Date(slot.end_time).getTime() - new Date(slot.start_time).getTime()) /
                                                                                            60000,
                                                                                        )}{" "}
                                                                                        minutes
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => removeSlot(slot.id)}
                                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                                            )
                                        ) : (
                                            /* Calendar View - Always show calendar regardless of slot count */
                                            <div className="space-y-4">
                                                {/* Empty state message for calendar view */}
                                                {slots.length === 0 && (
                                                    <div className="text-center py-4 text-gray-500 bg-blue-50 rounded-lg border border-blue-200">
                                                        <p className="font-medium text-blue-800">Ready to schedule!</p>
                                                        <p className="text-sm text-blue-600">
                                                            Click on any day below to create your first time slot.
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Calendar Header */}
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => navigateMonth("prev")}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <ChevronLeft className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentMonth(new Date())}
                                                            className="h-8 px-3 text-xs"
                                                        >
                                                            Today
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => navigateMonth("next")}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Calendar Grid */}
                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    {/* Days of week header */}
                                                    <div className="grid grid-cols-7 bg-gray-50">
                                                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                                            <div
                                                                key={day}
                                                                className="p-2 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
                                                            >
                                                                {day}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Calendar days */}
                                                    <div className="grid grid-cols-7">
                                                        {getDaysInMonth(currentMonth).map((date, index) => {
                                                            if (!date) {
                                                                return (
                                                                    <div key={index} className="h-24 border-r border-b border-gray-200 last:border-r-0" />
                                                                )
                                                            }

                                                            const daySlots = getSlotsForDate(date)
                                                            const isCurrentDay = isToday(date)
                                                            const isPast = isPastDate(date)

                                                            return (
                                                                <div
                                                                    key={date.toISOString()}
                                                                    className={`h-24 border-r border-b border-gray-200 last:border-r-0 p-1 cursor-pointer hover:bg-blue-50 transition-colors ${isPast ? "bg-gray-50 cursor-not-allowed" : "bg-white"
                                                                        } ${isCurrentDay ? "bg-blue-50" : ""}`}
                                                                    onClick={() => !isPast && handleDayClick(date)}
                                                                    title={isPast ? "Cannot schedule in the past" : "Click to add time slot"}
                                                                >
                                                                    <div
                                                                        className={`text-sm font-medium mb-1 ${isPast ? "text-gray-400" : isCurrentDay ? "text-blue-600" : "text-gray-900"
                                                                            }`}
                                                                    >
                                                                        {date.getDate()}
                                                                    </div>
                                                                    <div className="space-y-1 overflow-y-auto max-h-16">
                                                                        {daySlots.map((slot) => {
                                                                            const hasConflict = daySlots
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
                                                                                    className={`text-xs p-1 rounded cursor-pointer group relative ${hasConflict
                                                                                        ? "bg-red-100 text-red-800 border border-red-200"
                                                                                        : "bg-blue-100 text-blue-800 border border-blue-200"
                                                                                        } hover:opacity-80 transition-opacity`}
                                                                                    title={`${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    <div className="flex items-center justify-between">
                                                                                        <span className="truncate flex-1">{formatTime(slot.start_time)}</span>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation()
                                                                                                removeSlot(slot.id)
                                                                                            }}
                                                                                            className="opacity-0 group-hover:opacity-100 h-4 w-4 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                                        >
                                                                                            <Trash2 className="h-3 w-3" />
                                                                                        </Button>
                                                                                    </div>
                                                                                    {hasConflict && (
                                                                                        <div className="text-xs text-red-600 font-medium">Conflict</div>
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                    {!isPast && (
                                                                        <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-opacity">
                                                                            <Plus className="h-4 w-4 text-gray-400" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Calendar Legend */}
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
                                                        <span>Today</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                                                        <span>Scheduled Slot</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                                                        <span>Conflict</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
                                                        <span>Past Date</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Plus className="h-3 w-3 text-gray-400" />
                                                        <span>Click day to add slot</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Summary & Actions */}
                            <div className="space-y-6">
                                {/* Summary Card */}
                                <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Users className="h-5 w-5 text-blue-600" />
                                            Schedule Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <p className="text-2xl font-bold text-blue-600">{slots.length}</p>
                                                <p className="text-sm text-gray-600">Total Slots</p>
                                            </div>
                                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                                <p className="text-2xl font-bold text-green-600">{Object.keys(groupedSlots).length}</p>
                                                <p className="text-sm text-gray-600">Days Scheduled</p>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Assigned Candidates</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {candidates.map((candidateId) => (
                                                    <Badge key={candidateId} variant="secondary" className="bg-blue-100 text-blue-800">
                                                        Candidate #{candidateId}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {deadline && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 mb-1 block">Selection Deadline</Label>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(deadline).toLocaleDateString("en-US", {
                                                        weekday: "long",
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Actions */}
                                <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                                    <CardContent className="pt-6">
                                        <Button
                                            onClick={handleSave}
                                            disabled={slots.length === 0}
                                            className="w-full bg-green-600 hover:bg-green-700 mb-3"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Schedule
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full bg-transparent"
                                            onClick={() => {
                                                console.log("Preview API Data:", JSON.stringify(generateAPIData(), null, 2))
                                            }}
                                        >
                                            Preview API Data
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* API Preview */}
                                {slots.length > 0 && (
                                    <Card className="shadow-sm border-0 bg-gray-50/80 backdrop-blur-sm">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-sm font-medium text-gray-700">API Data Preview</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <pre className="text-xs bg-gray-100 p-3 rounded-md overflow-x-auto text-gray-800">
                                                {JSON.stringify(generateAPIData(), null, 2)}
                                            </pre>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Slot Creation Modal */}
                {showSlotModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Add Time Slot</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setShowSlotModal(false)} className="h-8 w-8 p-0">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Selected Date</Label>
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-sm font-medium text-blue-800">{modalDate && formatDate(modalDate)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="modalStartTime" className="text-sm font-medium text-gray-700">
                                                Start Time
                                            </Label>
                                            <Select value={modalStartTime} onValueChange={setModalStartTime}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select time" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60">
                                                    {generateTimeOptions().map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="modalDuration" className="text-sm font-medium text-gray-700">
                                                Duration
                                            </Label>
                                            <Select value={modalDuration} onValueChange={setModalDuration}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Duration" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {durationOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {validationError && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                            <p className="text-sm text-red-800 flex items-center gap-2">
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {validationError}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4">
                                        <Button variant="outline" onClick={() => setShowSlotModal(false)} className="flex-1">
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={addSlotFromModal}
                                            disabled={!modalDate || !modalStartTime || !modalDuration}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Slot
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
