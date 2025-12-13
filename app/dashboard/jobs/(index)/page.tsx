"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/layouts/DashboardLayout"
import { JobCard } from "../JobCard"
import { MoreFiltersModal } from "../MoreFilterModal"
import { api } from "@/lib/axios/axios"
import CreateNewJob from "../CreateNewJob"

const JOB_API_ENDPOINT = "/api/v1/recruiter-job-posts";
type JobPost = {
    id: number;
    company_id: number;
    recruiter_id: number;
    sector_id: number;
    title: string;
    level: string | null;
    location: string;
    job_type: string;
    job_mode: string;
    vacancies: string;
    job_responsibility: string;
    job_requirements: string;
    must_have_skills: string | null;
    nice_to_have_skills: string | null;
    required_certifications: string | null;
    description: string;
    salary_range: string;
    job_post_status_id: number | null;
    company_name: string;
    sector_name: string;
    recruiter_full_name: string;
    job_post_created_by_full_name: string;
    job_post_updated_by_full_name: string;
    created_at: string; // use `Date` if you parse it into a real Date object
    updated_at: string; // same here
    job_post_status: string;
    applications: number | string;
    deadline: string ;
};
export default function JobPortalPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [jobs, setJobs] = useState<JobPost[]>([])
    const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false)
    const [moreFilters, setMoreFilters] = useState({
        dateRange: "all",
        salaryMin: 0,
        salaryMax: 0,
        jobTypes: [] as string[],
        sectors: [] as string[],
        locations: [] as string[],
        jobModes: [] as string[],
        levels: [] as string[],
        statusIds: [] as number[],
    })
    const [appliedFilters, setAppliedFilters] = useState(moreFilters)


    const filteredJobs = jobs.filter((job) => {
        const matchesSearch =
            job?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
            job.company_name.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || job.job_post_status_id?.toString() === statusFilter

        // Advanced filters
        const matchesJobType = appliedFilters.jobTypes.length === 0 || appliedFilters.jobTypes.includes(job.job_type)

        const matchesSector = appliedFilters.sectors.length === 0 || appliedFilters.sectors.includes(job.sector_name)

        const matchesLocation = appliedFilters.locations.length === 0 || appliedFilters.locations.includes(job.location)

        const matchesJobMode = appliedFilters.jobModes.length === 0 || appliedFilters.jobModes.includes(job.job_mode)

        const matchesLevel = appliedFilters.levels.length === 0 || (job.level && appliedFilters.levels.includes(job.level))

        const matchesStatusId =
            appliedFilters.statusIds.length === 0 ||
            (job.job_post_status_id && appliedFilters.statusIds.includes(job.job_post_status_id))

        // Salary range matching
        const salaryMatch = () => {
            if (appliedFilters.salaryMin === 0 && appliedFilters.salaryMax === 0) return true
            const salaryNumbers = job.salary_range.match(/\d+,?\d*/g)
            if (!salaryNumbers) return true
            const minSalary = Number.parseInt(salaryNumbers[0].replace(",", "")) * 1000
            const maxSalary = Number.parseInt(salaryNumbers[1]?.replace(",", "") || salaryNumbers[0].replace(",", "")) * 1000

            if (appliedFilters.salaryMin > 0 && maxSalary < appliedFilters.salaryMin) return false
            if (appliedFilters.salaryMax > 0 && minSalary > appliedFilters.salaryMax) return false
            return true
        }

        // Date range matching
        const matchesDateRange = () => {
            if (appliedFilters.dateRange === "all") return true
            const postedDate = new Date(job.created_at)
            const now = new Date()
            const daysDiff = Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24))

            switch (appliedFilters.dateRange) {
                case "today":
                    return daysDiff === 0
                case "week":
                    return daysDiff <= 7
                case "month":
                    return daysDiff <= 30
                case "quarter":
                    return daysDiff <= 90
                default:
                    return true
            }
        }

        return (
            matchesSearch &&
            matchesStatus &&
            matchesJobType &&
            matchesSector &&
            matchesLocation &&
            matchesJobMode &&
            matchesLevel &&
            matchesStatusId &&
            salaryMatch() &&
            matchesDateRange()
        )
    })

    const handleApplyFilters = () => {
        setAppliedFilters(moreFilters)
        setIsMoreFiltersOpen(false)
    }

    const handleClearFilters = () => {
        const clearedFilters = {
            dateRange: "all",
            salaryMin: 0,
            salaryMax: 0,
            jobTypes: [] as string[],
            sectors: [] as string[],
            locations: [] as string[],
            jobModes: [] as string[],
            levels: [] as string[],
            statusIds: [] as number[],
        }
        setMoreFilters(clearedFilters)
        setAppliedFilters(clearedFilters)
    }

    function getJobs() {
        api.get(JOB_API_ENDPOINT)
            .then((response) => {
                setJobs(response.data.data)
                // console.log("Jobs fetched successfully:", response.data.data)
            })
            .catch((error) => {
                console.error("Failed to fetch jobs:", error)
            })
    }
    function convertJobPost(job: JobPost): {
        id: string
        title: string
        company: string
        department: string
        location: string
        employmentType: string
        salaryRange: string
        applicants: number
        postedDate: string
        status: "active" | "draft" | "closed"
        applications: number
        deadline: string;
        expired: boolean;
    } {
        const statusMap: Record<number, "active" | "draft" | "closed"> = {
            1: "active",
            2: "draft",
            3: "closed",
        };

        return {
            id: String(job.id),
            title: job.title,
            company: job.company_name,
            department: job.sector_name,
            location: job.location,
            employmentType: `${job.job_type} (${job.job_mode})`,
            salaryRange: job.salary_range,
            applicants: 0, // You can fetch or calculate this separately
            applications: Number(job.applications ?? 0), // You can update this as needed
            postedDate: new Date(job.created_at).toLocaleDateString(), // e.g., "7/8/2025"
            status: statusMap[job.job_post_status_id ?? 1] || "draft", // fallback to draft
            deadline: new Date(job.deadline).toLocaleDateString(), // Assuming you want to show the created date as deadline
            expired: new Date(job.deadline).getTime() < new Date().getTime(), // Check if the deadline is in the past
        };
    }
    useEffect(() => {
        getJobs()
    }, [])

    return (
        <DashboardLayout>
            <div className="flex-1">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">My Job Posts</h1>
                            <p className="text-muted-foreground">Manage and track your job postings</p>
                        </div>
                        <CreateNewJob />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4 p-4 rounded-lg border">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search jobs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="1">Active</SelectItem>
                                <SelectItem value="2">Draft</SelectItem>
                                <SelectItem value="3">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                        {/* <Button
                            variant="outline"
                            className="flex items-center gap-2 bg-transparent"
                            onClick={() => setIsMoreFiltersOpen(true)}
                        >
                            <Filter className="h-4 w-4" />
                            More Filters
                        </Button> */}
                    </div>

                    {/* Job Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg border">
                            <div className="text-2xl font-bold">{jobs.length}</div>
                            <div className="text-sm text-gray-600">Total Jobs</div>
                        </div>
                        <div className="p-4 rounded-lg border">
                            <div className="text-2xl font-bold">
                                {jobs.filter((job) => job?.job_post_status_id?.toString() === "1").length}
                            </div>
                            <div className="text-sm text-gray-600">Active Jobs</div>
                        </div>
                        <div className="p-4 rounded-lg border">
                            <div className="text-2xl font-bold">
                                {jobs.reduce((sum, job) => sum + Number(job.applications ?? 0), 0)}
                            </div>
                            <div className="text-sm text-gray-600">Total Applications</div>
                        </div>
                        <div className="p-4 rounded-lg border">
                            <div className="text-2xl font-bold">
                                {jobs.filter((job) => job?.job_post_status_id?.toString() === "2").length}
                            </div>
                            <div className="text-sm text-gray-600">Draft Jobs</div>
                        </div>
                    </div>

                    {/* Job List */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredJobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={convertJobPost(job)}
                            />
                        ))}
                    </div>

                    {filteredJobs.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-lg">No jobs found</div>
                            <div className="text-muted-foreground text-sm mt-2">Try adjusting your search or filters</div>
                        </div>
                    )}
                </div>
            </div>

            {/* More Filters Modal */}
            <MoreFiltersModal
                isOpen={isMoreFiltersOpen}
                onClose={() => setIsMoreFiltersOpen(false)}
                filters={moreFilters}
                onFiltersChange={setMoreFilters}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
            />
        </DashboardLayout>
    )
}
