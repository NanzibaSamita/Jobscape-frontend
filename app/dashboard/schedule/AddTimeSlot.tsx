"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface AddTimeSlotProps {
    selectedDate: string
    startTime: string
    duration: string
    validationError: string
    onDateChange: (date: string) => void
    onStartTimeChange: (time: string) => void
    onDurationChange: (duration: string) => void
    onAddSlot: () => void
    generateTimeOptions: () => { value: string; label: string }[]
}

const durationOptions = [
    { value: "30", label: "30 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1 hour 30 minutes" },
    { value: "120", label: "2 hours" },
    { value: "150", label: "2 hours 30 minutes" },
    { value: "180", label: "3 hours" },
]

export function AddTimeSlot({
    selectedDate,
    startTime,
    duration,
    validationError,
    onDateChange,
    onStartTimeChange,
    onDurationChange,
    onAddSlot,
    generateTimeOptions,
}: AddTimeSlotProps) {
    return (
        <Card className="border backdrop-blur-sm">
            <CardHeader className="sm:p-4 p-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Plus className="h-5 w-5 text-muted-foreground" />
                        Add Time Slot
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:p-4 p-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="date" className="text-sm font-medium text-muted-foreground">
                            Select Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="startTime" className="text-sm font-medium text-muted-foreground">
                            Start Time
                        </Label>
                        <Select value={startTime} onValueChange={onStartTimeChange}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {generateTimeOptions().map((time) => (
                                    <SelectItem key={time.value} value={time.value}>
                                        {time.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="duration" className="text-sm font-medium text-muted-foreground">
                            Duration
                        </Label>
                        <Select value={duration} onValueChange={onDurationChange}>
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
                    onClick={onAddSlot}
                    disabled={!selectedDate || !startTime || !duration}
                    className="w-full bg-primary hover:bg-primary/50"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time Slot
                </Button>
            </CardContent>
        </Card>
    )
}
