import React, { useEffect, useState } from 'react'
import { useAppSelector } from "@/lib/store";
import { shallowEqual } from "react-redux";
import JobCard from "@/components/custom-UI/Card/JobCard";
import CourseCard from "@/components/custom-UI/Card/ClassicCard";
import CustomCalendar from "@/components/ui/CustomCalendar";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { formatDateTime } from "@/lib/utils";
import ResumeScoreCard from './ResumeCard';
import PlanCard from './PlanCard';
import ProfileCompetitionCard from './ProfileCompletetionCard';
import CardSlider from './CardSlider';
import { api, axiosInstance } from '@/lib/axios/axios';
import { Job } from '../jobs/(index)/page';

export interface InterviewSchedule {
    start_time: string; // ISO or date string format e.g. "2025-07-16 10:00:00"
    end_time: string;
    job_post_title: string;
    company_name: string;
    company_logo: string | null;
}

export interface ResumeAnalysis {
    resume_score: string;         // e.g. "30%"
    resume_structure: string;     // e.g. "65%"
    measurable_results: string;   // e.g. "23%"
}

export type JobDashboardStats = {
    profile_completion: string;            // e.g. "79%"
    total_applied_jobs: number;
    total_rejected_jobs: number;
    total_offered_jobs: number;
    total_interview_scheduled: number;
    interview_schedules: InterviewSchedule[];
    resume_analysis: ResumeAnalysis;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // Allow additional properties
}


const JOBS_GET_API_ENDPOINT = "/api/v1/suggest-job";
const colors: string[] = ["#D9A000", "#2DB867", "#007DFC", "#FD513A"]
export default function SeekerDashboard() {
    const { user_first_name, user_id } = useAppSelector((state) => ({ user_first_name: state.auth.user?.user_first_name, user_id: state.auth.user?.id }), shallowEqual);
    const [jobsData, setJobsData] = useState<Job[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>();
    const [schedule, setSchedule] = useState<InterviewSchedule[]>([]);
    const [loadings, setLoadings] = useState<{
        [key: string]: boolean;
    }>({
        suggested_jobs: false,
        recommended_courses: false,
        resume_score: false,
        profile_completion: false,
        calendar: false,
    });

    const [dashboardData, setDashboardData] = useState<JobDashboardStats>({
        profile_completion: "0%",
        total_applied_jobs: 0,
        total_rejected_jobs: 0,
        total_offered_jobs: 0,
        total_interview_scheduled: 0,
        interview_schedules: [],
        resume_analysis: {
            resume_score: "0%",
            resume_structure: "0%",
            measurable_results: "0%"
        }
    });





    const courseData = [
        {
            "title": "React Developer Certification",
            "companyName": "Meta",
            "companyIcon": null,
            "certificateType": "Professional Certificate",
            "courseLink": "https://coursera.org/meta-react",
            "courseBanner": null
        },
        {
            "title": "Google UX Design",
            "companyName": "Google",
            "companyIcon": null,
            "certificateType": "Professional Certificate",
            "courseLink": "https://coursera.org/google-ux",
            "courseBanner": null
        },
        {
            "title": "AWS Cloud Practitioner",
            "companyName": "Amazon Web Services",
            "companyIcon": null,
            "certificateType": "Foundation Certificate",
            "courseLink": "https://aws.amazon.com/certification/certified-cloud-practitioner/",
            "courseBanner": null
        },
        {
            "title": "AI for Everyone",
            "companyName": "DeepLearning.AI",
            "companyIcon": null,
            "certificateType": "Short Course",
            "courseLink": "https://coursera.org/ai-for-everyone",
            "courseBanner": null
        },
        {
            "title": "Data Science Professional",
            "companyName": "IBM",
            "companyIcon": null,
            "certificateType": "Professional Certificate",
            "courseLink": "https://coursera.org/ibm-data-science",
            "courseBanner": null
        },
        {
            "title": "Python for Everybody",
            "companyName": "University of Michigan",
            "companyIcon": null,
            "certificateType": "Specialization",
            "courseLink": "https://coursera.org/python",
            "courseBanner": null
        },
        {
            "title": "Machine Learning",
            "companyName": "Stanford University",
            "companyIcon": null,
            "certificateType": "Single Course",
            "courseLink": "https://coursera.org/ml-stanford",
            "courseBanner": null
        },
        {
            "title": "Front-End Developer",
            "companyName": "Meta",
            "companyIcon": null,
            "certificateType": "Professional Certificate",
            "courseLink": "https://coursera.org/meta-frontend",
            "courseBanner": null
        },
        {
            "title": "Google IT Support",
            "companyName": "Google",
            "companyIcon": null,
            "certificateType": "Professional Certificate",
            "courseLink": "https://coursera.org/google-it",
            "courseBanner": null
        },
        {
            "title": "Java Programming",
            "companyName": "Duke University",
            "companyIcon": null,
            "certificateType": "Specialization",
            "courseLink": "https://coursera.org/java-duke",
            "courseBanner": null
        },
        {
            "title": "DevOps Engineer",
            "companyName": "IBM",
            "companyIcon": null,
            "certificateType": "Professional Certificate",
            "courseLink": "https://coursera.org/ibm-devops",
            "courseBanner": null
        },
        {
            "title": "Cybersecurity Fundamentals",
            "companyName": "University of Maryland",
            "companyIcon": null,
            "certificateType": "Short Course",
            "courseLink": "https://coursera.org/umd-cyber",
            "courseBanner": null
        },
        {
            "title": "Google Digital Marketing",
            "companyName": "Google",
            "companyIcon": null,
            "certificateType": "Professional Certificate",
            "courseLink": "https://coursera.org/google-digital-marketing",
            "courseBanner": null
        },
        {
            "title": "iOS App Development",
            "companyName": "University of Toronto",
            "companyIcon": null,
            "certificateType": "Specialization",
            "courseLink": "https://coursera.org/ios-toronto",
            "courseBanner": null
        },
        {
            "title": "Excel Skills for Business",
            "companyName": "Macquarie University",
            "companyIcon": null,
            "certificateType": "Specialization",
            "courseLink": "https://coursera.org/excel-macquarie",
            "courseBanner": null
        },
        {
            "title": "Full-Stack Engineer",
            "companyName": "Meta",
            "companyIcon": null,
            "certificateType": "Professional Certificate",
            "courseLink": "https://coursera.org/meta-fullstack",
            "courseBanner": null
        },
        {
            "title": "Cybersecurity Analyst",
            "companyName": "IBM",
            "companyIcon": null,
            "certificateType": "Professional Certificate",
            "courseLink": "https://coursera.org/ibm-cybersecurity",
            "courseBanner": null
        },
        {
            "title": "Project Management",
            "companyName": "Google",
            "companyIcon": null,
            "certificateType": "Professional Certificate",
            "courseLink": "https://coursera.org/google-project",
            "courseBanner": null
        },
        {
            "title": "Blockchain Basics",
            "companyName": "University at Buffalo",
            "companyIcon": null,
            "certificateType": "Short Course",
            "courseLink": "https://coursera.org/blockchain-basics",
            "courseBanner": null
        },
        {
            "title": "Computer Vision with TensorFlow",
            "companyName": "DeepLearning.AI",
            "companyIcon": null,
            "certificateType": "Specialization",
            "courseLink": "https://coursera.org/tensorflow-cv",
            "courseBanner": null
        }
    ]


    const progressCount: {
        name: string;
        color?: string;
        key: string;
    }[] = [
            {
                name: "Applied Jobs",
                key: "total_applied_jobs",
                color: colors[0]
            },
            {
                name: "Interview Scheduled",
                color: colors[1],
                key: "total_interview_scheduled"
            },
            {
                name: "Offer Received",
                color: colors[2],
                key: "total_offered_jobs"
            },
            {
                name: "Rejected Jobs",
                color: colors[3],
                key: "total_rejected_jobs"
            },
        ]

    function getRecommendedJobs({ applyLoading = true }: { applyLoading?: boolean }) {
        if (applyLoading) {
            setLoadings((prev) => ({
                ...prev,
                suggested_jobs: true,
            }));
        }
        const params: Record<string, string> = {};
        params["user_id"] = user_id ? String(user_id) : "";
        const query = new URLSearchParams(params).toString();
        axiosInstance.get(`${JOBS_GET_API_ENDPOINT}${query ? `?${query}` : ""}`)
            .then((response) => {
                console.log(response.data.data);
                setJobsData(response.data.data);
            })
            .catch((error) => {
                console.error("Error fetching recommended jobs:", error);
            })
            .finally(() => {
                setLoadings((prev) => ({
                    ...prev,
                    suggested_jobs: false,
                }));
            }
            );
    }
    function getEarliestStartTime(schedules: InterviewSchedule[]): string | null {
        if (schedules.length === 0) return null;

        const sorted = [...schedules].sort((a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );

        return sorted[0].start_time;
    }
    function fetchDashboardData() {
        api.get("/api/v1/job-seeker-dashboard")
            .then((res) => {
                setDashboardData(res.data?.data);
                const date = getEarliestStartTime(res.data?.data.interview_schedules);
                if (date) setSelectedDate(new Date(date));
            })
            .catch((er) => {
                console.log("Error fetching dashboard data", er);
            })
            .finally();
    };
    function getSchedulesByDate(
        schedules: InterviewSchedule[],
        targetDate: Date
    ): InterviewSchedule[] {
        const pad = (n: number) => n.toString().padStart(2, "0")

        const formattedTargetDate = `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}`

        return schedules.filter(schedule =>
            schedule.start_time.slice(0, 10) === formattedTargetDate
        )
    }

    function getInitials(name: string): string {
        return name
            .split(" ")
            .filter(word => word.length > 0)
            .map(word => word[0].toUpperCase())
            .join("")
    }

    useEffect(() => {
        getRecommendedJobs({ applyLoading: true });
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            const interviews = getSchedulesByDate(dashboardData.interview_schedules, selectedDate);
            setSchedule(interviews);
        }
    }, [selectedDate])

    return (
        <div className="space-y-4">
            <div>
                <h2 className="font-bold text-slate-600 dark:text-primary"> Hi {user_first_name},</h2>
                <h1 className="lg:text-5xl text-3xl text-[#2B3674] dark:text-primary font-semibold">Welcome to Wanted.Ai!</h1>
            </div>
            <div className="lg:grid grid-cols-8 gap-4 rounded-lg justify-end">
                {/* Cards */}
                <div className="lg:col-span-6 col-span-8 space-y-4">
                    <div className="w-full grid grid-cols-4 gap-4 col-span-1">
                        {
                            progressCount.map(({ key, name, color = "" }: { key: string, name: string, color?: string }, index: number) => (
                                <div key={`key-${index}`} className="md:col-span-1 p-4 bg-background rounded-lg border text-center col-span-2">
                                    <p className="md:text-2xl font-bold text-xl">{dashboardData[key]}</p>
                                    <p style={
                                        color ? { color } : undefined
                                    } className={`dark:text-muted-foreground`}>{name}</p>
                                </div>
                            ))
                        }
                    </div>
                    <div className="w-full grid md:grid-cols-3 sm:grid-cols-2 gap-4 col-span-1">
                        <div className="w-full">
                            <div className="space-y-3 border p-3 rounded-lg">
                                <CustomCalendar passSelectedDate={setSelectedDate} initialDate={selectedDate ?? undefined} />
                                <hr />
                                <div className="flex-grow">
                                    {
                                        schedule.map((date) => (<div key={date.start_time} className="border rounded-lg p-3 max-h-16 flex items-center justify-start gap-3 bg-muted-foreground/10">
                                            <div className="w-8 border rounded-full h-8">
                                                <Avatar className="w-full h-full ">
                                                    <AvatarImage src={date.company_logo ?? "/images/avatar.png"} alt="User Avatar" />
                                                    <AvatarFallback className='text-center'>{getInitials(date.company_name)}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div>
                                                <p className="text-xs  text-muted-foreground line-clamp-1 text-ellipsis">{formatDateTime(new Date(date.start_time))}</p>
                                                <p className="text-sm font-medium line-clamp-1 text-ellipsis">
                                                    {date.job_post_title}
                                                </p>
                                            </div>
                                        </div>))
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="">
                            <ResumeScoreCard
                                resumeScore={Number(dashboardData.resume_analysis.resume_score.replace("%", ""))}
                                structureScore={Number(dashboardData.resume_analysis.resume_structure.replace("%", ""))}
                                resultsScore={Number(dashboardData.resume_analysis.measurable_results.replace("%", ""))}
                            />
                        </div>
                        <div className="">
                            <PlanCard />
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <ProfileCompetitionCard complete={Number(dashboardData.profile_completion.replace("%", ""))} inComplete={100 - Number(dashboardData.profile_completion.replace("%", ""))} />
                </div>
            </div>
            <div className="max-w-full">
                {!loadings.suggested_jobs && <CardSlider
                    title="Recommended jobs"
                >
                    {
                        jobsData.map((job, index) => (<JobCard
                            key={index}
                            icon={job.logo}
                            jobTitle={job.title}
                            salaryRange={job.salary_range}
                            companyName={job.companyname}
                            location={job.location}
                            jobType={job.job_type}
                            id={job.id}
                            marked={false}
                        />))
                    }
                </CardSlider>}
            </div>
            <div className="max-w-full">
                <CardSlider
                    title="Recommended Courses"
                >
                    {
                        courseData.map((course, index) => (<CourseCard
                            key={index}
                            title={course.title}
                            companyName={course.companyName}
                            companyIcon={course.companyIcon}
                            certificateType={course.certificateType}
                            courseLink={course.courseLink}
                            courseBanner={course.courseBanner}
                        />))
                    }
                </CardSlider>
            </div>
        </div>
    )
}
