import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { ResponseHistoryCard } from "./response-history-card"
import type { JobSuggestion } from "./types"

interface ResponseHistorySectionProps {
    suggestions: JobSuggestion[]
}

export function ResponseHistorySection({ suggestions }: ResponseHistorySectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Response History
                </CardTitle>
                <CardDescription>Track your responses to previous job suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {suggestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/80" />
                        <p>No responses yet</p>
                        <p className="text-sm">Your responses will appear here</p>
                    </div>
                ) : (
                    suggestions.map((suggestion) => <ResponseHistoryCard key={suggestion.id} suggestion={suggestion} />)
                )}
            </CardContent>
        </Card>
    )
}
