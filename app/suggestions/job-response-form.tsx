"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle } from "lucide-react"

interface JobResponseFormProps {
    responseMessage: string
    setResponseMessage: (message: string) => void
    onSubmit: (status: "accepted" | "rejected") => void
}

export function JobResponseForm({ responseMessage, setResponseMessage, onSubmit }: JobResponseFormProps) {
    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="response-message">Response Message (Optional)</Label>
                <Textarea
                    id="response-message"
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Add a personal message with your response..."
                    rows={3}
                />
            </div>

            <div className="flex gap-3">
                <Button onClick={() => onSubmit("accepted")} className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Opportunity
                </Button>
                <Button variant="outline" onClick={() => onSubmit("rejected")} className="flex-1">
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                </Button>
            </div>
        </div>
    )
}
