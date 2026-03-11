import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // e.g. http://localhost:8000
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  const isUrlEncoded =
    typeof URLSearchParams !== "undefined" &&
    config.data instanceof URLSearchParams;

  // ✅ If request is FormData, NEVER set Content-Type (axios will add boundary)
  if (isFormData) {
    delete (config.headers as any)["Content-Type"];
    delete (config.headers as any)["content-type"];
    return config;
  }

  // ✅ If request is x-www-form-urlencoded (OAuth2 login), keep/set it
  if (isUrlEncoded) {
    (config.headers as any)["Content-Type"] = "application/x-www-form-urlencoded";
    return config;
  }

  // ✅ If caller already set Content-Type, don't override
  const existing =
    (config.headers as any)["Content-Type"] || (config.headers as any)["content-type"];
  if (existing) return config;

  // ✅ Default JSON requests
  (config.headers as any)["Content-Type"] = "application/json";
  return config;
});

// ✅ Response interceptor: single logger
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", {
      url: err?.config?.url,
      method: err?.config?.method,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    return Promise.reject(err);
  }
);
