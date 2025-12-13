"use client"
import { AiIcon } from '@/assets/svg';
import StarButton from '@/components/custom-UI/Buttons/StarButton';
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import React, { useEffect, useState } from 'react'
import BasicInformation from './BasicInformation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from "zod"
import { Form } from '@/components/ui/form';
import { aiBOT, api, axiosInstance } from '@/lib/axios/axios';
import JobDetails from './JobDetails';
import { job_prompt } from "@/local/job_prompt";
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import ScreeningQuestions from './ScreeningQuestions';
import ConfirmAndProceed from './ConfirmAndProceed';
import { useSearchParams } from 'next/navigation';
import { transformQuestionData } from '@/lib/utils';

const SECTOR_GET_API_ENDPOINT = "/api/v1/sector-select";
const COUNTRY_GET_API_ENDPOINT = "/api/v1/country-select";
const COMPANY_API_ENDPOINT = "/api/v1/company-select";
const JOBS_GET_API_ENDPOINT_ID = "/api/v1/recruiter-job-post-show";
const SCREENING_QUESTIONS_API_ENDPOINT = "/api/v1/screening-question-show";

const formSchema = z.object({
    title: z.string().min(1, "Job title is required"),
    job_mode: z.string().min(1, "Preferred work mode is required"),
    sector_id: z.string().min(1, "Sector is required"),
    company_id: z.string().min(1, "Company is required"),
    vacancies: z
        .string()
        .min(1, "Vacancies is required")
        .refine((val) => /^[1-9]\d*$/.test(val), {
            message: "Vacancies must be a positive integer",
        }),
    job_type: z.string().min(1, "Job type is required"),
    is_salary_negotiable: z.boolean().optional(),
    location: z.string().min(1, "Job location is required"),
    description: z.string().min(1, "Job description is required"),
    salary_range: z.string().optional(),
    experience_level: z.string().optional(),
    deadline: z.string().optional(),
    job_responsibility: z.string().optional(),
    job_requirements: z.string().optional(),
    job_benefits: z.string().optional(),
    timer_seconds: z.number().optional(),
    screening_questions: z.array(
        z.object({
            question: z.string().min(1, "Question is required"),
            type: z.string().min(1, "Question type is required"),
            required: z.boolean(),
            options: z.array(z.object({
                id: z.string().min(1, "Option ID is required"),
                value: z.string().min(1, "Option name is required"),
                isAnswer: z.boolean().optional(),
            })),
        })
    ).optional(),
});
export type JobFormData = z.infer<typeof formSchema>
export default function Page() {
    const searchParams = useSearchParams();
    const [disabledScreening, setDisabledScreening] = useState<boolean>(false);
    const jobId = searchParams.get('job_id');
    const [steps, setSteps] = useState<{
        title: string;
        description: string;
        done: boolean;
        name: string;
        headButton?: (c: { id: string, name: string }[], s: { id: string, name: string }[], loading: boolean) => React.ReactNode;
        step: number
    }[]>([
        {
            title: "Create new job position",
            description: "Choose the preferences for your new job position.",
            done: false,
            name: "1. Job Basic Information",
            step: 1
        },
        {
            title: "Describe Job Details",
            description: "You can describe what you’re looking for in free form, and the AI assistant will suggest describe.",
            done: false,
            name: "2. Describe Job Details",
            step: 2,
            headButton: (c, s, loading) => <StarButton>
                {loading ? <div className='min-w-32 min-h-8 justify-center items-center flex gap-2 bg-black dark:bg-primary/15 rounded-full'>
                    <Loader2 className="w-6 h-6 stroke-white animate-spin" />
                </div> :
                    <p onClick={() => getSuggestion(c, s)} className="bg-black rounded-full overflow-hidden px-4 py-1 text-white font-light flex justify-center items-center gap-2">
                        <AiIcon className="w-6 h-6" />
                        Suggest
                    </p>}
            </StarButton>
        },
        {
            title: "Add Screening Questions",
            description: "",
            done: false,
            name: "3. Screening Questions",
            step: 3,
        },
        {
            title: "Review your job post",
            description: "",
            done: false,
            name: "4. Confirm & Proceed",
            step: 4,
        },
    ]);
    const [step, setStep] = useState<{
        title: string;
        description: string;
        done: boolean;
        name: string;
        headButton?: (c: {
            id: string;
            name: string;
        }[], s: {
            id: string;
            name: string;
        }[],
            loading: boolean
        ) => React.ReactNode;
        step: number;
    }>(steps[0]);

    const [sectors, setSectors] = useState<{
        id: string;
        name: string;
    }[]>([]);

    const [countries, setCountries] = useState<{
        id: string;
        name: string;
    }[]>([]);

    const [companies, setCompanies] = useState<{
        id: string;
        name: string;
    }[]>([]);

    const [parentLoading, setParentLoading] = useState<boolean>(false);

    const nextStep = (currentIndex: number) => {
        if (currentIndex < steps.length - 1) {
            setStep(steps[currentIndex + 1]);
            setSteps((prevSteps) =>
                prevSteps.map((s, index) =>
                    index === currentIndex ? { ...s, done: true } : s
                )
            );
        }
    };
    const prevStep = (currentIndex: number) => {
        if (currentIndex > 0) {
            setStep(steps[currentIndex - 1]);
        }
    };


    const form = useForm<JobFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        },
    })

    function fetchCompanies() {

        api
            .get(COMPANY_API_ENDPOINT, {
                signal: new AbortController().signal,
            })
            .then((res) => {
                setCompanies(res.data?.data.map(({ id, name }: {
                    id: string,
                    name: string
                }) => ({ id, name: name })) || []);
            })
            .catch((err) => {
                console.log(err);

            })
            .finally(() => {

            });
    }
    function fetchSectors() {
        axiosInstance
            .get(SECTOR_GET_API_ENDPOINT, {
                signal: new AbortController().signal,
            })
            .then((res) => {
                setSectors(res.data?.data?.map(({ id, name }: { id: string, name: string }) => ({ id, name: name })) || []);
            })
            .catch((err) => {
                console.log(err);

            })
            .finally(() => {

            });
    }
    function fetchCountries() {
        axiosInstance
            .get(COUNTRY_GET_API_ENDPOINT, {
                signal: new AbortController().signal,
            })
            .then((res) => {
                setCountries(res.data?.data?.map(({ id, country_name }: { id: string, country_name: string }) => ({ id: id.toString(), name: country_name })) || []);
            })
            .catch((err) => {
                console.log(err);

            })
            .finally(() => {

            });
    }

    function fetchJobById(job_id: string) {
        api.get(`${JOBS_GET_API_ENDPOINT_ID}?job_post_id=${job_id}`, {
            // params: { job_id },
            signal: new AbortController().signal,
        })
            .then((res) => {
                const { data } = res.data;

                if (!data) {
                    toast.error("Job not found");
                    return;
                }
                setDisabledScreening(data.has_applicant);
                form.setValue("title", data.title || "");
                form.setValue("company_id", data?.company_id?.toString() || "");
                form.setValue("sector_id", data?.sector_id?.toString() || "");
                form.setValue("vacancies", data.vacancies || 10);
                form.setValue("job_type", data.job_type || "");
                form.setValue("salary_range", data.salary_range || "");
                form.setValue("location", data.location || "");
                form.setValue("job_mode", data.job_mode || "");
                form.setValue("deadline", data.deadline || "");
                form.setValue("description", data.description || "");
                form.setValue("job_responsibility", data.job_responsibility || "");
                form.setValue("job_requirements", data.job_requirements || "");
                form.setValue("job_benefits", data.job_benefits || "");
            })
            .catch((err) => {
                console.log(err);

            })
            .finally(() => {

            });
    }

    function getScreeningQuestions(job_id: string) {
        const params: {
            [key: string]: string;
        } = {};
        params['job_post_id'] = job_id;
        const queryString = new URLSearchParams(params).toString();

        api.get(`${SCREENING_QUESTIONS_API_ENDPOINT}` + (queryString ? `?${queryString}` : ''), {
            signal: new AbortController().signal,
        })
            .then((res) => {
                const { data } = res.data;
                if (!data) {
                    toast.error("Job not found");
                    return;
                }
                form.setValue("screening_questions", transformQuestionData(data?.questions || []));
                form.setValue("timer_seconds", data?.timer_seconds || 0);
            })
            .catch((err) => {
                console.log(err);

            })
            .finally(() => {

            });
    }
    async function getSuggestion(c: {
        id: string;
        name: string;
    }[], s: {
        id: string;
        name: string;
    }[]) {
        const [
            title,
            sector_id,
            job_type,
            salary_range,
            location,
            job_mode,
        ] = form.getValues(["title", "sector_id", "job_type", "salary_range", "location", "job_mode"]);

        // const country = c.find((c) => c.id.toString() === location?.toString())?.name || "";
        const sector = s.find(s => s.id.toString() === sector_id?.toString())?.name || "";

        const json = {
            title: title,
            sector: sector,
            job_type: job_type,
            salary_range: salary_range,
            location: location,
            job_mode: job_mode,
        }

        if (!JSON?.stringify(json)?.trim()) return
        try {
            setParentLoading(true)
            const data = await aiBOT(job_prompt.replace("<RAW_TEXT_HERE>", JSON?.stringify(json)?.trim()));

            // Example AI-generated job posting data matching the new schema
            const mockAiResponse = {
                description: data?.description,
                job_requirements: data?.job_requirements,
                job_responsibility: data?.job_responsibility,
                job_benefits: data?.job_benefits,
            }
            // Update form with AI-generated data
            Object.entries(mockAiResponse).forEach(([key, value]) => {
                form.setValue(key as keyof JobFormData, value)
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error generating job post:", error)
            toast.error(error?.message || "Failed to generate job post. Please try again.");
        } finally {
            setParentLoading(false)
        }
    }

    useEffect(() => {
        fetchSectors();
        fetchCountries();
        fetchCompanies();
    }, []);

    useEffect(() => {
        if (jobId) {
            getScreeningQuestions(jobId)
            return fetchJobById(jobId)
        }
    }, [jobId]);
    return (
        <DashboardLayout>
            <div className="space-y-4 h-full flex flex-col overflow-y-auto">
                <div className='grid md:grid-cols-5 grid-cols-1'>
                    <div className='flex justify-between col-span-3 pr-4 xl:space-x-16 md:space-x-3 md:flex-nowrap flex-wrap'>
                        <div className=''>
                            {step.title && <h1 className='md:text-2xl font-semibold'>{step.title}</h1>}
                            {step.description && <p className='md:text-sm text-muted-foreground font-normal'>{step.description}</p>}
                        </div>
                        {step?.headButton && step?.headButton(countries, sectors, parentLoading)}
                    </div>
                </div>
                <div className='w-full grid grid-cols-5 gap-4 flex-grow overflow-y-auto'>
                    <div className='md:col-span-3 col-span-5 border-r flex flex-col overflow-y-scroll'>
                        <Form {...form}>
                            <div className='col-span-3 mr-4 flex-grow overflow-y-auto'>
                                {
                                    step.step === 1 && <BasicInformation
                                        form={form}
                                        nextStep={nextStep}
                                        sectors={sectors}
                                        countries={countries}
                                        companies={companies}
                                    />
                                }
                                {
                                    step.step === 2 && <JobDetails
                                        form={form}
                                        nextStep={nextStep}
                                        prevStep={prevStep}
                                        loading={parentLoading}
                                    />
                                }
                                {
                                    step.step === 3 && <ScreeningQuestions
                                        form={form}
                                        nextStep={nextStep}
                                        prevStep={prevStep}
                                        loading={parentLoading}
                                        setLoading={setParentLoading}
                                        countries={countries}
                                        sectors={sectors}
                                        disabled={disabledScreening}
                                    />
                                }
                                {
                                    step.step === 4 && <ConfirmAndProceed
                                        disabledScreening={disabledScreening}
                                        form={form}
                                        prevStep={prevStep}
                                        loading={parentLoading}
                                        setLoading={setParentLoading}
                                        updateId={jobId ?? undefined}
                                    />
                                }
                            </div>
                        </Form>
                    </div>
                    <div className='col-span-2 px-2 md:block hidden'>
                        <div className='w-full py-3 px-4 rounded-lg bg-dashboard space-y-2'>
                            <h2 className='text-lg font-semibold'>Job Post Steps</h2>
                            <div className='w-full space-y-2'>
                                {
                                    steps.map((s, index) => (
                                        <div key={index} className={`px-4 py-[6px] bg-dashboard-foreground ${s.done ? '' : ''} rounded-md`}>
                                            <p className={`text-sm font-light  ${s.done ? 'text-destructive' : ''}`}>{s.name}</p>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
