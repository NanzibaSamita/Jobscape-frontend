"use client"

import { useState } from "react"
import ApplicantCard from "./applicant-card"
import { Applicant, JobData } from "./page"
import NextImage from "@/components/custom-UI/NextImage"
import BlackStyleButton from "@/components/custom-UI/Buttons/BlackStyleButton"
import { useRouter } from "next/navigation"
import { api } from "@/lib/axios/axios"
import { toast } from "react-toastify"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"



export default function ApplicantsPage({ applicantsData, jobData, job_id }: { applicantsData: Applicant[], jobData: JobData | null, job_id: string }) {
    const [applicants, setApplicants] = useState(applicantsData);
    const router = useRouter();

    const handleAction = async (id: number, action: "view" | "reject" | "shortlist") => {
        if (action === "view") {
            router.push(`/dashboard/jobs/applicants/application/${id}/${jobData?.id}`)
            return
        }

        await api.post("/api/v1/application-status-update", {
            job_post_id: jobData?.id,
            applicant_id: id,
            status: action === "reject" ? 3 : action === "shortlist" ? 1 : 2,
        }).then(() => {
            toast.success("Application status updated successfully");
            setApplicants((prev) =>
                prev.map((applicant) =>
                    applicant.id === id ? { ...applicant, status: action === "shortlist" ? "shortlisted" : action === "reject" ? "rejected" : "pending" } : applicant,
                ),
            )
        })
            .catch((error) => {
                console.error("Update failed:", error);
                const msg =
                    error?.response?.data?.message ||
                    "Something went wrong.";
                toast.error(msg);
            })
            .finally(() => {
            });
    }

    /* 
       setApplicants((prev) =>
            prev.map((applicant) =>
                applicant.id === id ? { ...applicant, status: action === "reject" ? "rejected" : "shortlisted" } : applicant,
            ),
        )
    */

    const changeStatus = (status: number, id: number | string) => {
        // 3/ reject 
        // 1/ shortlisted
        setApplicants((prev) =>
            prev.map((applicant) => {
                console.log(applicant.id, id)
                return String(applicant.id) === id ? { ...applicant, status: status === 3 ? "rejected" : "shortlisted" } : applicant
            }
            ),
        )
    }

    const pendingApplicants = applicants.filter((a) => a.status === "pending")
    const processedApplicants = applicants.filter((a) => a.status !== "pending")
    return (
        <div className="min-h-screen bg-background">
            <div className="">
                <div className="mx-auto space-y-2">
                    {/* Header */}
                    <div className="">
                        <h1 className="text-3xl font-bold text-foreground">Job Applicants</h1>
                    </div>

                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex justify-start items-center gap-4 sm:flex-nowrap flex-wrap">
                            <div className="w-16 h-16 rounded-lg border border-muted-foreground/25 overflow-hidden">
                                <NextImage
                                    // src={jobData?.logo ?? "/images/hard_coded_company_image.jpeg"}
                                    src={jobData?.logo ?? '/images/placeholder.png'}
                                    alt="User Icon"
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="">
                                <p className="text-xs">Job No #{jobData?.id}</p>
                                <p className="text-lg font-semibold line-clamp-1">{jobData?.title}</p>
                                <p className="text-sm">{jobData?.company_name}</p>
                            </div>
                        </div>
                        <div>
                            <BlackStyleButton
                                onClick={() => router.push(`/dashboard/schedule/${jobData?.id}`)}
                                title="Manage Schedule"
                                customStyles={{
                                    button: {
                                        padding: "0.01rem 1rem"
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <Tabs defaultValue="all">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="accepted">Shortlisted</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all">
                            {/* Pending Applications */}
                            {pendingApplicants.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-foreground mb-4">
                                        Pending Review ({pendingApplicants.length})
                                    </h2>
                                    <div className="grid gap-4">
                                        {pendingApplicants.map((applicant) => (
                                            <ApplicantCard job_id={job_id} key={applicant.id} applicant={{ ...applicant }} onAction={handleAction} changeStatus={changeStatus} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Processed Applications */}
                            {processedApplicants.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-semibold text-foreground mb-4">Processed ({processedApplicants.length})</h2>
                                    <div className="grid gap-4">
                                        {processedApplicants.map((applicant) => (
                                            <ApplicantCard job_id={job_id} key={applicant.id} applicant={applicant} onAction={handleAction} changeStatus={changeStatus} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="accepted">
                            {processedApplicants?.filter((a) => a.status === "shortlisted")?.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-semibold text-foreground mb-4">Shortlisted ({processedApplicants?.filter((a) => a.status === "shortlisted")?.length})</h2>
                                    <div className="grid gap-4">
                                        {processedApplicants.filter((a) => a.status === "shortlisted").map((applicant) => (
                                            <ApplicantCard job_id={job_id} key={applicant.id} applicant={applicant} onAction={handleAction} changeStatus={changeStatus} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="rejected">
                            {processedApplicants?.filter((a) => a.status === "rejected")?.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-semibold text-foreground mb-4">Rejected ({processedApplicants?.filter((a) => a.status === "rejected")?.length})</h2>
                                    <div className="grid gap-4">
                                        {processedApplicants.filter((a) => a.status === "rejected").map((applicant) => (
                                            <ApplicantCard job_id={job_id} key={applicant.id} applicant={applicant} onAction={handleAction} changeStatus={changeStatus} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="pending">
                            {pendingApplicants.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-foreground mb-4">
                                        Pending Review ({pendingApplicants.length})
                                    </h2>
                                    <div className="grid gap-4">
                                        {pendingApplicants.map((applicant) => (
                                            <ApplicantCard job_id={job_id} key={applicant.id} applicant={applicant} onAction={handleAction} changeStatus={changeStatus} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                </div>
            </div>
        </div>
    )
}
