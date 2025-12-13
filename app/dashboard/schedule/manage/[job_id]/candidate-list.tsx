import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone } from "lucide-react"
import { Candidate } from "./slot-schedule-page"

interface CandidateListProps {
    candidates: Candidate[]
}

export default function CandidateList({ candidates }: CandidateListProps) {
    // Mask candidate information
    const maskName = (name: string) => {
        const parts = name.split(" ")
        return parts
            .map((part) => {
                if (part.length <= 2) return part
                return `${part[0]}${"•".repeat(part.length - 2)}${part[part.length - 1]}`
            })
            .join(" ")
    }

    const maskEmail = (email: string) => {
        const [username, domain] = email.split("@")
        const maskedUsername =
            username.length > 2
                ? `${username[0]}${"•".repeat(username.length - 2)}${username[username.length - 1]}`
                : username
        return `${maskedUsername}@${domain}`
    }

    const maskPhone = (phone: string) => {
        if (phone.length <= 4) return phone
        return `${phone.slice(0, 2)}${"•".repeat(phone.length - 4)}${phone.slice(-2)}`
    }

    return (
        <Card className="h-fit">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <User className="w-5 h-5" />
                    Available Candidates ({candidates.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {candidates.map((candidate) => (
                    <div key={candidate.id} className="p-3 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {candidate.full_name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-card-foreground text-sm truncate hidden">{maskName(candidate.full_name)}</h4>
                                    <h4 className="font-medium text-card-foreground text-sm truncate">{candidate.full_name}</h4>
                                </div>
                            </div>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                                {candidate.candidate_id}
                            </Badge>
                        </div>

                        <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate hidden">{maskEmail(candidate.email ?? "")}</span>
                                <span className="truncate">{candidate.email ?? ""}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 flex-shrink-0" />
                                <span className="hidden">{maskPhone(candidate.user_mobile ?? "")}</span>
                                <span>{candidate.user_mobile ?? ""}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {candidates.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">No available candidates</div>
                )}
            </CardContent>
        </Card>
    )
}
