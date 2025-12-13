"use client"

import { useEffect, useState } from "react"
import { ResponseHistorySection } from "./response-history-section"
import type { JobSuggestion } from "./types"
import { JobSuggestionsSection } from "./job-suggestions-section"
import { DashboardLayout } from "@/components/layouts/DashboardLayout"
import { api } from "@/lib/axios/axios"
import { MessageSquare } from "lucide-react"

const mockSuggestions: JobSuggestion[] = [
    {
        id: "1",
        jobTitle: "Senior Frontend Developer",
        company: "TechCorp Inc.",
        description:
            "We are looking for an experienced Frontend Developer to join our dynamic team. You will be responsible for developing user-facing web applications using modern JavaScript frameworks.",
        requirements: ["React", "TypeScript", "CSS3", "3+ years experience"],
        salary: "$80,000 - $100,000",
        location: "San Francisco, CA (Remote)",
        status: "pending",
        receivedDate: "2024-01-15",
        hrContact: {
            name: "Jennifer Smith",
            email: "jennifer.smith@techcorp.com",
        },
    },
    {
        id: "2",
        jobTitle: "Full Stack Developer",
        company: "StartupXYZ",
        description:
            "Join our innovative startup as a Full Stack Developer. Work on cutting-edge projects and help shape the future of our platform.",
        requirements: ["Node.js", "React", "MongoDB", "AWS"],
        salary: "$70,000 - $90,000",
        location: "Austin, TX (Hybrid)",
        status: "accepted",
        receivedDate: "2024-01-12",
        hrContact: {
            name: "David Johnson",
            email: "david.johnson@startupxyz.com",
        },
    },
    {
        id: "3",
        jobTitle: "DevOps Engineer",
        company: "CloudTech Solutions",
        description:
            "We need a skilled DevOps Engineer to help us scale our infrastructure and improve our deployment processes.",
        requirements: ["Docker", "Kubernetes", "AWS", "CI/CD"],
        salary: "$90,000 - $120,000",
        location: "New York, NY (On-site)",
        status: "rejected",
        receivedDate: "2024-01-10",
        hrContact: {
            name: "Sarah Wilson",
            email: "sarah.wilson@cloudtech.com",
        },
    },
]

export default function CandidateDashboard() {
    const [suggestions] = useState<JobSuggestion[]>(mockSuggestions);
    const [loading, setLoading] = useState(false);
    const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
    const respondedSuggestions = suggestions.filter((s) => s.status !== "pending");


    const fetchUserSuggestions = async ({
        disableLoading = false,
    }) => {
        if (!disableLoading) setLoading(true);
        api.get("/api/v1/applicant/sequence-list")
            .then((response) => {
                const data = response.data as JobSuggestion[];
                // setSuggestions(data);
                console.log("Fetched job suggestions:", data);
            })
            .catch((error) => {
                console.error("Error fetching job suggestions:", error);
            })
            .finally(() => {
                if (!disableLoading) setLoading(false);
            }
            );
    };

    useEffect(() => {
        fetchUserSuggestions({ disableLoading: false });
    }, [])
    return (
        <DashboardLayout>
            <div className="min-h-screen ">
                <div className="container mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <h1 className="text-3xl font-bold">Hr Added Jobs</h1>
                    </div>

                    {loading ? <div className="text-center py-8 text-muted-foreground animate-pulse">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/80" />
                        <p>Loading Response</p>
                        <p className="text-sm">Your responses will appear here</p>
                    </div> : <div className="grid lg:grid-cols-2 gap-8">
                        <JobSuggestionsSection suggestions={pendingSuggestions} />
                        <ResponseHistorySection suggestions={respondedSuggestions} />
                    </div>}
                </div>
            </div>
        </DashboardLayout>
    )
}
