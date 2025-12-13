import { cookies } from "next/headers"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layouts/DashboardLayout"
import ApplicationCard from "./ApplicationCard"


const APPLIED_JOBS_GET = "/api/v1/applicant/applied-jobs"

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

async function fetchAppliedJobs(token: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${APPLIED_JOBS_GET}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    })

    if (!res.ok) throw new Error("Failed to fetch job data")
    const data = await res.json()
    return data?.data || []
}



export default async function Page() {
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

    let applications: Application[] = []

    try {
        applications = await fetchAppliedJobs(auth.token);
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

    if (!applications || applications.length === 0) {
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
            <div className="w-full min-h-screen bg-dashboard-foreground">
                <div className="mx-auto space-y-2">
                    <div className="">
                        <h1 className="text-3xl font-bold  ">My Job Applications</h1>
                        <p className=" ">
                            Track the status of your {applications.length} job application{applications.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {applications.map((application) => (
                            <ApplicationCard key={application.id} application={application} />
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
