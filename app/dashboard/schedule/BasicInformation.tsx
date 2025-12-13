"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarDays } from "lucide-react"

interface BasicInformationProps {
    jobPostId: string
    deadline: string
    onDeadlineChange: (deadline: string) => void
}

export function BasicInformation({ jobPostId, deadline, onDeadlineChange }: BasicInformationProps) {
    return (
        <Card className="border backdrop-blur-sm">
            <CardHeader className="sm:p-4 p-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    Basic Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:p-4 p-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="jobPostId" className="text-sm font-medium text-muted-foreground">
                            Job Post ID
                        </Label>
                        <Input
                            id="jobPostId"
                            type="number"
                            disabled
                            value={jobPostId}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="deadline" className="text-sm font-medium text-muted-foreground">
                            Selection Deadline
                        </Label>
                        <Input
                            id="deadline"
                            type="datetime-local"
                            value={deadline}
                            onChange={(e) => onDeadlineChange(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
