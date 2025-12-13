"use client";

import React from 'react'
import { Job } from './(index)/page';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import BlackStyleButton from '@/components/custom-UI/Buttons/BlackStyleButton';
import { getRelativeDateLabel } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function JobCard({
    job
}: {
    job: Job; // Define the type of job if available
}) {
    const router = useRouter();
    const handleViewDetails = () => {
        // Navigate to the job details page
        router.push(`/jobs/${job.id}`);
    };
    return (
        <Card className="w-full md:p-4 p-2 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow ">
            <CardContent className="p-0">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 overflow-hidden rounded-full flex items-center justify-center text-black font-semibold text-lg"
                        >
                            <Image
                                // src="/images/hard_coded_company_image.jpeg"//{job?.logo || '/images/placeholder.png'} // Fallback logo if company_logo is not provided
                                src={job?.logo ?? '/images/placeholder.png'}
                                alt="Automate Process"
                                className="w-full h-full rounded-md"
                                width={500}
                                height={500}
                                onError={(e) => {
                                    // Fallback to a placeholder image if the logo fails to load
                                    e.currentTarget.src = '/images/placeholder.png';
                                }}
                            />

                        </div>
                        <div>
                            <h3 className="text-sm md:text-base md:font-semibold line-clamp-1 font-medium text-gray-900">{job.companyname}</h3>
                        </div>
                    </div>
                    <div className="items-center gap-3 md:flex hidden">
                        <span className="text-gray-500 text-sm">{getRelativeDateLabel(job.created_at)}</span>
                        <BlackStyleButton
                            onClick={handleViewDetails}
                            title={<div
                                className='flex items-center text-sm'>
                                View Details
                                <ArrowUpRight className="w-4 h-4 ml-1" />
                            </div>} />
                    </div>
                </div>

                <div className="mb-3">
                    <h2 className="md:text-xl text-sm font-semibold text-gray-900">{job.title}</h2>
                    <p className="md:text-sm text-xs text-muted-foreground">{job.salary_range} BDT</p>
                </div>
                <div className="items-center gap-3 md:hidden block mb-2">
                    <Button
                        onClick={handleViewDetails}
                        variant={"ghost"}
                        className='hover:bg-transparent py-1 text-sm border'
                    >
                        View Details
                    </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {job?.job_type && <Badge variant="secondary" className="bg-transparent border border-muted-foreground/25 text-muted-foreground hover:bg-gray-100 px-3 py-1 rounded-full md:text-xs text-xs">
                        {job?.job_type}
                    </Badge>}
                    <Badge variant="secondary" className="bg-transparent border border-muted-foreground/25 text-muted-foreground hover:bg-gray-100 px-3 py-1 rounded-full md:text-xs text-xs">
                        {job.location}
                    </Badge>
                    {job?.has_applied && <Badge variant="secondary" className="bg-destructive/10 border border-destructive/25 text-destructive hover:bg-gray-100 px-3 py-1 rounded-full md:text-xs text-xs">
                        Already Applied
                    </Badge>}
                </div>
            </CardContent>
        </Card>
    )
}
