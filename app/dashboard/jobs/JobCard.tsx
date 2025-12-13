"use client"

import { MapPin, Calendar, DollarSign, Users, Edit, ReceiptText, CalendarCheck, FileUser } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface JobCardProps {
    job: {
        id: string
        title: string
        company: string
        department: string
        location: string
        employmentType: string
        salaryRange: string
        applicants: number
        postedDate: string
        status: "active" | "draft" | "closed"
        applications: number
        deadline: string
        expired: boolean; // New field to indicate if the job is expired
    }
}

export function JobCard({ job }: JobCardProps) {
    const router = useRouter()

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">
                            {job.company} • {job.department}
                        </p>
                    </div>
                    {job.expired ? <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-dashboard-foreground text-red-700 rounded-md text-xs font-medium">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        Expired
                    </div> : job.status === "active" ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-dashboard-foreground text-green-700 rounded-md text-xs font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            Published
                        </div>
                    ) : job.status === "draft" ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-dashboard-foreground text-red-700 rounded-md text-xs font-medium">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            Drafted
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-dashboard-foreground text-yellow-500 rounded-md text-xs font-medium">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            Archived
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{job.employmentType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salaryRange}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{job.applications} applications</span>
                    </div>
                </div>

                <div className="text-xs text-gray-500 flex justify-between items-center">
                    <p>Posted on {job.postedDate}</p>
                    <p>Deadline: {job.deadline}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => router.push(`/dashboard/create-job?job_id=${job.id}`)}
                            className="flex items-center gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/schedule/manage/${job.id}`)}
                            className="flex items-center gap-2"
                        >
                            <CalendarCheck className="h-4 w-4" />
                            Interviews
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/jobs/applicants/${job.id}`)}
                            className="flex items-center gap-2"
                        >
                            <FileUser className="h-4 w-4" />
                            Candidates
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                            className="flex items-center gap-2"
                        >
                            <ReceiptText className="h-4 w-4" />
                            Details
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
