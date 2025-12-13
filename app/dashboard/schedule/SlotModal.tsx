"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface SlotModalProps {
    isOpen: boolean
    modalDate: string
    modalStartTime: string
    modalDuration: string
    validationError: string
    onClose: () => void
    onStartTimeChange: (time: string) => void
    onDurationChange: (duration: string) => void
    onAddSlot: () => void
    formatDate: (dateString: string) => string
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

export function SlotModal({
    isOpen,
    modalDate,
    modalStartTime,
    modalDuration,
    validationError,
    onClose,
    onStartTimeChange,
    onDurationChange,
    onAddSlot,
    formatDate,
    generateTimeOptions,
}: SlotModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-dashboard-foreground rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Add Time Slot</h3>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground mb-2 block">Selected Date</Label>
                            <div className="p-3 bg-primary/20 rounded-lg border border-primary/30">
                                <p className="text-sm font-medium text-muted-foreground">{modalDate && formatDate(modalDate)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="modalStartTime" className="text-sm font-medium text-muted-foreground">
                                    Start Time
                                </Label>
                                <Select value={modalStartTime} onValueChange={onStartTimeChange}>
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
                                <Label htmlFor="modalDuration" className="text-sm font-medium text-muted-foreground">
                                    Duration
                                </Label>
                                <Select value={modalDuration} onValueChange={onDurationChange}>
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
                            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                                Cancel
                            </Button>
                            <Button
                                onClick={onAddSlot}
                                disabled={!modalDate || !modalStartTime || !modalDuration}
                                className="flex-1 bg-primary/50 hover:bg-primary/70 dark:bg-primary hover:dark:bg-primary/80"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Slot
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
