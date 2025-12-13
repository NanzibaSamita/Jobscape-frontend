import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, MapPin } from 'lucide-react'
import React from 'react'

type JobHeaderProps = {
    title: string
    companyName: string
    location: string
    sector: string
    job_id: string
    status_text: string
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "offered":
            return "bg-green-100 text-green-800 border-green-200"
        case "applied":
            return "bg-blue-100 text-blue-800 border-blue-200"
        case "sceening test submitted":
            return "bg-yellow-100 text-yellow-800 border-yellow-200"
        default:
            return "bg-gray-100 text-gray-800 border-gray-200"
    }
}
export default function JobHeader({
    title,
    companyName,
    location,
    sector: sector_name,
    status_text,
    job_id
}: JobHeaderProps) {
    return (
        <Card className="">
            <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {companyName}
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {location}
                            </div>
                            <Badge variant="secondary">{sector_name}</Badge>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Badge className={`${getStatusColor(status_text)} px-3 py-1`}>{status_text}</Badge>
                        <div className="text-sm text-muted-foreground">Job ID: #{job_id}</div>
                    </div>
                </div>
            </CardHeader>
        </Card>
    )
}
