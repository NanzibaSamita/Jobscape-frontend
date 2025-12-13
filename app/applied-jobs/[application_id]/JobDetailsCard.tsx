import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, Users } from 'lucide-react'
import React from 'react'
import BookSlot from './BookSlot'

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}
const formatSalary = (range: string) => {
    const [min, max] = range.split("-");
    if (max == undefined) return `${Number.parseInt(min).toLocaleString()} BDT`
    return `${Number.parseInt(min).toLocaleString()} - ${Number.parseInt(max).toLocaleString()} BDT`
}
export default function JobDetailsCard({
    job_type,
    job_mode,
    vacancies,
    deadline,
    salary_range,
    is_salary_negotiable,
    job_id,
    showBookButton = false,
}: {
    job_type: string
    job_mode: string
    vacancies: string
    deadline: string
    salary_range: string
    is_salary_negotiable: number
    job_id: string | number
    showBookButton?: boolean
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    Job Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                        <p className="font-medium text-sm">{job_type}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Mode</p>
                        <p className="font-medium text-sm">{job_mode}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Vacancies</p>
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span className="font-medium text-sm">{vacancies}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Deadline</p>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium text-sm">{formatDate(deadline)}</span>
                        </div>
                    </div>
                </div>
                <Separator />
                <div className='flex items-center justify-between flex-wrap gap-4'>
                    <div className='space-y-2'>
                        <div className='space-y-1'>
                            <p className="text-sm font-medium text-muted-foreground">Salary Range</p>
                            <div className="flex items-center gap-1">
                                {/* <DollarSign className="h-4 w-4" /> */}
                                <span className="font-medium text-sm">{formatSalary(salary_range)}</span>
                            </div>
                        </div>
                        <div className='space-y-1'>
                            <p className="text-sm font-medium text-muted-foreground">Negotiable</p>
                            <p className={`font-medium text-sm max-w-min px-2 rounded-md border ${is_salary_negotiable ? "bg-green-300/20 text-green-500 border-green-500" : "bg-destructive/20 text-destructive border-destructive"}`}>{is_salary_negotiable ? "Yes" : "No"}</p>
                        </div>
                    </div>
                    <div className={`${showBookButton ? "block" : "hidden"}`}>
                        <BookSlot jobId={job_id} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
