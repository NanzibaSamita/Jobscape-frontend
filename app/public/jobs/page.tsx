// app/jobs/page.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import JobCard from "../job-card";
import { cookies } from "next/headers";



type Props = {
    searchParams: { [key: string]: string | undefined };
};
export type Job = {
    id: number;
    title: string;
    must_have_skills: string;
    nice_to_have_skills: string;
    level: string;
    salary_range: string;
    companyname: string;
    logo: string | null;
    created_at: string;
    job_type: string;
    location: string;
    has_applied?: boolean;
    deadline: string;
};

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

export default async function JobsPage({ searchParams }: Props) {
    const search = searchParams.search || "";
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/job-posts?search=${encodeURIComponent(search)}`
    console.log("API URL:", apiUrl);
    const { token } = await getAuth() ?? {};

    let jobs: Job[] = [];

    try {
        const headers: HeadersInit = {};

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await fetch(apiUrl, { cache: "no-store", headers });
        const data = await res.json();
        jobs = data?.data || [];
    } catch (err) {
        console.error("Failed to fetch jobs", err);
    }

    return (
        <div className="flex flex-col items-center bg-dashboard-foreground py-5 h-screen">
            <div className="w-full px-0 xs:px-8 sm:px-14 md:px-12 lg:px-32 xl:px-40 flex flex-col h-full space-y-4">
                <h1 className="text-xl md:text-2xl font-semibold">Job Findings</h1>

                <form method="get" className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    <div className="flex-grow flex items-center gap-4 border md:border rounded-full px-4 py-2 shadow md:shadow-xl">
                        <Input
                            type="text"
                            name="search"
                            defaultValue={search}
                            className="border-0 shadow-none outline-none ring-0 focus-visible:ring-0 focus-visible:outline-none rounded-full"
                            placeholder="Search for jobs..."
                        />
                        <Button type="submit" variant="ghost" className="font-semibold text-muted-foreground">
                            Search
                        </Button>
                    </div>
                </form>

                <div className="flex-grow space-y-3 overflow-y-auto w-full">
                    {jobs.length > 0 ? (
                        jobs.map((job) => <JobCard key={job.id} job={job} />)
                    ) : (
                        <p>No job data found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
