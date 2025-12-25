"use client";
import BlackStyleButton from '@/components/custom-UI/Buttons/BlackStyleButton'
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React from 'react'

export function NavigateJob({
    jobId
}: { jobId: string | number }) {
    const router = useRouter();
    const handleViewDetails = () => {
        // Navigate to the job details page
        router.push(`/public/job/${jobId}`);
    };
    return (
        <BlackStyleButton
            onClick={handleViewDetails}
            title={<div
                className='flex items-center text-sm'>
                View Details
                <ArrowUpRight className="w-4 h-4 ml-1" />
            </div>} />
    )
}

export function NavigateJobMobile({
    jobId
}: {
    jobId: string | number
}) {

    const router = useRouter();
    const handleViewDetails = () => {
        // Navigate to the job details page
        router.push(`/public/job/${jobId}`);
    };
    return (<Button
        onClick={handleViewDetails}
        variant={"ghost"}
        className='hover:bg-transparent py-1 text-sm border'
    >
        View Details
    </Button>)
}