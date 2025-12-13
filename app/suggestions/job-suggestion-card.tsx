"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { JobSuggestion } from "./types"
import { useRouter } from "next/navigation"

interface JobSuggestionCardProps {
    suggestion: JobSuggestion
}


export function JobSuggestionCard({ suggestion }: JobSuggestionCardProps) {
    const router = useRouter();
    return (
        <div className="p-4 border rounded-lg hover:bg-primary/5 cursor-pointer" >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-lg">{suggestion.jobTitle}</h3>
                    <p className="text-muted-foreground">{suggestion.company}</p>
                    <p className="text-sm text-muted-foreground">{suggestion.location}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">{suggestion.salary}</Badge>
            </div>

            <p className="text-sm  mb-3 line-clamp-2">{suggestion.description}</p>

            <div className="flex flex-wrap gap-1 mb-3">
                {suggestion.requirements.map((req) => (
                    <Badge key={req} variant="secondary" className="text-xs">
                        {req}
                    </Badge>
                ))}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                        <AvatarImage src={suggestion.hrContact.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                            {suggestion.hrContact.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{suggestion.hrContact.name}</span>
                </div>
                <Button onClick={() => router.push(`/jobs/${suggestion.id}`)} size="sm">View Details</Button>
            </div>
        </div>
    )
}
