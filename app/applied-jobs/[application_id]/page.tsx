import { cookies } from "next/headers"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layouts/DashboardLayout"
import JobHeader from "./JobHeader";
import { sanitizeHtml } from "@/lib/utils";
import JobDetailsCard from "./JobDetailsCard";
import Tracking from "./Tracking";

const APPLIED_JOB_GET = "/api/v1/applicant/job-applications/{application_id}/flow"
const APPLICATION_GET = "/api/v1/applicant/applied-jobs/{application_id}";

export interface Application {
    id: number
    company_id: number
    recruiter_id: number
    title: string
    level: string | null
    location: string
    job_type: string
    job_mode: string
    vacancies: string
    job_responsibility: string
    job_requirements: string
    must_have_skills: string | null
    nice_to_have_skills: string | null
    required_certifications: string | null
    description: string
    salary_range: string
    is_salary_negotiable: number
    job_post_status_id: number | null
    deadline: string
    has_screening_test: number
    company_name: string
    sector_id: number
    sector_name: string
    job_post_status: string
    applied_at: string
    status_text: string
    job_application_id: number
    is_slot_booked: number
}
export interface TimelineEvent {
    text: string;
    date: string; // ISO format or "YYYY-MM-DD HH:mm:ss"
}


async function getAuth() {
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.NEXT_ACCESS_TOKEN || "wanted_ai")?.value
    const session = cookieStore.get("session")?.value

    if (!token || !session) return null

    try {
        const { userId } = JSON.parse(session)
        return { token, userId }
    } catch {
        return null
    }
}

async function fetchFlows(token: string, job_id: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${APPLIED_JOB_GET.replace("{application_id}", job_id)}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    })

    if (!res.ok) throw new Error("Failed to fetch job data")
    const data = await res.json()
    return data?.data || []
}

async function fetchAppliedJob(token: string, id: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${APPLICATION_GET.replace("{application_id}", id)}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    })

    if (!res.ok) throw new Error("Failed to fetch job data")
    const data = await res.json()
    return data?.data || []
}



export default async function Page(
    { params }: { params: { application_id: string } }
) {
    const { application_id } = params;
    const auth = await getAuth()

    if (!auth) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <h2 className="text-lg font-semibold   mb-2">Unauthorized Access</h2>
                            <p className=" ">Please log in to view your applied jobs.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    let timeEvents: TimelineEvent[] = []
    let jobDetails: Application | null = null;
    try {
        timeEvents = await fetchFlows(auth.token, application_id) ?? []
        jobDetails = await fetchAppliedJob(auth.token, application_id) ?? {}
    } catch {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Applications</h2>
                            <p className=" ">Failed to fetch your job applications. Please try again later.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!jobDetails) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <h2 className="text-lg font-semibold   mb-2">No Applications Found</h2>
                            <p className=" ">You haven&apos;t applied to any jobs yet. Start exploring opportunities!</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <DashboardLayout>
            <div className="w-full bg-dashboard-foreground space-y-4">
                <JobHeader
                    title={jobDetails.title}
                    companyName={jobDetails.company_name}
                    location={jobDetails.location}
                    sector={jobDetails.sector_name}
                    status_text={jobDetails.status_text}
                    job_id={jobDetails.id.toString()}
                />
                <div className="grid md:grid-cols-2 gap-6">
                    <JobDetailsCard
                        job_type={jobDetails.job_type}
                        job_mode={jobDetails.job_mode}
                        vacancies={jobDetails.vacancies}
                        deadline={jobDetails.deadline}
                        salary_range={jobDetails.salary_range}
                        is_salary_negotiable={jobDetails.is_salary_negotiable}
                        job_id={jobDetails.id.toString()}
                        showBookButton={jobDetails.status_text === "Shortlisted" && !jobDetails.is_slot_booked}
                    />
                    <Tracking
                        flowData={timeEvents}
                    />
                </div>
                <div className="p-4 space-y-4 border rounded-lg">
                    <h2 className="text-xl font-bold">Job Description</h2>
                    <div className='text-xs leading-5 p-4 rounded-md bg-dashboard' dangerouslySetInnerHTML={{ __html: sanitizeHtml(jobDetails.description) }} />
                </div>
            </div>
        </DashboardLayout>
    )
}
