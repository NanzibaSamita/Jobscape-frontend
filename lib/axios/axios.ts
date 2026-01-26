import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // e.g. http://localhost:8000
  withCredentials: true,
});

// ✅ REQUEST INTERCEPTOR: Handle Content-Type + Add Auth Token
axiosInstance.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  // ============ AUTH TOKEN INJECTION ============
  // Get token from localStorage or sessionStorage
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // ==============================================

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
    (config.headers as any)["Content-Type"] =
      "application/x-www-form-urlencoded";
    return config;
  }

  // ✅ If caller already set Content-Type, don't override
  const existing =
    (config.headers as any)["Content-Type"] ||
    (config.headers as any)["content-type"];
  if (existing) return config;

  // ✅ Default JSON requests
  (config.headers as any)["Content-Type"] = "application/json";
  return config;
});

// ✅ RESPONSE INTERCEPTOR: Error logging + Auth handling
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    // Log all API errors
    console.error("API Error:", {
      url: err?.config?.url,
      method: err?.config?.method,
      status: err?.response?.status,
      data: err?.response?.data,
    });

    // ============ TOKEN EXPIRY HANDLING ============
    // If 401 Unauthorized, clear tokens and redirect to login
    if (err?.response?.status === 401) {
      console.warn("⚠️ Token expired or invalid. Redirecting to login...");
      
      // Clear tokens
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("access_token");

      // Redirect to login (only on client-side)
      if (typeof window !== "undefined") {
        // Preserve current URL for redirect after login
        const currentPath = window.location.pathname;
        const redirectParam =
          currentPath !== "/login" && currentPath !== "/"
            ? `?redirect=${encodeURIComponent(currentPath)}`
            : "";
        
        window.location.href = `/login${redirectParam}`;
      }
    }
    // ===============================================

    return Promise.reject(err);
  }
);
