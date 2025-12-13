"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase } from "lucide-react"
import type { JobSuggestion } from "./types"
import { JobSuggestionCard } from "./job-suggestion-card"

interface JobSuggestionsSectionProps {
    suggestions: JobSuggestion[]
}

export function JobSuggestionsSection({ suggestions }: JobSuggestionsSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    New Job Suggestions
                    {suggestions.length > 0 && (
                        <Badge variant="default" className="ml-2">
                            {suggestions.length}
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>Review and respond to job opportunities suggested by HR teams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {suggestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 " />
                        <p>No pending job suggestions</p>
                        <p className="text-sm">Check back later for new opportunities</p>
                    </div>
                ) : (
                    suggestions.map((suggestion) => (
                        <JobSuggestionCard key={suggestion.id} suggestion={suggestion} />
                    ))
                )}
            </CardContent>
        </Card>
    )
}
