import NextImage from "@/components/custom-UI/NextImage";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { cookies } from "next/headers";
import Apply from "./Apply";
import { sanitizeHtml } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const JOBS_GET_API_ENDPOINT_ID = "/api/v1/job-post-details";

export type Props = {
    params: {
        id: string;
    };
};

export default async function UserPage({ params }: Props) {
    const { id } = params;

    const cookieStore = cookies();
    const token = cookieStore.get(process.env.NEXT_ACCESS_TOKEN || "wanted_ai"); // replace 'token' with your actual cookie key
    if (!token?.value) return <p> Unauthorized Access Forbidden </p>
    // You can now use the token to call your API, for example:
    const jobResp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${JOBS_GET_API_ENDPOINT_ID}?job_id=${id}`, {
        headers: {
            Authorization: `Bearer ${token?.value}`,
        },
        cache: 'no-store',
    });


    if (!jobResp.ok) return <div>Error fetching job data.</div>;
    const jobData = await jobResp.json();
    if (!jobData || !jobData.data) return <div>No job data found.</div>;

    const { data } = jobData;
    // fetch user data here if needed
    return (
        <DashboardLayout>
            <div className="w-full xl:px-40 lg:px-32 md:px-12 sm:px-14 xs:px-8 px-0 flex flex-col h-full space-y-2 items-center justify-start overflow-y-auto">
                <div className="h-full w-full space-y-6">
                    <div className="flex justify-start items-center gap-4 sm:flex-nowrap flex-wrap">
                        <div className="w-16 h-16 rounded-lg border border-muted-foreground/25 overflow-hidden">
                            <NextImage
                                // src="/images/hard_coded_company_image.jpeg"//"/images/placeholder.png"
                                src={data?.logo ?? '/images/placeholder.png'}
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
                    {data.has_applied ? <Badge variant="secondary" className="bg-destructive/10 border border-destructive/25 text-destructive hover:bg-gray-100 px-3 py-1 rounded-full md:text-xs text-xs">
                        Already Applied
                    </Badge> : <Apply jobId={id} has_screening_test={data.has_screening_test} />}
                </div>
            </div>
        </DashboardLayout>
    );
}
