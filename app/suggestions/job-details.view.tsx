import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { JobSuggestion } from "./types"

interface JobDetailsViewProps {
    suggestion: JobSuggestion
}

export function JobDetailsView({ suggestion }: JobDetailsViewProps) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-xl font-semibold">{suggestion.jobTitle}</h3>
                <p className="text-gray-600">{suggestion.company}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>{suggestion.location}</span>
                    <span>{suggestion.salary}</span>
                </div>
            </div>

            <div>
                <h4 className="font-medium mb-2">Job Description</h4>
                <p className="text-sm text-gray-600">{suggestion.description}</p>
            </div>

            <div>
                <h4 className="font-medium mb-2">Requirements</h4>
                <div className="flex flex-wrap gap-1">
                    {suggestion.requirements.map((req) => (
                        <Badge key={req} variant="secondary">
                            {req}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Avatar className="w-8 h-8">
                    <AvatarImage src={suggestion.hrContact.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                        {suggestion.hrContact.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium">{suggestion.hrContact.name}</p>
                    <p className="text-xs text-gray-500">{suggestion.hrContact.email}</p>
                </div>
            </div>
        </div>
    )
}
