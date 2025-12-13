"use client";

import { useEffect, useState } from "react";
import { AiIcon } from "@/assets/svg";
import StarButton from "@/components/custom-UI/Buttons/StarButton";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import JobCard from "../JobCard";
import { useAppSelector } from "@/lib/store";
import { shallowEqual } from "react-redux";
import { api } from "@/lib/axios/axios";

export type Job = {
    id: number;
    title: string;
    must_have_skills: string;
    nice_to_have_skills: string;
    level: string;
    salary_range: string;
    companyname: string;
    logo: string | null;
    created_at: string;
    job_type: string;
    location: string;
    has_applied?: boolean;
};

const DEFAULT_API = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/show-all-jobs`;
const SUGGEST_API = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/suggest-job`;



export default function Page() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const { id } = useAppSelector((state) => ({ id: state.auth.user?.id }), shallowEqual);

    const fetchJobs = async (searchQuery = "", suggested = false) => {
        setLoading(true);
        try {
            const baseUrl = suggested ? `${SUGGEST_API}?user_id=${id}` : DEFAULT_API;
            const url = suggested ? baseUrl : `${baseUrl}?search=${encodeURIComponent(searchQuery)}`;
            api.get(url)
                .then((res) => {
                    setJobs(res.data?.data || []);
                })
                .catch((err) => {
                    console.error("Error fetching dashboard data:", err);
                })
                .finally(() => {

                });
            // const res = await fetch(url, { cache: "no-store" });
            // const data = await res.json();
            // setJobs(data?.data || []);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (search === "") {
            fetchJobs();
            return;
        }
    }, [search]);

    const handleSearch = () => {
        fetchJobs(search);
    };

    const handleSuggest = () => {
        fetchJobs("", true);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col items-center h-full">
                <div className="w-full px-0 xs:px-0 sm:px-14 md:px-12 lg:px-32 xl:px-40 flex flex-col h-full space-y-4">
                    <h1 className="text-xl md:text-2xl font-semibold">Job Findings</h1>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                        <div className="flex-grow flex items-center gap-4 sm:border md:border rounded-full  sm:px-4 px-0 py-2 sm:shadow shadow-none md:shadow-xl sm:flex-nowrap flex-wrap border-0">
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="sm:border-0 border shadow-none outline-none ring-0 focus-visible:ring-0 focus-visible:outline-none rounded-full"
                                placeholder="Search for jobs..."
                            />
                            <div className="flex gap-2 items-center">
                                <Button variant="ghost" className="font-semibold text-muted-foreground border sm:border-none" onClick={handleSearch}>
                                    Search
                                </Button>
                                <StarButton onClick={handleSuggest}>
                                    <p className="bg-black text-white px-4 py-1 rounded-full flex items-center gap-2 font-semibold">
                                        <AiIcon className="w-6 h-6" /> Suggest
                                    </p>
                                </StarButton>
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow space-y-3 overflow-y-auto w-full">
                        {loading ? (
                            <p>Loading jobs...</p>
                        ) : jobs.length > 0 ? (
                            jobs.map((job) => <JobCard key={job.id} job={job} />)
                        ) : (
                            <p>No job data found.</p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
