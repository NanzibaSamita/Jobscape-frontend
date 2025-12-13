import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import SlotSchedulePage from "./slot-schedule-page";

export default function SchedulePage({ params }: { params: { job_id: string } }) {
    return (<DashboardLayout>
        <SlotSchedulePage jobId={params.job_id} />
    </DashboardLayout>)
}
