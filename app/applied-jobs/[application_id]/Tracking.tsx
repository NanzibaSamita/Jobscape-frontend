import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import React from 'react'
import { TimelineEvent } from './page'
import { formatDate } from './JobDetailsCard'

export default function Tracking({
    flowData,
}: {
    flowData: TimelineEvent[]
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    Application Timeline
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-6">
                    {flowData.reverse().map((step, index) => {
                        const isLatest = index === flowData.length - 1

                        return (
                            <div key={index} className="flex gap-4">
                                {/* Simple dot */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-4 h-4 rounded-full ${isLatest ? "bg-green-500" : "dark:bg-muted-foreground bg-primary"}`} />
                                    {index < flowData.length - 1 && <div className="w-px h-8 bg-gray-200 mt-2" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-2 rounded-lg border">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-medium ">{step.text}</h3>
                                        {isLatest && <Badge className="bg-green-100 text-green-700 text-xs">Current</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{formatDate(step.date)}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
