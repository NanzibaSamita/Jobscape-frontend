"use client";

import { Job } from "@/lib/api/jobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Briefcase, Eye, Edit, Trash2, Plus } from "lucide-react";
import Link from "next/link";

interface EmployerJobListProps {
  jobs: Job[];
  loading: boolean;
  onDeleteJob: (jobId: string) => void;
  showPostButton?: boolean;
}

export function EmployerJobList({ jobs, loading, onDeleteJob, showPostButton = true }: EmployerJobListProps) {
  if (loading) {
    return (
      <div className="flex py-12 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Posted Jobs</h2>
        {showPostButton && (
          <Link href="/employer/jobs/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        )}
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">You haven't posted any jobs yet.</p>
            <Link href="/employer/jobs/create" className="mt-4">
              <Button variant="outline">Create Your First Job Post</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <p className="text-gray-600">{job.location} · {job.work_mode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={job.is_active ? "default" : "secondary"}>
                      {job.is_active ? "Active" : "Closed"}
                    </Badge>
                    <Link href={`/employer/jobs/${job.id}/applications`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Applications
                      </Button>
                    </Link>
                    <Link href={`/employer/jobs/${job.id}/edit`}>
                      <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onDeleteJob(job.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-500">
                    Posted: {new Date(job.created_at).toLocaleDateString()}
                  </p>
                  <p className="font-medium text-purple-600">
                    {job.experience_level}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
