import { axiosInstance } from "@/lib/axios/axios";

export async function uploadResume(file: File) {
  const token = localStorage.getItem("cv_upload_token");
  if (!token) throw new Error("Missing CV upload authorization. Please verify your email again.");

  const formData = new FormData();
  formData.append("file", file);

  const res = await axiosInstance.post("/resume/upload", formData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}
