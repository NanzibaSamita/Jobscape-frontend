"use client";

import { useState, useEffect } from "react";
import { searchJobs, Job, JobSearchParams } from "@/lib/api/jobs";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Briefcase, Clock, DollarSign, Search } from "lucide-react";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs(params?: JobSearchParams) {
    try {
      setLoading(true);
      const data = await searchJobs(params || {});
      setJobs(data.items);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    fetchJobs({ keyword: searchKeyword });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="flex gap-2">
          <Input
            placeholder="Search jobs by title, company, or keywords..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Job List */}
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <p className="text-center text-gray-500">No jobs found. Try adjusting your search.</p>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
                      <p className="text-gray-600">{job.company_name || "Company"}</p>
                    </div>
                    <Link href={`/jobs/${job.id}`}>
                      <Button>View Details</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      {job.job_type}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {job.work_mode}
                    </div>
                    {job.salary_min && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        {job.salary_min.toLocaleString()}
                        {job.salary_max ? ` - ${job.salary_max.toLocaleString()}` : "+"}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.slice(0, 5).map((skill, idx) => (
                      <Badge key={idx} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
