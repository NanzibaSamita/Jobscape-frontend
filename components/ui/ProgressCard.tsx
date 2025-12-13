"use client"
interface ProgressCardProps {
    percentage: number
    children?: React.ReactNode
    fieldColor?: string
    runnerColor?: string
    midCircleColor?: string
    mid?: boolean
}

export default function ProgressCard({
    percentage,
    children,
    fieldColor = "#e5e7eb",
    runnerColor = "#FFC31B",
    midCircleColor = "#EAEAEB",
    mid = true
}: ProgressCardProps) {
    // Ensure percentage is between 0 and 100
    const clampedPercentage = Math.max(0, Math.min(100, percentage))

    // Calculate the stroke-dasharray for the progress circle
    const radius = 45
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference

    return (

        <div className="relative mx-auto mb-6">
            <svg className="transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={fieldColor}
                    strokeWidth="8"
                    fill="transparent"
                    className="opacity-30"
                />
                {mid && <circle
                    cx="50"
                    cy="50"
                    r={radius / 1.4}
                    stroke={midCircleColor}
                    strokeWidth="1"
                    fill="transparent"
                    className="opacity-30"
                />}
                {/* Progress circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={runnerColor}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-in-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    )
}
