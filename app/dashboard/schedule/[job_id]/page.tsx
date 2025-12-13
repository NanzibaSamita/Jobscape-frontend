"use client"

import { useEffect, useState } from "react"
import { ScheduleData, TimeSlot } from "../types"
import { BasicInformation } from "../BasicInformation"
import { AddTimeSlot } from "../AddTimeSlot"
import { CalendarSection } from "../CalendarSection"
import { CreatedSlots } from "../CreatedSlots"
import { ScheduleSummary } from "../ScheduleSummary"
import { SlotModal } from "../SlotModal"
import { DashboardLayout } from "@/components/layouts/DashboardLayout"
import { useParams, useRouter } from "next/navigation"
import { AxiosError } from "axios"
import { api } from "@/lib/axios/axios"
import { toast } from "react-toastify"

const GET_CANDIDATES = "/api/v1/short-listed-candidates";
const POST_SCHEDULE = "/api/v1/allocate-interview-slot";
const GET_CURRENT_SLOTS = "/api/v1/availabe-slots";
const UPDATE_SCHEDULE = "/api/v1/interview-slot-update";
export default function SchedulePage() {
    const { job_id } = useParams<{ job_id: string }>();
    const [selectedDate, setSelectedDate] = useState("")
    const [startTime, setStartTime] = useState("")
    const [duration, setDuration] = useState("")
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [deadline, setDeadline] = useState("")
    const [candidates, setCandidates] = useState<string[]>([])
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [update, setUpdate] = useState(false);
    const [showSlotModal, setShowSlotModal] = useState(false)
    const [modalDate, setModalDate] = useState("")
    const [modalStartTime, setModalStartTime] = useState("")
    const [modalDuration, setModalDuration] = useState("")

    const [validationError, setValidationError] = useState("")

    const router = useRouter();

    // Helper function to convert 24-hour time to 12-hour format
    const formatTimeTo12Hour = (time24: string): string => {
        const [hours, minutes] = time24.split(":").map(Number)
        const period = hours >= 12 ? "PM" : "AM"
        const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
        return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`
    }
    const generateTimeOptions = (): { value: string; label: string }[] => {
        const times = []
        // Generate all time options from 00:00 to 23:30
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
                const label = formatTimeTo12Hour(timeString)
                times.push({ value: timeString, label })
            }
        }
        return times
    }

    const validateTimeSlot = (date: string, startTime: string, duration: string): string | null => {
        const startDateTime = new Date(`${date}T${startTime}:00`)
        const endDateTime = new Date(startDateTime.getTime() + Number.parseInt(duration) * 60000)

        // Check for overlapping slots
        const hasOverlappingSlots = (newSlot: { start_time: string; end_time: string; date: string }): boolean => {
            const existingSlotsForDate = slots.filter((slot) => slot.date === newSlot.date)
            const newStart = new Date(newSlot.start_time).getTime()
            const newEnd = new Date(newSlot.end_time).getTime()

            return existingSlotsForDate.some((existingSlot) => {
                const existingStart = new Date(existingSlot.start_time).getTime()
                const existingEnd = new Date(existingSlot.end_time).getTime()
                return newStart < existingEnd && newEnd > existingStart
            })
        }

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

    const addTimeSlot = () => {
        if (!selectedDate || !startTime || !duration) return

        setValidationError("")
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

    const addSlotFromModal = () => {
        if (!modalDate || !modalStartTime || !modalDuration) return

        setValidationError("")
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

    const generateAPIData = (): ScheduleData => {
        return {
            job_post_id: job_id,
            slot_selection_deadline: deadline ? `${deadline.replace("T", " ")}` : "",
            slots: slots.map((slot) => ({
                start_time: slot.start_time,
                end_time: slot.end_time,
            } as TimeSlot)),
            candidates: candidates,
        }
    }

    const handleSave = () => {
        const apiData = generateAPIData();
        const API = update ? UPDATE_SCHEDULE : POST_SCHEDULE;

        const request = update ? api.put(API, apiData) : api.post(API, apiData);
        request.then((response) => {
            if (response.status === 200) {
                console.log("Schedule saved successfully:", response.data);
                toast.success("Schedule saved successfully!");
                router.push("/dashboard/jobs");
                // Optionally reset state or show success message
            } else {
                console.error("Failed to save schedule:", response.data);
                toast.warn("Failed to save schedule. Please try again.")
            }
        }
        )
            .catch((err: AxiosError) => {
                const errorMessage =
                    (err.response?.data && typeof err.response.data === "object" && "message" in err.response.data
                        ? (err.response.data as { message?: string }).message
                        : undefined) || err.message;
                console.log(errorMessage);
                toast.error(errorMessage);
            }
            )
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

    const handleDayClick = (date: Date) => {
        // Fix timezone issue by using local date components
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const day = date.getDate().toString().padStart(2, "0")
        const dateString = `${year}-${month}-${day}`

        setModalDate(dateString)
        setModalStartTime("")
        setModalDuration("")
        setValidationError("")
        setShowSlotModal(true)
    }

    const getCandidates = async () => {
        api.get(`${GET_CANDIDATES}/${job_id}`)
            .then((response) => {
                const { data } = response.data
                if (data) {
                    setCandidates(data.map((item: { candidate_id: string | number } | number | string) => (typeof item === "string" || typeof item === "number") ? String(item) : (typeof data === "object" && !Array.isArray(item) ? item?.candidate_id : "")))
                } else {
                    console.error("Invalid candidates data format:", data)
                }
            }
            )
            .catch((err: AxiosError) => {
                console.error("Error fetching candidates:", err.message)
            }
            )
    };

    const getCurrentSlots = async () => {
        api.get(`${GET_CURRENT_SLOTS}/${job_id}`)
            .then((response) => {
                const { data } = response.data
                const [scheduleDeadline, scheduleSlots] = data;
                if (data) {
                    if (scheduleDeadline) setUpdate(true);
                    setDeadline(scheduleDeadline || "");
                    console.log(data)
                    setSlots(scheduleSlots.map((slot: { start_time: string; end_time: string; date: string, id: number | string }) => ({
                        id: String(slot.id),
                        start_time: slot.start_time,
                        end_time: slot.end_time,
                        date: slot.start_time,
                    })))
                } else {
                    console.error("Invalid slots data format:", data)
                }
            }
            )
            .catch((err: AxiosError) => {
                console.error("Error fetching current slots:", err.message)
            }
            )
    }

    useEffect(() => {
        if (job_id) {
            getCandidates()
            getCurrentSlots()
        } else {
            console.error("Job ID is not available")
        }
    }, [job_id]);

    console.log("Current Month:", slots)

    return (
        <DashboardLayout>
            <div className="w-full relative h-full overflow-y-auto">
                <div className="mx-auto">
                    <div className="mx-auto">
                        {/* Header */}
                        <div className="mb-6 sm:mb-8 text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Schedule Management</h1>
                            <p className="text-muted-foreground text-sm sm:text-base">Create and manage interview time slots for candidates.</p>
                        </div>

                        {/* Responsive Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                            {/* Forms and Calendar - Takes full width on mobile, half on lg, half on xl */}
                            <div className="lg:col-span-1 xl:col-span-2 space-y-4 sm:space-y-6">
                                <BasicInformation
                                    jobPostId={job_id}
                                    deadline={deadline}
                                    onDeadlineChange={setDeadline}
                                />

                                <CalendarSection
                                    currentMonth={currentMonth}
                                    onNavigateMonth={navigateMonth}
                                    onTodayClick={() => setCurrentMonth(new Date())}
                                    onDayClick={handleDayClick}
                                />

                                <AddTimeSlot
                                    selectedDate={selectedDate}
                                    startTime={startTime}
                                    duration={duration}
                                    validationError={validationError}
                                    onDateChange={setSelectedDate}
                                    onStartTimeChange={setStartTime}
                                    onDurationChange={setDuration}
                                    onAddSlot={addTimeSlot}
                                    generateTimeOptions={generateTimeOptions}
                                />
                            </div>

                            <div className="lg:col-span-1 xl:col-span-2 space-y-4 sm:space-y-6">
                                {/* Summary & Actions - Full width on mobile, full on lg, quarter on xl */}
                                <div className="sm:space-y-6">
                                    <ScheduleSummary slots={slots} candidates={candidates} deadline={deadline} onSave={handleSave} />
                                </div>

                                {/* Created Slots - Full width on mobile, half on lg, quarter on xl */}
                                <div className="sm:space-y-6">
                                    <CreatedSlots slots={slots} onRemoveSlot={removeSlot} formatTime={formatTime} formatDate={formatDate} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SlotModal
                    isOpen={showSlotModal}
                    modalDate={modalDate}
                    modalStartTime={modalStartTime}
                    modalDuration={modalDuration}
                    validationError={validationError}
                    onClose={() => setShowSlotModal(false)}
                    onStartTimeChange={setModalStartTime}
                    onDurationChange={setModalDuration}
                    onAddSlot={addSlotFromModal}
                    formatDate={formatDate}
                    generateTimeOptions={generateTimeOptions}
                />
            </div>
        </DashboardLayout>
    )
}
