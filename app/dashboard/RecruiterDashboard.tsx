import { useUI } from '@/contexts/ui-context';
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { api, axiosInstance } from "@/lib/axios/axios";
import { toast } from "react-toastify";
import CreateCompanyForm from './(index)/CreateCompany';
import { useAppSelector } from '@/lib/store';
import { shallowEqual } from 'react-redux';
import BlackStyleButton from '@/components/custom-UI/Buttons/BlackStyleButton';
import Table from '@/components/custom-UI/Table';
import { useRouter } from 'next/navigation';
import WhiteStyleButton from '@/components/custom-UI/Buttons/WhiteStyleButton';
import CustomCalendar from '@/components/ui/CustomCalendar';

const SECTOR_GET_API_ENDPOINT = "/api/v1/sector-select";
const COUNTRY_GET_API_ENDPOINT = "/api/v1/country-select";
const COMPANY_API_ENDPOINT = "/api/v1/companies";

interface FormData {
    name: string
    country_id: string
    sector_id: string
};

export interface JobPostSummary {
    id: number
    location: string
    job_post_status_id: number | null
    status_name: string | null
    applicant_count: number
}

export interface HiringDashboardStats {
    active_job_posts_count: number
    total_job_applications_count: number
    screening_stats: number
    average_time_to_hire: number
    offer_acceptance_rate: number
    active_job_posts: JobPostSummary[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
}

const colors: string[] = ["#D9A000", "#2DB867", "#28B5F1", "#007DFC", "#FD513A"]
const progressCount: {
    name: string;
    key: string;
    color?: string;
}[] = [
        {
            name: "Active Jobs",
            key: "active_job_posts_count",
            color: colors[0]
        },
        {
            name: "Total Applications",
            key: "total_job_applications_count",
            color: colors[1]
        },
        {
            name: "Screening Stats",
            key: "screening_stats",
            color: colors[2]
        },
        {
            name: "Average Time To Hire ",
            key: "average_time_to_hire",
            color: colors[3]
        },
        {
            name: "Offer Acceptance Rate",
            key: "offer_acceptance_rate",
            color: colors[3]
        },
    ]
const TABLE_CONFIG_JOBS = [
    {
        title: "Job title",
        path: "title",
    },
    {
        title: "Applicants",
        path: "applicant_count",
    },
    {
        title: "Status",
        path: "status",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Comp: (row: any) => (
            <p className="text-sm font-medium text-muted-foreground px-3 py-2">
                {row.status || "Pending"}
            </p>
        ),
    },
    {
        title: "Location",
        path: "location",

    },
];

export default function RecruiterDashboard() {
    const { user_first_name } = useAppSelector((state) => ({ user_first_name: state.auth.user?.user_first_name }), shallowEqual);
    const [dashboardData, setDashboardData] = useState<HiringDashboardStats>({
        active_job_posts_count: 0,
        total_job_applications_count: 0,
        screening_stats: 0,
        average_time_to_hire: 0,
        offer_acceptance_rate: 0,
        active_job_posts: []
    });
    const [countries, setCountries] = useState<{
        id: number;
        name: string;
    }[]>([]);
    const [createLoading, setCreateLoading] = useState(false);
    const [sectors, setSectors] = useState<{
        id: number;
        name: string;
    }[]>([]);
    const { openModal, closeModal } = useUI();
    const [fetchJobLoading, setFetchJobLoading] = useState(false);
    const router = useRouter();

    function fetchCountries() {
        axiosInstance
            .get(COUNTRY_GET_API_ENDPOINT, {
                signal: new AbortController().signal,
            })
            .then((res) => {
                setCountries(res.data?.data?.map(({ id, country_name }: { id: string, country_name: string }) => ({ id, name: country_name })) || []);
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



    function createCompany(data: FormData) {
        setCreateLoading(true);
        api
            .post(COMPANY_API_ENDPOINT, data)
            .then(() => {
                toast.success("Company created successfully!");
            })
            .catch(() => {
                toast.error("An error occurred while creating the company.");
            })
            .finally(() => {
                setCreateLoading(false);
            });
    }

    function fetchDashboardData() {
        setFetchJobLoading(true);
        api.get("/api/v1/recruiter-dashboard")
            .then((res) => {
                setDashboardData(res.data?.data);
            })
            .catch((err) => {
                console.error("Error fetching dashboard data:", err);
            })
            .finally(() => {
                setFetchJobLoading(false);
            });
    }

    useEffect(() => {
        fetchCountries();
        fetchSectors();
        fetchDashboardData()
    }, [])

    return (
        <div className='space-y-4'>
            <div className='flex justify-between items-center gap-3 flex-wrap sm:flex-nowrap'>
                <div>
                    <h2 className="font-bold text-slate-600 dark:text-primary"> Hi {user_first_name},</h2>
                    <h1 className="lg:text-3xl text-xl text-[#2B3674] dark:text-primary font-semibold">Welcome to Organization Dashboard!</h1>
                </div>
                <div className='flex gap-4 flex-wrap sm:flex-nowrap'>
                    <WhiteStyleButton
                        title="Create Company"
                        customStyles={{
                            button: {
                                padding: "0.01rem 0.5rem"
                            }
                        }}
                        onClick={() => openModal("companyCreate",
                            <CreateCompanyForm
                                keyIs="companyCreate"
                                closeModal={closeModal}
                                handelSubmit={(data) => createCompany(data)}
                                countries={countries}
                                sectors={sectors}
                                createLoading={createLoading}
                            />
                        )}
                    />
                    <BlackStyleButton
                        title="Create Job Post"
                        customStyles={{
                            button: {
                                padding: "0.01rem 0.5rem"
                            }
                        }}
                        onClick={() => router.push("/dashboard/create-job")}
                    />
                </div>
            </div>

            <div className="w-full grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-4">
                {
                    progressCount.map(({ key, name, color = "" }, index: number) => (
                        <div key={`key-${index}`} className="col-span-1 p-4 bg-background rounded-lg border text-center">
                            <p className="md:text-2xl font-bold text-xl">{dashboardData[key]}</p>
                            <p style={
                                color ? { color } : undefined
                            } className={`dark:text-muted-foreground`}>{name}</p>
                        </div>
                    ))
                }
            </div>

            <div className='flex gap-4 justify-between items-start xl:flex-nowrap flex-wrap w-full' >
                <div className='w-80 border p-2 rounded-lg' >
                    <CustomCalendar initialDate={new Date()} />
                </div>
                <div className="flex gap-4 flex-1 items-start md:flex-nowrap flex-wrap  w-full">
                    <div className="w-full md:rounded-xl ">
                        <div className='flex justify-between items-center w-full bg-[#F7FBFF] dark:bg-[#212222] px-3 pt-2 '>
                            <p className="md:text-lg md:font-semibold text-base font-medium">Active jobs</p>
                            <Button onClick={() => router.push('/dashboard/jobs')} variant={"ghost"} className='p-0 text-sm font-medium text-blue-500 dark:text-muted-foreground hover:bg-transparent hover:text-muted-foreground'>Show more</Button>
                        </div>
                        <div className='w-full overflow-x-auto  max-h-[25.5rem]'>
                            <Table
                                data={dashboardData?.active_job_posts.length ? dashboardData?.active_job_posts : []}
                                config={TABLE_CONFIG_JOBS}
                                selectSystem={false}
                                showSerial={false}
                                inPageItems={10}
                                currentPage={1}
                                Action={null}
                                styles={undefined}
                                handleChecked={undefined}
                                isLoading={fetchJobLoading}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
