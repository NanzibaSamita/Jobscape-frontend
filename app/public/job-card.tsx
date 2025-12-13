import React from 'react'
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRelativeDateLabel } from '@/lib/utils';
import { Job } from './jobs/page';
import { NavigateJob, NavigateJobMobile } from './navigate-job';
import NextImage from '@/components/custom-UI/NextImage';

export default function JobCard({
    job
}: {
    job: Job; // Define the type of job if available
}) {

    return (
        <Card className="w-full md:p-4 p-2 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow ">
            <CardContent className="p-0">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 overflow-hidden rounded-full flex items-center justify-center text-black font-semibold text-lg"
                        >
                            <NextImage
                                // src="/images/hard_coded_company_image.jpeg" //{job?.logo || '/images/placeholder.png'} // Fallback logo if company_logo is not provided
                                src={job?.logo ?? '/images/placeholder.png'}
                                alt="Automate Process"
                                className="w-full h-full rounded-md"
                                width={500}
                                height={500}
                            />

                        </div>
                        <div>
                            <h3 className="text-sm md:text-base md:font-semibold line-clamp-1 font-medium text-gray-900">{job.companyname}</h3>
                        </div>
                    </div>
                    <div className="items-center gap-3 md:flex hidden">
                        <span className="text-gray-500 text-sm">{getRelativeDateLabel(job.deadline, true)}</span>
                        <NavigateJob jobId={job.id} />
                    </div>
                </div>

                <div className="mb-3">
                    <h2 className="md:text-xl text-sm font-semibold text-gray-900">{job.title}</h2>
                    <p className="md:text-sm text-xs text-muted-foreground">{job.salary_range} BDT</p>
                </div>
                <div className="items-center gap-3 md:hidden block mb-2">
                    <NavigateJobMobile jobId={job.id} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {job?.job_type && <Badge variant="secondary" className="bg-transparent border border-muted-foreground/25 text-muted-foreground hover:bg-gray-100 px-3 py-1 rounded-full md:text-xs text-xs">
                        {job?.job_type}
                    </Badge>}
                    <Badge variant="secondary" className="bg-transparent border border-muted-foreground/25 text-muted-foreground hover:bg-gray-100 px-3 py-1 rounded-full md:text-xs text-xs">
                        {job.location}
                    </Badge>
                    {Boolean(job?.has_applied) && <Badge variant="secondary" className="bg-destructive/10 border border-destructive/25 text-destructive hover:bg-gray-100 px-3 py-1 rounded-full md:text-xs text-xs">
                        Already Applied
                    </Badge>}
                </div>
            </CardContent>
        </Card>
    )
}
