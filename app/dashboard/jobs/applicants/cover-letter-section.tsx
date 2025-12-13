import { sanitizeHtml } from "@/lib/utils"

interface CoverLetterSectionProps {
    coverLetter: string
}

export default function CoverLetterSection({ coverLetter }: CoverLetterSectionProps) {
    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Cover Letter</h2>

            <div className="bg-muted/30 border border-border rounded-lg p-8">
                <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
                    <div className="prose prose-gray max-w-none">
                        <div className="whitespace-pre-line text-card-foreground text-xs leading-5" dangerouslySetInnerHTML={{ __html: sanitizeHtml(coverLetter) }} />
                    </div>
                </div>
            </div>
        </div>
    )
}
