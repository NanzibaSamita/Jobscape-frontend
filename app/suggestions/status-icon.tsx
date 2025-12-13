import { CheckCircle, XCircle, Clock } from "lucide-react"

interface StatusIconProps {
    status: string
}

export function StatusIcon({ status }: StatusIconProps) {
    switch (status) {
        case "accepted":
            return <CheckCircle className="w-4 h-4 text-green-500" />
        case "rejected":
            return <XCircle className="w-4 h-4 text-red-500" />
        default:
            return <Clock className="w-4 h-4 text-yellow-500" />
    }
}
