"use client"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/axios/axios';
import { Archive, Clock, Edit, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'react-toastify';

const CHANGE_JOB_STATUS = "/api/v1/job-post-status-change"; // Action type for changing job status
export default function TabActions({
    jobId,
    isPublished = true,
    isOverdue = true,
    status // Assuming 0 means draft or unpublished
}: {
    jobId: string | number;
    status: string;
    isPublished?: boolean;
    isOverdue?: boolean;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    function redirect(rui: string) {
        router.push(rui)
    }

    async function changeStatus(query: string, value: string) {
        setLoading(true);
        const params: { [key: string]: string } = {};
        params[query] = value;
        const queryStr = new URLSearchParams(params).toString();
        await api.post(CHANGE_JOB_STATUS + "?" + queryStr, {
            job_post_id: jobId,
        }).then(() => {
            toast.success("Preference saved successfully!");
            redirect(`/dashboard/jobs`);
        })
            .catch((error) => {
                console.error("Update failed:", error);
                const msg =
                    error?.response?.data?.message ||
                    "Something went wrong while updating profile.";
                toast.error(msg);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    console.log(status !== "3", "job_post_status_id", status);
    return (

        <div className="flex gap-2 justify-start sm:flex-nowrap flex-wrap">
            <Button disabled={loading} onClick={() => redirect(`/dashboard/create-job?job_id=${jobId}`)} variant="outline" size="sm" className="flex items-center gap-2 hover:bg-slate-300 border-muted bg-black text-muted dark:bg-muted-foreground">
                <Edit className="h-4 w-4" />
                Edit
            </Button>

            <Button
                variant={isPublished ? "secondary" : "default"}
                size="sm"
                disabled={isPublished || loading}
                className="flex items-center gap-2"
                onClick={() => changeStatus("is_save_as_publish", "true")}
            >
                <Send className="h-4 w-4" />
                {isPublished ? "Published" : "Publish"}
            </Button>

            <Button
                onClick={() => changeStatus("is_save_as_archive", "true")}
                disabled={loading || status === "3"}
                variant="outline"
                size="sm"
                className="flex items-center gap-2  dark:border-muted hover:bg-slate-200/80 hover:text-muted-foreground dark:text-muted-foreground hover:dark:text-muted-foreground"
            >
                <Archive className="h-4 w-4" />
                {status === "3" ? "Archived" : "Archive"}
            </Button>

            {isOverdue && (
                <Badge className="flex items-center gap-1 rounded-full bg-destructive text-white hover:bg-destructive hover:text-white">
                    <Clock className="h-3 w-3" />
                    Expired
                </Badge>
            )}
        </div>
    )
}
