export interface TimeSlot {
    id: string
    start_time: string
    end_time: string
    date: string
}

export interface ScheduleData {
    job_post_id: string
    slot_selection_deadline: string
    slots: TimeSlot[]
    candidates: string[]
}

export interface BusinessHours {
    start: number
    end: number
}
