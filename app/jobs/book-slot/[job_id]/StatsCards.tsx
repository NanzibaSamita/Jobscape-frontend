import { Calendar, Clock, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { OpenSlot } from "./page"

interface StatsCardsProps {
    slots: OpenSlot[]
}

export function StatsCards({ slots }: StatsCardsProps) {
    // Group slots by date
    const uniqueDates = new Set(slots.map((slot) => slot.start_time.split(" ")[0]))
    const availableSlots = slots.filter((slot) => !slot.is_booked)
    const bookedSlots = slots.filter((slot) => slot.is_booked)

    return (
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border border-yellow-200 bg-dashboard-foreground">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-yellow-500 rounded-full">
                            <Calendar className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{uniqueDates.size}</p>
                            <p className="text-sm font-medium text-muted-foreground">Available Days</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-green-200 bg-dashboard-foreground">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-500 rounded-full">
                            <Clock className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{availableSlots.length}</p>
                            <p className="text-sm font-medium text-muted-foreground">Open Slots</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-orange-200 bg-dashboard-foreground">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-orange-500 rounded-full">
                            <Users className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold ">{bookedSlots.length}</p>
                            <p className="text-sm font-medium text-muted-foreground">Booked Slots</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
