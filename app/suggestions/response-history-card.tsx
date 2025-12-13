import { Badge } from "@/components/ui/badge"
import { StatusIcon } from "./status-icon"
import type { JobSuggestion } from "./types"

interface ResponseHistoryCardProps {
    suggestion: JobSuggestion
}

export function ResponseHistoryCard({ suggestion }: ResponseHistoryCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "accepted":
                return "bg-green-100 text-green-800"
            case "rejected":
                return "bg-red-100 text-red-800"
            default:
                return "bg-yellow-100 text-yellow-800"
        }
    }

    return (
        <div className="p-4 border rounded-lg">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h3 className="font-semibold">{suggestion.jobTitle}</h3>
                    <p className="text-sm">{suggestion.company}</p>
                    <p className="text-sm text-muted-foreground">Received: {suggestion.receivedDate}</p>
                </div>
                <div className="flex items-center gap-2">
                    <StatusIcon status={suggestion.status} />
                    <Badge className={getStatusColor(suggestion.status)}>{suggestion.status}</Badge>
                </div>
            </div>
            <p className="text-sm text-muted-foreground/80">{suggestion.description.substring(0, 100)}...</p>
        </div>
    )
}
