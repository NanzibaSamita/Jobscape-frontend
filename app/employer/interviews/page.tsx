"use client";

import { useEffect, useState } from "react";
import { 
  Calendar, Clock, Video, MapPin, Users, 
  ChevronRight, Loader2, Briefcase, Search,
  Filter, CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAllEmployerApplications } from "@/lib/api/applications";
import { axiosInstance } from "@/lib/axios/axios";
import Link from "next/link";

interface Interview {
  id: string;
  applicationId: string;
  scheduleId?: string; // New field for in-app video routing
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobId: string;
  datetime: string;
  duration: number;
  style: string;
  location: string | null;
  link: string | null;
  status: string;
}

export default function EmployerInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchInterviews() {
      try {
        const apps = await getAllEmployerApplications();
        const scheduled = apps
          .filter(a => !!a.booked_slot_id || !!a.interview_schedule_id)
          .map(a => ({
            id: a.booked_slot_id || a.interview_schedule_id || a.id,
            applicationId: a.id,
            scheduleId: a.interview_schedule_id || undefined,
            candidateName: a.applicant_name || "Unknown Candidate",
            candidateEmail: a.applicant_email || "",
            jobTitle: a.job_title || "Unknown Job",
            jobId: a.job_id,
            datetime: a.booked_slot_datetime!,
            duration: a.booked_slot_duration_minutes || 60,
            style: a.booked_slot_style || "video_call",
            location: a.booked_slot_location || null,
            link: a.booked_slot_meeting_link || null,
            status: a.status
          }));
        
        // Sort by date (upcoming first)
        scheduled.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
        setInterviews(scheduled);
      } catch (err) {
        console.error("Error fetching interviews:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInterviews();
  }, []);

  const filteredInterviews = interviews.filter(i => 
    i.candidateName.toLowerCase().includes(search.toLowerCase()) ||
    i.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  // Group interviews by unique slot (link or datetime+jobId)
  const groupedInterviews = filteredInterviews.reduce((acc, curr) => {
    const key = curr.link || `${curr.datetime}-${curr.jobId}`;
    if (!acc[key]) {
      acc[key] = {
        ...curr,
        candidates: []
      };
    }
    acc[key].candidates.push({
      id: curr.id,
      applicationId: curr.applicationId,
      name: curr.candidateName,
      email: curr.candidateEmail,
      status: curr.status
    });
    return acc;
  }, {} as Record<string, any>);

  const sortedGroupedInterviews = Object.values(groupedInterviews).sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-purple-600" />
          Interview Schedule
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Manage all your upcoming interviews across all job postings</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by candidate or job title..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
          />
        </div>
      </div>

      {sortedGroupedInterviews.length === 0 ? (
        <Card className="border-dashed border-2 py-20 bg-gray-50/50 dark:bg-transparent">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Calendar className="h-16 w-16 text-gray-200 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">No Interviews Found</h3>
            <p className="text-gray-500 mt-1">
              {search ? "No interviews match your search criteria" : "Your upcoming interviews will appear here once candidates book slots"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {sortedGroupedInterviews.map((slot: any) => (
            <Card key={slot.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-zinc-900">
              <div className="flex flex-col md:flex-row">
                {/* Date Highlight */}
                <div className="md:w-32 bg-purple-600 text-white flex flex-col items-center justify-center p-6 text-center shrink-0">
                  <span className="text-sm font-medium uppercase opacity-80">
                    {new Date(slot.datetime).toLocaleDateString([], { month: 'short' })}
                  </span>
                  <span className="text-4xl font-black">
                    {new Date(slot.datetime).getDate()}
                  </span>
                  <span className="text-xs font-bold mt-1 uppercase tracking-wider">
                    {new Date(slot.datetime).toLocaleDateString([], { weekday: 'short' })}
                  </span>
                </div>

                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase border-purple-200 text-purple-700 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300">
                          {slot.style.replace('_', ' ')}
                        </Badge>
                        <span className="text-gray-400 text-sm flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(slot.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          ({slot.duration}m)
                        </span>
                        {slot.candidates.length > 1 && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-bold">
                            <Users className="h-3 w-3 mr-1" />
                            {slot.candidates.length} CANDIDATES
                          </Badge>
                        )}
                      </div>
                      
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        <span className="text-purple-600">{slot.jobTitle}</span>
                      </h2>
                      
                      <div className="space-y-3">
                        {slot.candidates.map((c: any) => (
                          <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 shadow-sm">
                                <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-bold">
                                  {c.name.split(' ').map((n: string)=>n[0]).join('').slice(0,2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{c.name}</p>
                                <p className="text-[10px] text-gray-500">{c.email}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50" asChild>
                              <Link href={`/employer/jobs/${slot.jobId}/applications?filter=INTERVIEW_SCHEDULED`}>
                                VIEW APP
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 sm:w-48">
                      {(slot.style === "video_call" && slot.scheduleId) || (slot.link?.startsWith('/')) ? (
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-11" asChild>
                          <Link href={slot.link?.startsWith('/') ? slot.link : `/interview/${slot.scheduleId}`}>
                            <Video className="h-4 w-4 mr-2" />
                            Join Video Room
                          </Link>
                        </Button>
                      ) : slot.link ? (
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-11" asChild>
                          <a 
                            href={slot.link.startsWith('http') ? slot.link : `https://${slot.link}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join Meeting
                          </a>
                        </Button>
                      ) : slot.location ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-zinc-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          {slot.location}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-zinc-800 rounded-lg text-sm font-medium text-gray-400 border border-gray-200 dark:border-gray-700">
                          <MapPin className="h-4 w-4" />
                          Location TBD
                        </div>
                      )}
                      
                      <p className="text-[10px] text-center text-gray-400 font-medium px-2">
                        {slot.candidates.length > 1 
                          ? "This is a shared time slot. Candidates will be admitted one by one."
                          : "Individual interview session."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ArrowRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
