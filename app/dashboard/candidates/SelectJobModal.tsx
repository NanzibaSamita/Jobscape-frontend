import { api } from '@/lib/axios/axios';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const JOB_API_ENDPOINT = "/api/v1/recruiter-job-posts";
export default function SelectJobModal({
    closeModal,
    keyIs,
    onSubmit,
}: {
    closeModal: (key: string) => void;
    keyIs: string;
    onSubmit?: (id: string) => void;
}) {
    const [jobs, setJobs] = useState<{
        id: string | number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    }[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = async () => {
        try {
            const res = await api.get(JOB_API_ENDPOINT)
            const jobData = res?.data?.data

            if (Array.isArray(jobData)) {
                setJobs(jobData)
            } else {
                throw new Error("Unexpected response structure")
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Failed to fetch jobs:", err)
            toast.error(`${err.message}`)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchJobs()
    }, [])

    return (
        <div className="relative bg-background overflow-hidden rounded-[2rem] shadow-xl lg:p-8 py-6 px-4">
            <X onClick={() => closeModal(keyIs)} className="absolute cursor-pointer right-3 top-3" size={24} />
            <div className='h-full flex flex-col space-y-4'>
                <div>
                    <h2 className='xl:text-2xl lg:text-xl md:text-lg sm:text-base xs:text-sm text-sm font-semibold'>Select One Job</h2>
                    <p className='xs:text-sm text-xs font-light text-muted-foreground line-clamp-2'>
                        Please select a job to proceed. This is required <br /> to view candidates related to the job.
                    </p>
                </div>
                <div className='flex-grow overflow-y-auto'>
                    {loading ? (
                        <p className='text-sm text-muted-foreground'>Loading jobs...</p>
                    ) : (
                        <div className='mt-4 space-y-2'>
                            {jobs.length > 0 ? (
                                jobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className='border rounded-lg p-4 cursor-pointer hover:bg-primary/10'
                                        onClick={() => {
                                            if (onSubmit) {
                                                onSubmit(String(job.id));
                                            }
                                            closeModal(keyIs || '');
                                        }}
                                    >
                                        <h3 className='text-lg font-semibold'>{job.title}</h3>
                                        <p className='text-sm text-muted-foreground'>{job.company_name}</p>
                                    </div>
                                ))
                            ) : (
                                <p className='text-sm text-muted-foreground'>No jobs available.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
