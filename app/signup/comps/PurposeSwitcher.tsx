"use client";

import { useEffect, useState } from "react";
import UploadFile from "./UploadFile";
import { Loader } from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axios/axios";
import { useUI } from "@/contexts/ui-context";
import BlackStyleButton from "@/components/custom-UI/Buttons/BlackStyleButton";
import { useRouter } from "next/navigation";
import LoaderCv from "./Loader";
import UserInfoForm from "./UserInfoForm";
import { Inputs } from "./Inputs";
import { uploadResume } from "@/lib/api/resume"; // adjust path to where you put it
const COUNTRY_API_ENDPOINT = "/api/v1/country-select";
const SECTOR_API_ENDPOINT = "/api/v1/sector-select";

export default function PurposeSwitcher() {
  const router = useRouter();
  const { openModal, closeModal } = useUI();

  const [userType, setUserType] = useState<"job-seeker" | "hiring">("job-seeker");
  const [jobSeekerStep, setJobSeekerStep] = useState<"signup" | "upload">("signup");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [countries, setCountries] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);

  function onFileUploaded(file: File | null) {
    setSelectedFile(file);
  }

  
  async function nextStep() {
    if (!selectedFile) {
      return toast.error("Please upload a CV file first.");
    }

    openModal("loading_cv", <LoaderCv />);
    setLoading(true);

    try {
      const res = await uploadResume(selectedFile);

      localStorage.removeItem("jobseeker_temp_token");
      localStorage.removeItem("jobseeker_user_id");

      toast.success(
        res?.message || "CV uploaded successfully! Please check your email."
      );

      router.push(`/verify-email?email=${encodeURIComponent(res?.email ?? "")}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to upload CV.";

      toast.error(msg);
    } finally {
      closeModal("loading_cv");
      setLoading(false);
    }
  }

  function fetchCountries() {
    axiosInstance
      .get(COUNTRY_API_ENDPOINT)
      .then((res) => setCountries(res.data?.data || []))
      .catch(() => {});
  }

  function fetchSectors() {
    axiosInstance
      .get(SECTOR_API_ENDPOINT)
      .then((res) => setSectors(res.data?.data || []))
      .catch(() => {});
  }

  useEffect(() => {
    if (userType !== "hiring") return;
    fetchCountries();
    fetchSectors();
  }, [userType]);

  const heading =
    userType === "job-seeker"
      ? jobSeekerStep === "signup"
        ? "Create a new account"
        : "Upload your CV"
      : "Welcome! Let’s get started";

  const subText =
    userType === "hiring"
      ? "To create your free account, we just need a few details."
      : jobSeekerStep === "signup"
      ? "Create your account first. You can upload your CV next."
      : "Please upload your CV in PDF format";

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-10">
          <Loader className="h-6 w-6 animate-spin" />
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full space-y-6">
          <h1 className="text-4xl font-bold text-center">
            <span className="text-purple-600">JS</span>cape
          </h1>

          <h2 className="text-xl font-semibold text-center">{heading}</h2>
          <p className="text-sm text-muted-foreground text-center">{subText}</p>

          {/* USER TYPE SWITCH */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setUserType("job-seeker");
                setJobSeekerStep("signup");
                setSelectedFile(null);
                setCountries([]);
                setSectors([]);
              }}
              className={`rounded-full py-2 border ${
                userType === "job-seeker" ? "bg-purple-100" : ""
              }`}
            >
              I'm looking for a job
            </button>

            <button
              onClick={() => {
                setUserType("hiring");
                setSelectedFile(null);
              }}
              className={`rounded-full py-2 border ${
                userType === "hiring" ? "bg-purple-100" : ""
              }`}
            >
              I'm hiring
            </button>
          </div>

          {userType === "hiring" ? (
            <Inputs
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              countries={countries}
              sectors={sectors}
            />
          ) : jobSeekerStep === "signup" ? (
            <UserInfoForm
              recruiter={false}
              email=""
              editableEmail
              onComplete={() => setJobSeekerStep("upload")}
            />
          ) : (
            <>
              <UploadFile loading={loading} onFileUploaded={onFileUploaded} />

              <BlackStyleButton
                fullWidth
                disabled={!selectedFile || loading}
                onClick={nextStep}
                title={loading ? "Uploading CV..." : "Submit CV"}
              />
            </>
          )}

          <p className="text-sm text-center">
            Already have an account?{" "}
            <span
              className="text-purple-600 cursor-pointer"
              onClick={() => router.push("/login")}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
