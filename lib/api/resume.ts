import { axiosInstance } from "@/lib/axios/axios";

export async function uploadResume(file: File) {
  const token = localStorage.getItem("jobseeker_temp_token");

  if (!token) {
    throw new Error("Missing signup token. Please restart signup.");
  }

  const formData = new FormData();
  formData.append("file", file); // ✅ MUST be "file" (as swagger shows)

  const res = await axiosInstance.post("/resume/upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`, // ✅ required
      // ❌ DON'T set Content-Type manually; axios will add boundary
    },
  });

  return res.data;
}
