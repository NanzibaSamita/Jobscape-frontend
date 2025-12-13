import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { cookies } from "next/headers";
import { StatsCards } from "./StatsCards";
import { SlotBookingContainer } from "./SlotBookingContainer";
import { redirect } from "next/navigation";

const JOBS_AVAILABLE_SLOTS = "/api/v1/availabe-slots";
export type OpenSlot = {
    id: number;
    job_post_id: number;
    start_time: string;  // format: 'YYYY-MM-DD HH:mm:ss'
    end_time: string;
    is_booked: 0 | 1;
    created_at: string;
    updated_at: string;
};

export type OpenSlotsResponse = [deadline: string, slots: OpenSlot[]];
export type Props = {
    params: {
        job_id: string;
    };
};
async function getAuth() {
    const cookieStore = cookies();
    const token = cookieStore.get(process.env.NEXT_ACCESS_TOKEN || "wanted_ai")?.value;
    const session = cookieStore.get("session")?.value;

    if (!token || !session) return null;
    try {
        const { userId } = JSON.parse(session);
        return { token, userId };
    } catch {
        return null;
    }
};

async function fetchSlots(token: string, id: string) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${JOBS_AVAILABLE_SLOTS}/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store"
        }
    );
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(JSON.parse(errorText)?.message || "Failed to fetch slots");
    }
    // if (!res.ok) throw new Error("Failed to fetch job data");
    const data = await res.json();
    return data?.data || [];

}

export default async function Page({ params }: Props) {
    const { job_id } = params;
    const auth = await getAuth();
    if (!auth) redirect(`/login?redirect=${encodeURIComponent(`/jobs/book-slot/${job_id}`)}`);
    let slots: OpenSlotsResponse | [] = [];
    try {
        slots = (await fetchSlots(auth.token, job_id));
    } catch (error) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-black mb-2">Error Loading Slots</h2>
                        <p className="text-gray-600">{(error as Error)?.message}</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    };
    const [deadline, openSlots = []] = slots;
    if (!deadline || !openSlots) return (
        <DashboardLayout>
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-black mb-2">No Slots Available</h2>
                    <p className="text-gray-600">No slot data found for this position.</p>
                </div>
            </div>
        </DashboardLayout>
    )
    return (
        <DashboardLayout>
            <div className="w-full flex flex-col h-full space-y-2 items-center justify-start overflow-y-auto">
                {/* Header */}
                <div className="w-full max-w-6xl mb-2 text-left">
                    <h1 className="text-4xl font-bold text-[#2B3674] dark:text-primary">Available Interview Slots</h1>
                    <p className="text-base text-muted-foreground">
                        Select your preferred interview slot.
                        <span className="font-semibold ml-2 text-destructive">
                            Booking deadline: {new Date(deadline).toDateString()} : {new Date(deadline).toLocaleTimeString()}
                        </span>
                    </p>
                </div>

                {/* Stats Cards */}
                <StatsCards slots={openSlots} />

                {/* Slot Booking Container */}
                <SlotBookingContainer deadline={deadline} slots={openSlots} jobId={job_id} token={auth.token} />
            </div>
        </DashboardLayout>
    );
}
