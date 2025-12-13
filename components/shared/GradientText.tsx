import { cn } from "@/lib/utils"

interface GradientTextProps {
    text: string
    gradientClass?: string
    className?: string
}

export function GradientText({ text, gradientClass = '', className }: GradientTextProps) {
    return <span className={cn("bg-clip-text text-transparent bg-gradient-to-r", gradientClass, className)}>{text}</span>
}