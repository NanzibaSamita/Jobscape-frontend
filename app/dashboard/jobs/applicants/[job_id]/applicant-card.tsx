import ScoreBadge from "./score-badge"
import ActionButtons from "./action-buttons"
import { Applicant } from "./page"

interface ApplicantCardProps {
    applicant: Applicant
    onAction: (id: number, action: "view" | "reject" | "shortlist") => void
    job_id: string,
    changeStatus: (status: number, id: number | string) => void
}
export const maskName = (name: string) => {
    if (!name) return "N/A"
    const parts = name.split(" ")
    return parts
        .map((part) => {
            if (part.length <= 2) return part
            return `${part[0]}${"•".repeat(part.length - 2)}${part[part.length - 1]}`
        })
        .join(" ")
}

export const maskEmail = (email: string) => {
    const [username, domain] = email.split("@")
    const maskedUsername =
        username.length > 2
            ? `${username[0]}${"•".repeat(username.length - 2)}${username[username.length - 1]}`
            : username
    return `${maskedUsername}@${domain}`
}
export default function ApplicantCard({ applicant, onAction, job_id, changeStatus }: ApplicantCardProps) {
    // Mask the name to show only first letter and last letter with dots

    const isProcessed = applicant.status !== "pending"

    return (
        <div
            className={`bg-card border border-border rounded-lg md:p-6 p-2 shadow-sm hover:shadow-md transition-shadow ${isProcessed ? "opacity-75" : ""
                }`}
        >
            <div className="flex flex-wrap items-start justify-between">
                {/* Left side - Applicant info */}
                <div className="flex-1 shrink-0">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-muted-foreground">
                                {applicant.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-card-foreground">{applicant.status === "shortlisted" ? applicant.name : maskName(applicant.name)}</h3>
                            <p className="text-sm text-muted-foreground">
                                {applicant.experience && `• ${applicant.experience} experience`}
                            </p>
                        </div>
                    </div>

                    {/* Hidden contact info placeholder */}
                    <div className="space-y-1 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Email:</span>
                            {applicant.status === "shortlisted" ? <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{applicant.email ?? 'N/A'}</span> : <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Hidden until shortlisted</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Phone:</span>
                            {applicant.status === "shortlisted" ? <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{applicant.phone ?? 'N/A'}</span> : <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Hidden until shortlisted</span>}
                        </div>
                    </div>

                    {/* Status indicator for processed applications */}
                    {isProcessed && (
                        <div className="mb-4">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${applicant.status === "shortlisted" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}
                            >
                                {applicant.status === "shortlisted" ? "Shortlisted" : "Rejected"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Right side - Score and actions */}
                <div className="flex lg:flex-nowrap flex-wrap lg:flex-col xs:flex-col xs:items-start flex-row lg:items-end items-center lg:justify-start justify-between gap-4">
                    <ScoreBadge score={applicant.score} cv_score={applicant.cv_score} />
                    <ActionButtons
                        applicantId={applicant.id}
                        onAction={onAction}
                        disabled={isProcessed}
                        status={applicant.status}
                        job_id={job_id}
                        changeProcessed={changeStatus}
                    />
                </div>
            </div>
        </div>
    )
}
