"use client";
import BlackYellowStyleButton from '@/components/custom-UI/Buttons/BlackYellowStyleButton';
import NextImage from '@/components/custom-UI/NextImage'
import { api, axiosInstance } from '@/lib/axios/axios';
import { Edit, NotepadTextDashed } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { JobFormData } from './page';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { sanitizeHtml, transformQuestionsToPost } from '@/lib/utils';
import { Button } from '@/components/ui/button';
const SECTOR_GET_API_ENDPOINT = "/api/v1/sector-select";
const COUNTRY_GET_API_ENDPOINT = "/api/v1/country-select";
const COMPANY_API_ENDPOINT = "/api/v1/companies";
const JOB_API_ENDPOINT = "/api/v1/job-posts";
const JOB_UPDATE_API_ENDPOINT = "/api/v1/job-posts/";
const STORE_SCREENING_QUESTIONS_API_ENDPOINT = "/api/v1/screening-question-store";

export default function ConfirmAndProceed({
    prevStep,
    form,
    loading,
    setLoading,
    updateId,
    disabledScreening = false, // Optional prop to disable the input
}: {
    prevStep: (currentIndex: number) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any, // Replace with actual form type if available
    loading: boolean
    setLoading: (loading: boolean) => void;
    updateId?: string; // Optional updateId for editing existing job
    disabledScreening?: boolean; // Optional prop to disable the input
}) {
    const router = useRouter();
    const [companies, setCompanies] = useState<{
        id: string;
        name: string;
        logo: string;
    }[]>([]);
    const [, setSectors] = useState<{
        id: string;
        name: string;
    }[]>([]);
    const [countries, setCountries] = useState<{
        id: string;
        name: string;
    }[]>([]);


    const data = form.getValues();


    function fetchCompanies() {
        return api
            .get(COMPANY_API_ENDPOINT, {
                signal: new AbortController().signal,
            })
            .then((res) => {
                setCompanies(res.data?.data.map((company: { id: string; company_name: string; logo: string }) => ({
                    id: company.id,
                    name: company.company_name,
                    logo: company.logo,
                })));
            })
            .catch((err) => {
                console.log(err);

            })
            .finally(() => {

            });
    }
    function fetchSectors() {
        return axiosInstance
            .get(SECTOR_GET_API_ENDPOINT, {
                signal: new AbortController().signal,
            })
            .then((res) => {
                setSectors(res.data?.data.map((sector: { id: string; name: string }) => ({
                    id: sector.id,
                    name: sector.name,
                })));
            })
            .catch((err) => {
                console.log(err);

            })
            .finally(() => {

            });
    }
    function fetchCountries() {
        return axiosInstance
            .get(COUNTRY_GET_API_ENDPOINT, {
                signal: new AbortController().signal,
            })
            .then((res) => {
                setCountries(res.data?.data.map((country: { id: string; country_name: string }) => ({
                    id: country.id,
                    name: country.country_name,
                })));
            })
            .catch((err) => {
                console.log(err);

            })
            .finally(() => {

            });
    }
    function createJobScreening({
        job_id,
        screening_questions,
        time
    }: {
        job_id: string;
        time: number | string;
        screening_questions: {
            question_type: string;
            questions: string;
            option_one?: string;
            option_two?: string;
            option_three?: string;
            option_four?: string;
            right_answer?: string;
        }[];
    }) {
        return api
            .post(STORE_SCREENING_QUESTIONS_API_ENDPOINT, {
                job_post_id: job_id,
                timer_seconds: time,
                questions: screening_questions,
            })
            .then((res) => {
                console.log("Screening questions created successfully:", res.data);
            })
            .catch((err) => {
                console.error("Error creating screening questions:", err);
                toast.error("An error occurred while creating screening questions.");
            });
    }
    function updateJobDetails(payload: JobFormData) {
        const screeningQuestions = payload?.screening_questions || []
        delete payload.screening_questions;
        const modified = transformQuestionsToPost(screeningQuestions);
        const timer = payload.timer_seconds || 0;
        const updatedData = {
            ...payload,
            deadline: payload.deadline ? new Date(payload.deadline).toISOString().split("T")[0] : undefined, // Ensure deadline is in ISO format
        }
        setLoading(true);
        api
            .put(JOB_UPDATE_API_ENDPOINT + updateId, updatedData)
            .then(({ }) => {
                toast.success("Job updated successfully!");
                if (!disabledScreening) {
                    createJobScreening({
                        job_id: updateId ?? "",
                        screening_questions: modified,
                        time: timer,
                    });
                }
                router.push("/dashboard/jobs");
            })
            .catch(() => {
                toast.error("An error occurred while updating the job.");
            })
            .finally(() => {
                setLoading(false);
            });
    }
    function saveJobDetails(payload: JobFormData) {
        const screeningQuestions = payload?.screening_questions || []
        delete payload.screening_questions;
        const modified = transformQuestionsToPost(screeningQuestions);
        const timer = payload.timer_seconds || 0;
        const updatedData = {
            ...payload,
            deadline: payload.deadline ? new Date(payload.deadline).toISOString().split("T")[0] : undefined, // Ensure deadline is in ISO format
        }
        setLoading(true);
        api
            .post(JOB_API_ENDPOINT, updatedData)
            .then(({ data }) => {
                console.log(data);
                const jobId = data?.data?.id;
                if (!disabledScreening) {
                    createJobScreening({
                        job_id: jobId,
                        screening_questions: modified,
                        time: timer,
                    });
                }
                toast.success("Job created successfully!");
                router.push("/dashboard/jobs");
            })
            .catch(() => {
                toast.error("An error occurred while creating the job.");
            })
            .finally(() => {
                setLoading(false);
            });
    }


    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchSectors(),
            fetchCountries(),
            fetchCompanies(),
        ])
            .then(() => {
                console.log("Data fetched successfully");
            }).catch((err) => {
                console.error("Error fetching data:", err);
            }).finally(() => {
                setLoading(false);
            })
    }, []);
    if (loading) return <>Loading...</>
    return (
        <div className="w-full flex flex-col h-full space-y-4 items-center justify-start overflow-y-auto relative ">
            <div onClick={() => prevStep(1)} className='absolute cursor-pointer top-0 right-0 flex justify-center items-center gap-1 rounded-full bg-black dark:bg-primary/20 px-3 py-2'>
                <Edit className='text-muted-foreground  text-white dark:text-muted-foreground' size={16} />
                <p className='text-white dark:text-muted-foreground text-xs'>Edit</p>
            </div>
            <div className="h-full w-full space-y-6  overflow-y-auto">
                <div className="flex justify-start items-center gap-4 sm:flex-nowrap flex-wrap">
                    <div className="w-16 h-16 rounded-lg border border-muted-foreground/25 overflow-hidden">
                        <NextImage
                            src={companies.find((company: { id: string; name: string; logo: string }) => company?.id?.toString() === data?.company_id)?.logo || "/images/placeholder.png"}
                            alt="User Icon"
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="">
                        <p className="text-xs">Job No #384</p>
                        <p className="text-lg font-semibold line-clamp-1">{data?.title}({data?.job_mode})</p>
                        <p className="text-sm">{companies.find((company: { id: string; name: string; logo: string }) => company?.id?.toString() === data?.company_id)?.name || ""}</p>
                    </div>
                </div>
                <div className="flex justify-start items-center gap-10 sm:flex-nowrap flex-wrap">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Salary Range</p>
                        <p className="text-xs font-light text-muted-foreground">{data?.salary_range}</p>
                    </div>
                    <hr className="h-8 border border-slate-200 " />
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Employment Type</p>
                        <p className="text-xs font-light text-muted-foreground">{data?.job_type}</p>
                    </div>
                    <hr className="h-8 border border-slate-200 " />
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Work Place</p>
                        <p className="text-xs font-light text-muted-foreground">{data?.job_mode}</p>
                    </div>
                    <hr className="h-8 border border-slate-200 " />
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Vacancy</p>
                        <p className="text-xs font-light text-muted-foreground">{data?.vacancies}</p>
                    </div>
                    <hr className="h-8 border border-slate-200 " />
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-xs font-light text-muted-foreground">{
                            countries.find((country: { id: string; name: string }) => country.id.toString() === data?.location)?.name || "Bangladesh"
                        }</p>
                    </div>
                </div>
                <hr />
                <div>
                    <p className="text-sm font-medium">Job Description</p>
                    <div className='text-xs leading-5' dangerouslySetInnerHTML={{ __html: sanitizeHtml(data?.description) }}></div>
                </div>

                <div>
                    <p className="text-sm font-medium">Responsibilities</p>
                    <div className='text-xs leading-5' dangerouslySetInnerHTML={{ __html: sanitizeHtml(data?.job_responsibility) }}></div>
                </div>

                <div>
                    <p className="text-sm font-medium">Requirements</p>
                    <div className='text-xs leading-5' dangerouslySetInnerHTML={{ __html: sanitizeHtml(data?.job_requirements) }}></div>
                </div>
                {data?.job_benefits && <div>
                    <p className="text-sm font-medium">Benefits</p>
                    <div className='text-xs leading-5' dangerouslySetInnerHTML={{ __html: sanitizeHtml(data?.job_benefits ?? '') }}></div>
                </div>}
            </div>
            <div className='sm:grid md:grid-cols-3 grid-cols-1 gap-4 w-full'>
                <BlackYellowStyleButton
                    disabled={loading}  // Disable button if loading
                    fullWidth onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                        e?.preventDefault();
                        if (updateId) return updateJobDetails(data);
                        return saveJobDetails(data);
                    }
                    } title={"Confirm & Submit"} />

                <Button onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    e?.preventDefault();
                    if (updateId) return updateJobDetails({ ...data, is_save_as_draft: true });
                    return saveJobDetails({ ...data, is_save_as_draft: true });
                }} variant={"destructive"} className="rounded-full h-full max-w-min">
                    <NotepadTextDashed className='text-white' />
                    Save as Draft
                </Button>

            </div>
        </div >
    )
}
