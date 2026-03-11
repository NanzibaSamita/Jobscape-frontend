import axiosInstance from "../axios/axios";

export interface GenerateCoverLetterRequest {
  job_id: string;
}

export interface GenerateCoverLetterResponse {
  cover_letter: string;
  generated_at: string;
  tokens_used?: number;
}

/**
 * Generate AI cover letter for a job
 */
export async function generateCoverLetter(jobId: string): Promise<GenerateCoverLetterResponse> {
  const response = await axiosInstance.post<GenerateCoverLetterResponse>(
    "/jobseeker/cover-letters/generate",  // ← Matches backend
    null,
    { params: { job_id: jobId } }
  );
  return response.data;
}
