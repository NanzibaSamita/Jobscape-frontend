import { axiosInstance } from "../axios/axios";
import { InterviewStyle } from "@/types/interview";

export interface PoolSlot {
  id: string;
  datetime_utc: string;
  duration_minutes: number;
  is_booked: boolean;
  application_id: string | null;
  style: InterviewStyle | null;
  /** True when seeker picks style at booking time */
  allow_seeker_style_choice: boolean;
  available_styles: string[];
  location: string | null;
  meeting_link: string | null;
  capacity: number;
  booked_count: number;
}

export interface PoolSlotCreate {
  datetime_utc: string;
  duration_minutes: number;
  /** Pre-set by employer in FCFS mode; null in seeker-choice mode */
  style?: InterviewStyle | null;
  location?: string;
  meeting_link?: string;
  capacity: number;
}

export interface BulkSlotCreatePayload {
  job_id: string;
  allow_seeker_style_choice: boolean;
  available_styles?: string[];
  slots: PoolSlotCreate[];
}

/**
 * Bulk create interview slots for a job (Employer)
 * - allow_seeker_style_choice=false → FCFS, employer pre-sets style per slot
 * - allow_seeker_style_choice=true  → Seeker picks style when booking
 */
export async function bulkCreateSlots(payload: BulkSlotCreatePayload) {
  const response = await axiosInstance.post(`/interviews/pool/bulk-create`, payload);
  return response.data;
}

/**
 * Get interview slot pool for a job
 * (Employer sees all, Job Seeker sees only unbooked)
 */
export async function getSlotPool(jobId: string): Promise<{ slots: PoolSlot[], has_requested_extra_slots: boolean, shortlisted_count: number }> {
  const response = await axiosInstance.get(`/interviews/pool/${jobId}`);
  return response.data;
}

/**
 * Book an interview slot (Job Seeker - FCFS)
 * chosen_style is required when allow_seeker_style_choice=true
 */
export async function bookInterviewSlot(slotId: string, chosenStyle?: string) {
  const response = await axiosInstance.post(`/interviews/pool/${slotId}/book`, {
    chosen_style: chosenStyle ?? null,
  });
  return response.data;
}

/**
 * Delete an unbooked interview slot (Employer)
 */
export async function deleteInterviewSlot(slotId: string) {
  const response = await axiosInstance.post(`/interviews/pool/${slotId}/delete`);
  return response.data;
}
export async function requestMoreSlots(jobId: string) {
  const response = await axiosInstance.post(`/interviews/job/${jobId}/request-slots`);
  return response.data;
}
