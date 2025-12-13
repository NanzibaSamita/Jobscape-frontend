"use client"
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react'
import CandidateCard from '../CandidateCard';
import { useUI } from '@/contexts/ui-context';
import { useSearchParams } from 'next/navigation';
import SelectJobModal from '../SelectJobModal';
import { api } from '@/lib/axios/axios';


const CANDIDATE_API = "/api/v1/candidates"
export type Candidate = {
    id: number;
    name: string;
    location: string;
    ai_score: string;
    education: {
        degree: string;
        dates: string;
    }[];
    experience: {
        title: string;
        dates: string;
    }[];
    skills: string[];
    insights: {
        role: string;
        duration: string;
    }[];
};
export default function Page() {
    const searchParams = useSearchParams()
    const jobId = searchParams.get("job_id")

    const [steps] = useState<{
        title: string;
        stepName: string;
        step: number;
    }[]>([
        {
            title: "All",
            stepName: "all",
            step: 1,
        },
        {
            title: "Sourced by AI",
            stepName: "aiSource",
            step: 2,
        },
        {
            title: "Added",
            stepName: "added",
            step: 3,
        }
    ]);
    const { openModal, closeModal } = useUI();
    const [activeStep, setActiveStep] = useState("aiSource");
    const [loading, setLoading] = useState(false);
    const [candidates, setCandidates] = useState<Candidate[]>([]);


    const handleStepClick = (stepName: string) => {
        setActiveStep(stepName)
        console.log(`Clicked on step: ${stepName}`)
        // Add your custom logic here
    }

    async function fetchCandidates(id: string) {
        try {
            const res = await api.get(`${CANDIDATE_API}/${id}`)
            const data: Candidate[] = res?.data?.data

            if (Array.isArray(data)) {
                setCandidates(data)
            } else {
                console.log("Unexpected response structure")
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Failed to fetch jobs:", err)

        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        if (jobId) {
            fetchCandidates(jobId);
        } else if (!jobId) {
            openModal("chooseJobForCandidate", <SelectJobModal
                keyIs='chooseJobForCandidate'
                closeModal={() => closeModal("chooseJobForCandidate")}
                onSubmit={(jobId: string) => {
                    const params = new URLSearchParams(window.location.search);
                    params.set("job_id", jobId);
                    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
                }}
            />);
        }
    }, [jobId]);

    if (!jobId) {
        return (
            <DashboardLayout>
                <div className="w-full flex flex-col h-full space-y-2 items-start justify-start overflow-y-auto">
                    <h1 className='text-2xl font-medium'>Candidates</h1>
                    <div className='h-full w-full max-w-3xl overflow-y-auto'>
                        <p className='text-sm text-muted-foreground'>Please select a job to view candidates.</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }
    return (
        <DashboardLayout>
            <div className="space-y-4 h-full flex flex-col overflow-y-auto">
                <div className="flex items-center gap-1 ">
                    {steps.map((step) => (
                        <button
                            key={step.stepName}
                            onClick={() => handleStepClick(step.stepName)}
                            className={cn(
                                "text-xs font-medium transition-colors rounded-md px-3 py-1",
                                activeStep === step.stepName
                                    ? "shadow-md border"
                                    : "text-gray-500 hover:text-gray-700",
                            )}
                        >
                            <span>{step.title}</span>
                        </button>
                    ))}
                </div>
                {loading ?
                    <div className='grid animate-pulse md:grid-cols-2 grid-cols-1 gap-4'>
                        <div className='w-full h-36 animate-pulse bg-primary/20 rounded-lg' />
                        <div className='w-full h-36 animate-pulse bg-primary/20 rounded-lg' />
                        <div className='w-full h-36 animate-pulse bg-primary/20 rounded-lg' />
                        <div className='w-full h-36 animate-pulse bg-primary/20 rounded-lg' />
                    </div>
                    :

                    <div className='grid md:grid-cols-2 grid-cols-1 gap-4'>
                        {
                            candidates.map((candidate, index) => (
                                <CandidateCard
                                    key={index}
                                    candidate={candidate}
                                    jobId={jobId}
                                />
                            ))
                        }
                    </div>}
            </div>
        </DashboardLayout>
    )
}
