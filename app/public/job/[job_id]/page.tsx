import NextImage from "@/components/custom-UI/NextImage";
import { sanitizeHtml } from "@/lib/utils";
// import Apply from "@/app/jobs/[id]/Apply";
import { cookies } from "next/headers";
import ApplyFake from "../../Apply";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

const JOBS_GET_API_ENDPOINT_ID = "/api/v1/public/job-posts";

export type Props = {
    params: {
        job_id: string;
    };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const job_id = params.job_id;

    try {
        const jobResp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${JOBS_GET_API_ENDPOINT_ID}/${job_id}`, {
            cache: "no-store",
        });

        if (!jobResp.ok) {
            return {
                title: "Job Not Found",
                description: "This job is not available or has been removed.",
            };
        }

        const jobData = await jobResp.json();
        const job = jobData?.data;

        return {
            title: `${job?.title} at ${job?.company_name} | WantedAI`,
            description: job?.description?.replace(/<[^>]+>/g, "").slice(0, 160) || "Apply now to the latest jobs on WantedAI!",
            openGraph: {
                title: `${job?.title} at ${job?.company_name} | WantedAI`,
                description: job?.description?.replace(/<[^>]+>/g, "").slice(0, 200),
                url: `${process.env.NEXT_PUBLIC_BASE_URL}/jobs/${job_id}`,
                siteName: "WantedAI",
                images: [
                    {
                        url: job?.logo || `${process.env.NEXT_PUBLIC_BASE_URL}/images/placeholder.png`,
                        width: 1200,
                        height: 630,
                        alt: `${job?.company_name} Logo`,
                    },
                ],
                type: "website",
            },
            twitter: {
                card: "summary_large_image",
                title: `${job?.title} at ${job?.company_name}`,
                description: job?.description?.replace(/<[^>]+>/g, "").slice(0, 200),
                images: [job?.logo || `${process.env.NEXT_PUBLIC_BASE_URL}/images/placeholder.png`],
            },
        };
    } catch {
        return {
            title: "Error Loading Job",
            description: "Something went wrong while fetching the job data.",
        };
    }
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
export default async function UserPage({ params }: Props) {
    const { job_id } = params;
    const cookieStore = cookies();
    const user = cookieStore.get("session");
    const { token } = await getAuth() ?? {};
    const headers: HeadersInit = {};

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const jobResp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${JOBS_GET_API_ENDPOINT_ID}/${job_id}`, {
        headers,
        cache: 'no-store',
    });


    if (!jobResp.ok) return <div>Error fetching job data.</div>;
    const jobData = await jobResp.json();
    if (!jobData || !jobData.data) return <div>No job data found.</div>;

    const { data } = jobData;
    // fetch user data here if needed
    return (
        <div className="w-full xl:px-40 lg:px-32 md:px-12 sm:px-14 xs:px-8 px-0 flex flex-col h-full space-y-2 items-center justify-start overflow-y-auto max-h-screen py-11">
            <div className="h-full w-full space-y-6">
                <div className="flex justify-start items-center gap-4 sm:flex-nowrap flex-wrap">
                    <div className="w-16 h-16 rounded-lg border border-muted-foreground/25 overflow-hidden">
                        <NextImage
                            // src="/images/hard_coded_company_image.jpeg"
                            src={data?.logo || '/images/placeholder.png'}
                            alt="User Icon"
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="">
                        <p className="text-xs">Job No #{data.id}</p>
                        <p className="text-lg font-semibold line-clamp-1">{data.title}</p>
                        <p className="text-sm">{data.company_name}</p>
                    </div>
                </div>
                <div className="flex justify-start items-center gap-10 sm:flex-nowrap flex-wrap">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Salary Range</p>
                        <p className="text-xs font-light text-muted-foreground">{data.salary_range}</p>
                    </div>
                    <hr className="h-8 border border-slate-200 " />
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Employment Type</p>
                        <p className="text-xs font-light text-muted-foreground">{data.job_type}</p>
                    </div>
                    <hr className="h-8 border border-slate-200 " />
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Work Place</p>
                        <p className="text-xs font-light text-muted-foreground">{data.job_mode}</p>
                    </div>
                    <hr className="h-8 border border-slate-200 " />
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Vacancy</p>
                        <p className="text-xs font-light text-muted-foreground">{data.vacancies ?? ""}</p>
                    </div>
                    <hr className="h-8 border border-slate-200 " />
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-xs font-light text-muted-foreground">{data.location}</p>
                    </div>
                </div>
                <hr />
                <div>
                    <p className="text-sm font-medium">Job Description</p>
                    <div className='text-xs leading-5' dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.description) }}>
                        {/* <p className="text-xs font-light leading-5">
                                                        {job.description || "No description available."}
                                                    </p> */}
                    </div>
                </div>

                <div>
                    <p className="text-sm font-medium">Responsibilities</p>
                    <div className='text-xs leading-5' dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.job_responsibility) }}>
                        {/* <p className="text-xs font-light leading-5">
                                                        {job.description || "No description available."}
                                                    </p> */}
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium">Requirements</p>
                    <div className='text-xs leading-5' dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.job_requirements) }}>
                        {/* <p className="text-xs font-light leading-5">
                                                        {job.description || "No description available."}
                                                    </p> */}
                    </div>
                </div>
                {data.job_benefits && < div >
                    <p className="text-sm font-medium">Benefits</p>
                    <div className='text-xs leading-5' dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.job_benefits ?? "") }}>

                    </div>
                </div>}
                {
                    data.must_have_skills && <div>
                        <p className="text-sm font-medium">Must To Have Skills</p>
                        <section className="text-xs font-light leading-5">
                            <ul className="list-disc pl-4">
                                {data.must_have_skills?.split(",")?.map((item: string, index: number) => (
                                    <li key={index} className="text-sm text-gray-700">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                }
                {
                    data.nice_to_have_skills && <div>
                        <p className="text-sm font-medium">Nice To Have Skills</p>
                        <section className="text-xs font-light leading-5">
                            <ul className="list-disc pl-4">
                                {data.nice_to_have_skills?.split(",")?.map((item: string, index: number) => (
                                    <li key={index} className="text-sm text-gray-700">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                }
                {user ? data.has_applied ? <Badge variant="secondary" className="bg-destructive/10 border border-destructive/25 text-destructive hover:bg-gray-100 px-3 py-1 rounded-full md:text-xs text-xs">
                    Already Applied
                </Badge> 
                : 
                // <Apply jobId={job_id} has_screening_test={data.has_screening_test} /> : <ApplyFake />}
                <ApplyFake /> : <ApplyFake/>
                }
                </div>
        </div>
    );
}
