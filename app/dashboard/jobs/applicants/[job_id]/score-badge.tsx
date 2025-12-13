interface ScoreBadgeProps {
    score: number;
    cv_score: number; // Assuming cv_score is also a number
}

export default function ScoreBadge({ score, cv_score }: ScoreBadgeProps) {
    const getStyle = (score: number) => {
        if (score >= 90) return "bg-green-50 text-green-700 ring-1 ring-green-200";
        if (score >= 80) return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
        if (score >= 70) return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200";
        return "bg-red-50 text-red-700 ring-1 ring-red-200";
    };

    const getLabel = (score: number) => {
        if (score >= 90) return "Excellent";
        if (score >= 80) return "Good";
        if (score >= 70) return "Fair";
        return "Poor";
    };

    return (
        <div className="flex flex-col items-end space-y-2 w-full">
            <div
                className={`inline-flex flex-col items-center justify-center px-4 py-2 rounded-full ${getStyle(
                    score
                )}`}
            >
                <span className="text-xs font-medium">{getLabel(score)}</span>
            </div>
            <div className="text-right text-base md:block flex justify-end items-center gap-4">
                <p className="md:text-xl text-muted-foreground">
                    Score: <span className="font-semibold">{score}</span>
                </p>
                <p className="md:text-xl text-muted-foreground">
                    CV Score: <span className="font-semibold">{cv_score}</span>
                </p>
            </div>
        </div>
    );
}