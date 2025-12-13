"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, AlertCircle, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import ScheduleStats from "./schedule-stats"
import SlotCard from "./slot-card"
import CandidateList from "./candidate-list"
import EmailSlotModal from "./email-slot-modal"
import OfferSlotModal from "./offer-slot-modal"
import { api } from "@/lib/axios/axios"
import { toast } from "react-toastify"

export interface Candidate {
    id: number
    candidate_id: number
    full_name: string
    email: string
    user_mobile: string | null
    profile_image?: string
}

export interface Slot {
    id: number
    start_time: string
    end_time: string
    is_booked: number
    status?: "taken" | "overdue" | "pending"
    candidate_id?: number
    meeting_link?: string
    job_application_id?: number | null
}

interface SlotSchedulePageProps {
    jobId: string
}

function getStartAndEndDate(slots: {
    id: number
    job_post_id: number
    start_time: string | null
    end_time: string | null
    is_booked: number
    created_at: string | null
    updated_at: string | null
    status?: string
}[]) {
    const validSlots = slots.filter(
        (slot) => slot.start_time && slot.end_time
    ) as Required<Pick<Slot, 'start_time' | 'end_time'>>[];

    if (validSlots.length === 0) return { start: null, end: null };

    const start = new Date(
        Math.min(...validSlots.map((slot) => new Date(slot.start_time!).getTime()))
    );

    const end = new Date(
        Math.max(...validSlots.map((slot) => new Date(slot.end_time!).getTime()))
    );

    return {
        start: start.toISOString() ?? null,
        end: end.toISOString() ?? null,
    };
}

export default function SlotSchedulePage({ jobId }: SlotSchedulePageProps) {
    const router = useRouter()
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [slots, setSlots] = useState<Slot[]>([])
    const [deadline, setDeadline] = useState<string>("")
    const [interviewStartDate, setInterviewStartDate] = useState<string>("")
    const [interviewEndDate, setInterviewEndDate] = useState<string>("")
    const [jobTitle, setJobTitle] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [emailModalOpen, setEmailModalOpen] = useState(false)
    const [offerModalOpen, setOfferModalOpen] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
    const [offerSlot, setOfferSlot] = useState<Slot | null>(null)

    useEffect(() => {
        fetchData();
    }, [jobId])

    const fetchData = async () => {
        const abortController = new AbortController();
        setLoading(true);
        Promise.all([
            api.get(`/api/v1/short-listed-candidates/${jobId}`, { signal: abortController.signal }),
            api.get(`/api/v1/availabe-slots/${jobId}`, { signal: abortController.signal }),
            api.get(`/api/v1/recruiter-job-post-show?job_post_id=${jobId}`)
        ])
            .then(([candidatesRes, slotsRes, jobDetailsRes]) => {
                const candidatesData = candidatesRes.data || {};
                const [deadline, slotsData] = slotsRes?.data?.data ?? [null, []];
                const jobDetails = jobDetailsRes.data?.data || {};

                setCandidates(candidatesData?.data.map((applicant: {
                    id: string | number
                    candidate_id: string | number
                    full_name: string
                    email: string
                    user_mobile: string | null
                    profile_image?: string | null
                }) => ({
                    id: applicant.id,
                    candidate_id: applicant.candidate_id,
                    full_name: applicant.full_name,
                    email: applicant.email,
                    user_mobile: applicant.user_mobile,
                    profile_image: applicant.profile_image ?? null,
                })) || []);
                setDeadline(deadline);
                setSlots(slotsData.map((slot: {
                    id: number
                    job_post_id: number
                    start_time: string | null
                    end_time: string | null
                    is_booked: number
                    created_at: string | null
                    updated_at: string | null
                    candidate_status?: string
                    candidate_id: number | null
                    meeting_link: string | null
                    job_application_id: number | null
                }) => ({
                    id: slot.id,
                    job_post_id: slot.job_post_id,
                    start_time: slot.start_time ?? null,
                    end_time: slot.end_time ?? null,
                    is_booked: slot.is_booked ?? 0,
                    created_at: slot.created_at ?? null,
                    updated_at: slot.updated_at ?? null,
                    status: slot?.candidate_status?.toString() === "0" &&
                        slot.end_time && new Date() >= new Date(slot.end_time)
                        ? "overdue"
                        : slot?.candidate_status?.toString() === "0"
                            ? "pending"
                            : slot?.candidate_status?.toString() === "1"
                                ? "taken"
                                : "",
                    candidate_id: slot.candidate_id ?? null,
                    meeting_link: slot.meeting_link ?? null,
                    job_application_id: slot.job_application_id ?? null,
                })));
                const { start, end } = getStartAndEndDate(slotsData);
                console.log(start, end)
                setInterviewStartDate(start ?? "");
                setInterviewEndDate(end ?? "");
                setJobTitle(jobDetails.job_title || "");
            })
            .catch((err) => {
                console.warn("API failed, using demo data", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const handleSlotStatusChange = (slotId: number, candidateId: string | number, status: "taken") => {
        api.post(`api/v1/interview-status-update`, {
            job_post_id: jobId,
            candidate_id: Number.parseInt(String(candidateId)),
            slot_id: slotId,
            status: status === "taken" ? 1 : 0,
        }).then(() => {
            toast.success("Slot booked successfully")
            setSlots((prev) => prev.map((slot) => (slot.id === slotId ? { ...slot, status } : slot)))
        }).catch((error) => {
            console.error("Booking failed:", error);
            const msg = error?.response?.data?.message || "Something went wrong.";
            toast.error(msg);
        }).finally(() => {

        });
    }

    const handleBookSlot = (slotId: number, candidateId: number, meetLink: string, status = "pending") => {
        const candidate = candidates.find((c) => c.candidate_id === candidateId)
        if (!candidate) return

        setSlots((prev) =>
            prev.map((slot) =>
                slot.id === slotId
                    ? {
                        ...slot,
                        is_booked: 1,
                        candidate_id: candidateId,
                        status: status as "taken" | "overdue" | "pending",
                        meeting_link: meetLink,
                    }
                    : slot,
            ),
        )
    }

    const handleSendEmail = (slot: Slot) => {
        setSelectedSlot(slot)
        setEmailModalOpen(true)
    }

    const handelOffer = (slot: Slot) => {
        setOfferSlot(slot)
        setOfferModalOpen(true)
    }

    const handleUpdateMeetLink = (slotId: number, meetLink: string) => {
        setSlots((prev) => prev.map((slot) => (slot.id === slotId ? { ...slot, meeting_link: meetLink } : slot)))
    }

    // Calculate statistics
    const bookedSlots = slots.filter((slot) => slot.is_booked === 1)
    const availableSlots = slots.filter((slot) => slot.is_booked === 0 && slot.status !== "overdue")
    const overdueSlots = slots.filter((slot) => slot.status === "overdue")

    // Get available candidates (not booked in any slot)
    const bookedCandidateIds = bookedSlots.map((slot) => slot.candidate_id).filter(Boolean)
    const availableCandidates = candidates.filter((candidate) => !bookedCandidateIds.includes(candidate.candidate_id))

    // Calculate total interview days
    const totalInterviewDays = interviewStartDate && interviewEndDate ? Math.floor(
        (new Date(interviewEndDate).setHours(0, 0, 0, 0) -
            new Date(interviewStartDate).setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24),
    ) + 1 : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading schedule...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="">
                <div className="mx-auto">
                    {/* Header */}
                    <div className="mb-6 md:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Interview Schedule</h1>
                                    <p className="text-sm text-muted-foreground">{jobTitle}</p>
                                </div>
                            </div>
                            <div className="flex justify-end items-center gap-2 flex-wrap">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/dashboard/schedule/${jobId}`)}
                                    className="flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span className="hidden sm:inline">Edit</span>
                                </Button>
                                <Button onClick={fetchData} variant="outline" size="sm">
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-start flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">Job ID: {jobId}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">Deadline: {new Date(deadline).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">Interview Days: {totalInterviewDays}</span>
                            </div>
                            {new Date(deadline) < new Date() && (
                                <div className="flex items-center gap-1 text-red-600">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>Deadline Passed</span>
                                </div>
                            )}
                        </div>

                        {/* Statistics */}
                        <ScheduleStats
                            totalSlots={slots.length}
                            bookedSlots={bookedSlots.length}
                            availableSlots={availableSlots.length}
                            overdueSlots={overdueSlots.length}
                            totalCandidates={candidates.length}
                            totalInterviewDays={totalInterviewDays}
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                        {/* Slots Section */}
                        <div className="xl:col-span-2">
                            <div className="space-y-6">
                                {/* Booked Slots */}
                                <div>
                                    <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Booked Slots ({bookedSlots.length})
                                    </h2>
                                    <div className="space-y-3">
                                        {bookedSlots.map((slot) => (
                                            <SlotCard
                                                key={slot.id}
                                                slot={slot}
                                                candidate={candidates.find((c) => c.candidate_id === slot.candidate_id)}
                                                onStatusChange={handleSlotStatusChange}
                                                onSendEmail={handleSendEmail}
                                                onUpdateMeetLink={handleUpdateMeetLink}
                                                jobId={jobId}
                                                onOffer={handelOffer}
                                            />
                                        ))}
                                        {bookedSlots.length === 0 && (
                                            <div className="text-center py-8 text-muted-foreground">No booked slots yet</div>
                                        )}
                                    </div>
                                </div>

                                {/* Available Slots */}
                                <div>
                                    <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        Available Slots ({availableSlots.length})
                                    </h2>
                                    <div className="space-y-3">
                                        {availableSlots.map((slot) => (
                                            <SlotCard
                                                key={slot.id}
                                                slot={slot}
                                                candidates={availableCandidates}
                                                onBookSlot={handleBookSlot}
                                                onStatusChange={handleSlotStatusChange}
                                                jobId={jobId}
                                                onOffer={handelOffer}
                                            />
                                        ))}
                                        {availableSlots.length === 0 && (
                                            <div className="text-center py-8 text-muted-foreground">All available slots are booked</div>
                                        )}
                                    </div>
                                </div>

                                {/* Overdue Slots */}
                                {overdueSlots.length > 0 && (
                                    <div>
                                        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                            Overdue Slots ({overdueSlots.length})
                                        </h2>
                                        <div className="space-y-3">
                                            {overdueSlots.map((slot) => (
                                                <SlotCard jobId={jobId} key={slot.id} slot={slot} disabled onOffer={handelOffer} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Candidates Sidebar */}
                        <div>
                            <CandidateList candidates={availableCandidates} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Modal */}
            {emailModalOpen && <EmailSlotModal
                open={emailModalOpen}
                onOpenChange={setEmailModalOpen}
                slot={selectedSlot}
                candidate={selectedSlot ? candidates.find((c) => c.candidate_id === selectedSlot.candidate_id) : undefined}
                jobId={jobId}
            />}
            {offerModalOpen && <OfferSlotModal
                open={offerModalOpen}
                onOpenChange={setOfferModalOpen}
                slot={offerSlot}
                candidate={offerSlot ? candidates.find((c) => c.candidate_id === offerSlot.candidate_id) : undefined}
            />}
        </div>
    )
}
