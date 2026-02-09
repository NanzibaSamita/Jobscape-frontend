import axiosInstance from "../axios/axios";

export interface CommuteScoreRequest {
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  mode?: "driving" | "transit" | "walking" | "bicycling";
}

export interface CommuteScoreResponse {
  score: number;
  rating: string;
  distance_km: number;
  travel_distance_km: number;
  duration_minutes: number | null;
  straight_line_distance: number;
  mode: string;
}

/**
 * Calculate commute score between two locations
 */
export async function calculateCommuteScore(
  request: CommuteScoreRequest
): Promise<CommuteScoreResponse> {
  const response = await axiosInstance.post<CommuteScoreResponse>(
    "/commute/calculate-score",
    request
  );
  return response.data;
}
