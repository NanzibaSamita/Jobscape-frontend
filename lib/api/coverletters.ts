import axiosInstance from '../axios/axios' 

export interface CoverLetter {
  id: string;
  jobseeker_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCoverLetterData {
  title: string;
  content: string;
}

export interface UpdateCoverLetterData {
  title?: string;
  content?: string;
}

/**
 * Get all cover letters for the current job seeker
 */
export async function getCoverLetters(): Promise<CoverLetter[]> {
  const response = await axiosInstance.get("/jobseeker/cover-letters/");
  return response.data;
}

/**
 * Get a single cover letter by ID
 */
export async function getCoverLetterById(id: string): Promise<CoverLetter> {
  const response = await axiosInstance.get(`/jobseeker/cover-letters/${id}`);
  return response.data;
}

/**
 * Create a new cover letter
 */
export async function createCoverLetter(data: CreateCoverLetterData): Promise<CoverLetter> {
  const response = await axiosInstance.post("/jobseeker/cover-letters/", data);
  return response.data;
}

/**
 * Update an existing cover letter
 */
export async function updateCoverLetter(
  id: string,
  data: UpdateCoverLetterData
): Promise<CoverLetter> {
  const response = await axiosInstance.patch(`/jobseeker/cover-letters/${id}`, data);
  return response.data;
}

/**
 * Delete a cover letter
 */
export async function deleteCoverLetter(id: string): Promise<void> {
  await axiosInstance.delete(`/jobseeker/cover-letters/${id}`);
}
