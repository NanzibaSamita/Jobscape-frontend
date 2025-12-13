"use client"
import { sanitizeHtml } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, MapPin, Building2, Users, Clock, FileText, CheckCircle, Waypoints } from "lucide-react"
import { Application } from "./page"

export default function ApplicationCard({ application }: { application: Application }) {
    const router = useRouter()
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "accepted":
            case "offered":
                return "bg-green-100 text-green-800 border-green-200"
            case "rejected":
                return "bg-red-100 text-red-800 border-red-200"
            case "under review":
                return "bg-blue-100 text-blue-800 border-blue-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    return (
        <Card className="w-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-xl font-semibold   mb-2">{application.title}</CardTitle>
                        <div className="flex items-center gap-2   mb-2">
                            <Building2 className="h-4 w-4" />
                            <span className="font-medium">{application.company_name}</span>
                            <Badge variant="outline" className="ml-2">
                                {application.sector_name}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm  text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{application.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>
                                    {application.job_type} • {application.job_mode}
                                </span>
                            </div>
                            {/* {application.level && <Badge variant="secondary">{application.level}</Badge>} */}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(application.status_text)}>{application.status_text}</Badge>
                        <div className="flex items-center gap-1 text-sm  text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            <span>Applied {formatDate(application.applied_at)}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center">
                            {/* <DollarSign className="h-4 w-4  text-muted-foreground" /> */}
                            <span className="font-medium text-sm">Salary Range</span>
                        </div>
                        <p className="text-sm  text-muted-foreground/70">
                            {application.salary_range} BDT
                            {application.is_salary_negotiable === 1 && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                    Negotiable
                                </Badge>
                            )}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4  text-muted-foreground" />
                            <span className="font-medium text-sm">Application Deadline</span>
                        </div>
                        <p className="text-sm  text-muted-foreground/70 pl-6">{formatDate(application.deadline)}</p>
                    </div>
                </div>

                <Separator />

                <div className="space-y-3">
                    <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Job Description
                        </h4>
                        {/* <p className="text-sm  text-muted-foreground/70 line-clamp-3">{application.description}</p> */}
                        <div className='text-xs leading-5 p-4 rounded-md bg-dashboard' dangerouslySetInnerHTML={{ __html: sanitizeHtml(application.description) }}></div>
                    </div>

                    {/* {application.must_have_skills && (
                        <div>
                            <h4 className="font-medium text-sm mb-2">Must-Have Skills</h4>
                            <div className="flex flex-wrap gap-1">
                                {application.must_have_skills.split(",").map((skill, index) => (
                                    <Badge key={index} variant="default" className="text-xs">
                                        {skill.trim()}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {application.nice_to_have_skills && (
                        <div>
                            <h4 className="font-medium text-sm mb-2">Nice-to-Have Skills</h4>
                            <div className="flex flex-wrap gap-1">
                                {application.nice_to_have_skills.split(",").map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                        {skill.trim()}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )} */}
                    <div className="flex items-center justify-end flex-wrap gap-2 w-full">
                        {application.has_screening_test === 1 && (
                            <div className="flex items-center gap-2 text-sm text-blue-600 mr-auto">
                                <CheckCircle className="h-4 w-4" />
                                <span>Includes screening test</span>
                            </div>
                        )}
                        <div onClick={() => router.push(`/applied-jobs/${application.job_application_id}`)} className="flex items-center gap-2 bg-primary/30 max-w-min rounded-md px-4 py-1 cursor-pointer">
                            <Waypoints className="h-4 w-4 shrink-0" />
                            <span className="whitespace-nowrap text-sm font-semibold">Track</span>
                        </div>

                    </div>
                </div>
            </CardContent>
        </Card>
    )
}