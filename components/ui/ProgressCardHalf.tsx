"use client"
interface ProgressCardProps {
    completionPercentage?: number,
    children?: React.ReactNode
}

export default function ProgressCardHalf({
    completionPercentage = 60,
    children = null
}: ProgressCardProps) {

    return (
        <div className="relative w-full h-full mx-auto">
            <svg className="w-full h-full" viewBox="0 0 200 100">
                {/* Background half circle */}
                <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                />
                {/* Progress half circle */}
                <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    stroke="#f59e0b"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (completionPercentage / 100) * 251.2}
                    className="transition-all duration-500 ease-in-out"
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
                {children}
            </div>
        </div>
    )
}
