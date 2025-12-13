import { cookies } from "next/headers";
import ApplicantsPage from "./applicants-page"
import { Props } from "../../../../jobs/book-slot/[job_id]/page";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";


const APPLICANTS_GET_API = "/api/v1/job-candidate-summary";
export interface Applicant {
    id: number
    name: string
    email: string
    phone: string
    score: number
    experience: string
    status: string
    cv_score: number // Assuming cv_score is a number
}
export interface JobData {
    id: number
    title: string
    company_name: string
    logo: string
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
};

async function fetchApplicants(token: string, id: string) {
    const formData = new FormData();
    formData.append("job_post_id", id);

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${APPLICANTS_GET_API}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
            body: formData,
        }
    );


    if (!res.ok) throw new Error("Failed to fetch job data");

    const data = await res.json();
    return {
        ...data?.data,
        candidates: Array.isArray(data?.data?.candidates)
            ? data.data.candidates.map((item: {
                id: number;
                user_first_name: string;
                user_last_name: string;
                email: string;
                user_phone: string | null;
                screening_test_score: number | null;
                experience_in_years: number | null;
                status: number; // 1 = pending, 2 = shortlisted, 3 = rejected
                cv_score: number;
            }) => ({
                id: item.id,
                name: `${item.user_first_name ?? ""} ${item.user_last_name ?? ""}`,
                email: item.email,
                phone: item.user_phone,
                score: item.screening_test_score ?? 0,
                experience: item.experience_in_years,
                cv_score: item.cv_score ?? 0,
                status: item.status === 1 ? "shortlisted" : item.status === 2 ? "pending" : item.status === 3 ? "rejected" : item.status === 4 ? "interview" : item.status === 5 ? "offered" : item.status === 6 ? "hired" : "unknown",
            })
            ) : [],
    };
}
export default async function Page({ params }: Props) {
    const { job_id } = params;
    const auth = await getAuth();
    if (!auth) return <p>Unauthorized Access Forbidden</p>;
    let applicants: Applicant[] | [] = [];
    let jobData: JobData | null;
    try {
        const { company, candidates } = await fetchApplicants(auth.token, job_id);
        applicants = candidates || [];
        jobData = { ...company, id: parseInt(job_id) };
    } catch {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-black mb-2">Error Loading Candidates</h2>
                        <p className="text-gray-600">Failed to fetch job data. Please try again later.</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    };
    return (
        <DashboardLayout>
            <ApplicantsPage applicantsData={applicants} jobData={jobData} job_id={job_id} />
        </DashboardLayout>
    )
}
