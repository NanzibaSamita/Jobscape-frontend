"use client"

import { Button } from "@/components/ui/button"
import { useUI } from "@/contexts/ui-context"
import { Eye, X, Star } from "lucide-react"
import ApplicantModal from "../ApplicantModal"

interface ActionButtonsProps {
    applicantId: number
    onAction: (id: number, action: "view" | "reject" | "shortlist") => void
    disabled: boolean
    status?: string
    job_id: string
    changeProcessed: (status: number, id: number | string) => void
}

export default function ActionButtons({ applicantId, onAction, disabled = false, status, job_id, changeProcessed }: ActionButtonsProps) {
    const { openModal } = useUI();

    if (disabled && status !== "pending") {
        return (
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal("view-cv", <ApplicantModal
                        processed={disabled}
                        applicantId={String(applicantId)}
                        job_id={job_id}
                        changeProcessed={changeProcessed}
                    />)}
                    className="flex items-center gap-1 hover:bg-muted"
                >
                    <Eye className="w-4 h-4" />
                    View
                </Button>
            </div>
        )
    }

    return (
        <div className="flex md:flex-nowrap flex-wrap gap-2">

            <Button
                variant="outline"
                size="sm"
                onClick={() => openModal("view-cv", <ApplicantModal
                    processed={disabled}
                    applicantId={String(applicantId)}
                    job_id={job_id}
                    changeProcessed={changeProcessed}
                />)}
                className="flex items-center gap-1 hover:bg-muted"
            >
                <Eye className="w-4 h-4" />
                View
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={() => onAction(applicantId, "reject")}
                className="flex items-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
                <X className="w-4 h-4" />
                Reject
            </Button>

            <Button
                variant="default"
                size="sm"
                onClick={() => onAction(applicantId, "shortlist")}
                className="flex items-center gap-1"
            >
                <Star className="w-4 h-4" />
                Shortlist
            </Button>
        </div>
    )
}
