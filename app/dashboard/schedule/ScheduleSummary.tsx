import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Save, Users } from "lucide-react"
import { TimeSlot } from "./types"
import { Button } from "@/components/ui/button"

interface ScheduleSummaryProps {
    slots: TimeSlot[]
    candidates: string[]
    deadline: string
    onSave: () => void
}

export function ScheduleSummary({ slots, candidates, deadline, onSave }: ScheduleSummaryProps) {
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

    const groupedSlots = groupSlotsByDate()

    return (
        <Card className="shadow-sm backdrop-blur-sm">
            <CardHeader className="p-2 sm:p-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    Schedule Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-2 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-primary/20 rounded-lg">
                        <p className="text-2xl font-bold text-muted-foreground">{slots.length}</p>
                        <p className="text-sm text-muted-foreground">Total Slots</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-primary/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{Object.keys(groupedSlots).length}</p>
                        <p className="text-sm text-muted-foreground">Days Scheduled</p>
                    </div>
                </div>

                <Separator />

                <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">Assigned Candidates</Label>
                    <div className="flex flex-wrap gap-2">
                        {candidates.map((candidateId) => (
                            <Badge key={candidateId} variant="secondary" className="bg-primary/40 text-muted-foreground">
                                Candidate #{candidateId}
                            </Badge>
                        ))}
                    </div>
                </div>

                {deadline && (
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-1 block">Selection Deadline</Label>
                        <p className="text-sm text-muted-foreground">
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
            <CardFooter className="p-2 sm:p-4">
                <Button
                    onClick={onSave}
                    disabled={slots.length === 0 || !deadline}
                    className="w-full bg-green-600 hover:bg-green-700 text-white dark:text-muted-foreground"
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save Schedule
                </Button>
            </CardFooter>
        </Card>
    )
}
