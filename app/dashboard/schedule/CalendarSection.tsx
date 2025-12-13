"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { CalendarView } from "./CalendarView"

interface CalendarSectionProps {
    currentMonth: Date
    onNavigateMonth: (direction: "prev" | "next") => void
    onTodayClick: () => void
    onDayClick: (date: Date) => void
}

export function CalendarSection({ currentMonth, onNavigateMonth, onTodayClick, onDayClick }: CalendarSectionProps) {
    return (
        <Card className="border backdrop-blur-sm">
            <CardHeader className="sm:p-4 p-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    Calendar
                </CardTitle>
                <p className="text-sm text-muted-foreground">Click on any day to create a time slot</p>
            </CardHeader>
            <CardContent className="sm:p-4 p-2">
                <CalendarView
                    currentMonth={currentMonth}
                    onNavigateMonth={onNavigateMonth}
                    onTodayClick={onTodayClick}
                    onDayClick={onDayClick}
                />
            </CardContent>
        </Card>
    )
}
