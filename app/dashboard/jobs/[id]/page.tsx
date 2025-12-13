import { Props } from '@/app/jobs/[id]/page';
import NextImage from '@/components/custom-UI/NextImage';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { sanitizeHtml } from '@/lib/utils';
import { cookies } from 'next/headers';
import React from 'react'
import TabActions from '../TabActions';

const JOBS_GET_API_ENDPOINT_ID = "/api/v1/recruiter-job-post-show";

interface Job {
    id: number | string;
    company_id: number | string;
    recruiter_id: number | string;
    sector_id: number | string;
    title: string;
    level: string | null;
    location: string;
    job_type: string; // e.g., "Full-time"
    job_mode: string; // e.g., "Onsite"
    vacancies: string;
    job_responsibility: string; // HTML string
    job_requirements: string;   // HTML string
    must_have_skills: string | null;
    nice_to_have_skills: string | null;
    required_certifications: string | null;
    description: string; // HTML string
    salary_range: string; // e.g., "10000-623648"
    deadline: string; // ISO date string
    job_post_status_id: number | string;
    has_screening_test: number | string; // typically 0 or 1
    created_by: number | string;
    updated_by: number | string;
    company_name: string;
    sector_name: string;
    recruiter_full_name: string;
    job_post_created_by_full_name: string;
    job_post_updated_by_full_name: string;
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
    has_applied: boolean;
    has_taken_screening_test: boolean;
    job_benefits: string | undefined | null; // HTML string
    status_id: number | string; // Assuming this is a number representing the job status
}
async function getAuth() {
    const cookieStore = cookies();
    const token = cookieStore.get(process.env.NEXT_ACCESS_TOKEN || "wanted_ai")?.value;
    const session = cookieStore.get("session")?.value;

    if (!token || !session) return null;
    try {
        const { userId } = JSON.parse(session);
        return { token, userId };
    } catch {
        return null;
    }
}

async function fetchJobs(token: string, id: string) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${JOBS_GET_API_ENDPOINT_ID}?job_post_id=${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store"
        }
    );
    if (!res.ok) throw new Error("Failed to fetch job data");
    const data = await res.json();
    return data?.data || [];
}

export default async function Page({ params }: Props) {
    const { id } = params;
    const auth = await getAuth();
    if (!auth) return <p>Unauthorized Access Forbidden</p>;
    let job: Job | null = null;
    try {
        job = (await fetchJobs(auth.token, id));
    } catch {
        return <div>Error fetching job data.</div>;
    }
    if (!job) return <div>No job data found.</div>;
    return (
        <DashboardLayout>
            <div className="w-full relative xl:px-40 lg:px-32 md:px-12 sm:px-14 xs:px-8 px-0 flex flex-col h-full space-y-2 items-center justify-start overflow-y-auto">
                <div className="h-full w-full space-y-6">
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                        <div className='flex justify-start items-center gap-4 sm:flex-nowrap flex-wrap xl:order-1 flex-grow'>
                            <div className="w-16 h-16 rounded-lg border border-muted-foreground/25 overflow-hidden">
                                <NextImage
                                    src="/images/placeholder.png"
                                    alt="User Icon"
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="">
                                <p className="text-xs">Job No #{job.id}</p>
                                <p className="text-lg font-semibold line-clamp-1">{job.title}</p>
                                <p className="text-sm">{job.company_name}</p>
                            </div>
                        </div>
                        <div className='xl:order-2 flex-grow'>
                            <TabActions
                                isPublished={job?.job_post_status_id?.toString() === "1"} // Assuming 1 means published
                                isOverdue={new Date(job.deadline) < new Date()}
                                jobId={job?.id.toString()}
                                status={job?.job_post_status_id?.toString()} // Assuming 0 means draft or unpublished
                            />
                        </div>
                    </div>
                    <div className="flex justify-start items-center gap-10 flex-wrap">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Salary Range</p>
                            <p className="text-xs font-light text-muted-foreground">{job.salary_range}</p>
                        </div>
                        <hr className="h-8 border border-slate-200 " />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Employment Type</p>
                            <p className="text-xs font-light text-muted-foreground">{job.job_type}</p>
                        </div>
                        <hr className="h-8 border border-slate-200 " />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Work Place</p>
                            <p className="text-xs font-light text-muted-foreground">{job.job_mode}</p>
                        </div>
                        <hr className="h-8 border border-slate-200 " />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Vacancy</p>
                            <p className="text-xs font-light text-muted-foreground">{job.vacancies ?? ""}</p>
                        </div>
                        <hr className="h-8 border border-slate-200 " />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Location</p>
                            <p className="text-xs font-light text-muted-foreground">{job.location}</p>
                        </div>
                    </div>
                    <hr />
                    <div>
                        <p className="text-sm font-medium">Job Description</p>
                        <div className='text-xs leading-5' dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.description) }}>
                            {/* <p className="text-xs font-light leading-5">
                                {job.description || "No description available."}
                            </p> */}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium">Responsibilities</p>
                        <div className='text-xs leading-5' dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.job_responsibility) }}>
                            {/* <p className="text-xs font-light leading-5">
                                {job.description || "No description available."}
                            </p> */}
                        </div>
                        {/* <section className="text-xs font-light leading-5">
                            <ul className="list-disc pl-4">
                                {job.job_responsibility?.split("\n")?.map((item: string, index: number | string) => (
                                    <li key={index} className="text-sm text-gray-700">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section> */}
                    </div>

                    <div>
                        <p className="text-sm font-medium">Requirements</p>
                        <div className='text-xs leading-5' dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.job_requirements) }}>
                            {/* <p className="text-xs font-light leading-5">
                                {job.description || "No description available."}
                            </p> */}
                        </div>
                    </div>

                    {job.job_benefits && < div >
                        <p className="text-sm font-medium">Benefits</p>
                        <div className='text-xs leading-5' dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.job_benefits ?? "") }}>
                            {/* <p className="text-xs font-light leading-5">
                                {job.description || "No description available."}
                            </p> */}
                        </div>
                        {/* <section className="text-xs font-light leading-5">
                            <ul className="list-disc pl-4">
                                {job.job_responsibility?.split("\n")?.map((item: string, index: number | string) => (
                                    <li key={index} className="text-sm text-gray-700">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section> */}
                    </div>}
                    {
                        job.must_have_skills && <div>
                            <p className="text-sm font-medium">Must To Have Skills</p>
                            <section className="text-xs font-light leading-5">
                                <ul className="list-disc pl-4">
                                    {job.must_have_skills?.split(",")?.map((item: string, index: number | string) => (
                                        <li key={index} className="text-sm text-gray-700">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    }
                    {
                        job.nice_to_have_skills && <div>
                            <p className="text-sm font-medium">Nice To Have Skills</p>
                            <section className="text-xs font-light leading-5">
                                <ul className="list-disc pl-4">
                                    {job.nice_to_have_skills?.split(",")?.map((item: string, index: number | string) => (
                                        <li key={index} className="text-sm text-gray-700">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    }
                    {/* <Apply jobId={id} /> */}
                </div>
            </div>
        </DashboardLayout >
    )
}
