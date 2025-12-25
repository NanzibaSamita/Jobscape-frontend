"use client"
import JobCard from '@/components/custom-UI/Card/JobCard'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import React from 'react'
import imageUpload from '@/public/images/hero-banner.png'
import CourseCard from '@/components/custom-UI/Card/ClassicCard'
import ProgressCardHalf from '@/components/ui/ProgressCardHalf'
import CustomCalendar from '@/components/ui/CustomCalendar'
import Table from '@/components/custom-UI/Table'
import { formatDateTime } from '@/lib/utils'

const TABLE_CONFIG = [
    {
        title: "Input Date",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Comp: (d: any) => (
            <p className="text-sm font-medium p-3">
                {formatDateTime(new Date(d.input_date)) || "N/A"}
            </p>
        ),
    },
    {
        title: "Data Of",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Comp: (d: any) => (
            <p className="text-sm font-medium p-3">
                {d?.data_month || ""} {d?.year}
            </p>
        ),
    },
    {
        title: "TMV",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Comp: (d: any) => (
            <div className="p-3">
                <p className="text-sm font-medium">Actual: {d?.tmv_actual || ""}</p>
                <p className="text-sm font-medium">
                    Provisional: {d?.tmv_provisional || ""}
                </p>
            </div>
        ),
    },
    {
        title: "RAL",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Comp: (d: any) => (
            <div className="p-3">
                <p className="text-sm font-medium">Actual: {d?.ral_actual || ""}</p>
                <p className="text-sm font-medium">
                    Provisional: {d?.ral_provisional || ""}
                </p>
            </div>
        ),
    },
    {
        title: "RML",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Comp: (d: any) => (
            <div className="p-3">
                <p className="text-sm font-medium">Actual: {d?.rml_actual || ""}</p>
                <p className="text-sm font-medium">
                    Provisional: {d?.rml_provisional || ""}
                </p>
            </div>
        ),
    },
    {
        title: "RVT",
        path: "rvt_actual"
    },
];
const tableData = [
    {
        input_date: "2025-07-06T10:00:00Z",
        data_month: "June",
        year: 2025,
        tmv_actual: 1200,
        tmv_provisional: 1250,
        ral_actual: 800,
        ral_provisional: 820,
        rml_actual: 950,
        rml_provisional: 970,
        rvt_actual: 600,
    },
    {
        input_date: "2025-06-01T09:30:00Z",
        data_month: "May",
        year: 2025,
        tmv_actual: 1100,
        tmv_provisional: 1150,
        ral_actual: 750,
        ral_provisional: 780,
        rml_actual: 900,
        rml_provisional: 910,
        rvt_actual: 590,
    },
    {
        input_date: "2025-05-15T14:45:00Z",
        data_month: "April",
        year: 2025,
        tmv_actual: 1000,
        tmv_provisional: 1020,
        ral_actual: 700,
        ral_provisional: 720,
        rml_actual: 850,
        rml_provisional: 860,
        rvt_actual: 580,
    }
];

export default function Page() {
    return (
        <DashboardLayout>
            <div className='flex flex-wrap rounded-2xl h-full'>
                <JobCard
                    id="1"
                    icon={imageUpload.src}
                    jobTitle="Software Engineer"
                    salaryRange="$60,000 - $80,000"
                    companyName="Amazon"
                    location="Seattle, WA"
                    jobType="Full-time"
                />
                <CourseCard
                    title="Introduction to React"
                    companyName="Udemy"
                    companyIcon={imageUpload.src}
                    certificateType="Certificate of Completion"
                    courseLink="#"
                    courseBanner={imageUpload.src}
                />
                <div className='border w-48 h-48'>
                    <ProgressCardHalf
                        completionPercentage={75}
                    >
                        <div className="text-3xl font-bold text-gray-900">{75}%</div>
                        <div className="bg-red-100 text-red-500 text-xs font-medium px-3 py-1 rounded-full">
                            -{25}%
                        </div>
                    </ProgressCardHalf>
                </div>
                <div className='w-1/3'>
                    <CustomCalendar />
                </div>
            </div>
            <Table
                data={tableData}
                config={TABLE_CONFIG}
                selectSystem={false}
                showSerial={false}
                inPageItems={10}
                currentPage={1}
                Action={null}
                styles={undefined}
                handleChecked={undefined}
                isLoading={false}
            />
        </DashboardLayout>
    )
}
