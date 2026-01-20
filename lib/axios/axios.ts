import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // e.g. http://localhost:8000
  withCredentials: true, // only if cookies/session auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", {
      url: err?.config?.url,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    return Promise.reject(err);
  }
);
