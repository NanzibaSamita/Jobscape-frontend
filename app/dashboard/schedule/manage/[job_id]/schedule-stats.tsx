import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Users, CheckCircle, AlertCircle } from "lucide-react"

interface ScheduleStatsProps {
    totalSlots: number
    bookedSlots: number
    availableSlots: number
    overdueSlots: number
    totalCandidates: number
    totalInterviewDays: number
}

export default function ScheduleStats({
    totalSlots,
    bookedSlots,
    availableSlots,
    overdueSlots,
    totalCandidates,
    totalInterviewDays,
}: ScheduleStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            <Card>
                <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total Slots</p>
                            <p className="text-lg md:text-2xl font-bold text-card-foreground">{totalSlots}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Booked</p>
                            <p className="text-lg md:text-2xl font-bold text-card-foreground">{bookedSlots}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
                            <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Available</p>
                            <p className="text-lg md:text-2xl font-bold text-card-foreground">{availableSlots}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-red-100 rounded-lg">
                            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Overdue</p>
                            <p className="text-lg md:text-2xl font-bold text-card-foreground">{overdueSlots}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg">
                            <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Candidates</p>
                            <p className="text-lg md:text-2xl font-bold text-card-foreground">{totalCandidates}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-indigo-100 rounded-lg">
                            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Interview Days</p>
                            <p className="text-lg md:text-2xl font-bold text-card-foreground">{totalInterviewDays}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
