"use client";

import { useEffect, useState } from "react";
import { Inputs } from "./Inputs";
import UploadFile from "./UploadFile";
import { Loader } from "lucide-react";
import { toast } from "react-toastify";
import { aiBOT, axiosInstance } from "@/lib/axios/axios";
import { useUI } from "@/contexts/ui-context";
import UserCreateProfile from "./UserCreateProfile";
import BlackStyleButton from "@/components/custom-UI/Buttons/BlackStyleButton";
import { useRouter } from "next/navigation";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { prompt } from "@/local/prompt";
import LoaderCv from "./Loader";
import UserInfoForm from "./UserInfoForm";

const PROFILE_CHECK_API = "/api/v1/check-profile-with-email";
const COUNTRY_API_ENDPOINT = "/api/v1/country-select";
const SELECTOR_API_ENDPOINT = "/api/v1/sector-select";

export default function PurposeSwitcher() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Job seeker flow: signup first, then upload CV
  const [jobSeekerStep, setJobSeekerStep] = useState<"signup" | "upload">(
    "signup"
  );

  const [userType, setUserType] = useState<"job-seeker" | "hiring">(
    "job-seeker"
  );
  const { openModal, closeModal } = useUI();

  const [countries, setCountries] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [cvJSON, setCvJSON] = useState<Record<string, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cvJSONLoad, setCvJSONLoad] = useState(false);

  function onFileUploaded(file: File | null) {
    setSelectedFile(file);
  }

  async function storeCvJSON(
    data: Record<string, any>,
    id: string,
    email: string
  ) {
    if (!selectedFile) return toast.error("Please upload a CV file first.");
    if (!data || !id || !email) return;

    const formData = new FormData();
    formData.append("cv_pdf", selectedFile);
    formData.append("cv_json", JSON.stringify(data));
    formData.append("user_id", id);
    formData.append("email", email);

    return axiosInstance
      .post("/api/v1/cv-store", formData, {
        signal: new AbortController().signal,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        console.log("CV stored successfully ...");
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {});
  }

  async function nextStep() {
    openModal("loading_cv", <LoaderCv />);
    setLoading(true);

    if (selectedFile) {
      const text = await extractTextFromPDF(selectedFile);

      if (!text) {
        closeModal("loading_cv");
        setLoading(false);
        return toast.error(
          "Failed to extract text from the PDF. Please ensure it is a valid PDF file."
        );
      }

      try {
        const data = await aiBOT(prompt.replace("<RAW_CV_TEXT_HERE>", text));
        setCvJSON(data);
      } catch (err) {
        console.log(err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred while processing the CV. Please try again.";
        toast.error(errorMessage);
      } finally {
        closeModal("loading_cv");
        setLoading(false);
      }
    }
  }

  async function checkProfile({ disableLoading = false } = {}) {
    const params: any = {};
    params["email"] = cvJSON?.specificData?.email || "";
    const query = new URLSearchParams(params).toString();

    if (!disableLoading) setCvJSONLoad(true);

    axiosInstance
      .get(`${PROFILE_CHECK_API}${query ? "?" + query : ""}`, {
        signal: new AbortController().signal,
      })
      .then((res) => {
        openModal(
          "openUserCreateModal",
          <UserCreateProfile
            cvData={cvJSON}
            rawData={cvJSON?.specificData}
            storeCvJSON={storeCvJSON}
            closeModal={closeModal}
            keyIS={"openUserCreateModal"}
            profile={res.data.data}
          />
        );
      })
      .catch(() => {
        openModal(
          "openUserCreateModal",
          <UserCreateProfile
            cvData={cvJSON}
            rawData={cvJSON?.specificData}
            storeCvJSON={storeCvJSON}
            closeModal={closeModal}
            keyIS={"openUserCreateModal"}
            profile={null}
          />
        );
      })
      .finally(() => {
        setCvJSONLoad(false);
      });

    return 1;
  }

  function fetchCountries() {
    axiosInstance
      .get(COUNTRY_API_ENDPOINT, { signal: new AbortController().signal })
      .then((res) => {
        setCountries(
          res.data?.data?.map(
            ({ id, country_name }: { id: string; country_name: string }) => ({
              id,
              name: country_name,
            })
          ) || []
        );
      })
      .catch((err) => console.log(err))
      .finally(() => {});
  }

  function fetchSectors() {
    axiosInstance
      .get(SELECTOR_API_ENDPOINT, { signal: new AbortController().signal })
      .then((res) => {
        setSectors(
          res.data?.data?.map(({ id, name }: { id: string; name: string }) => ({
            id,
            name,
          })) || []
        );
      })
      .catch((err) => console.log(err))
      .finally(() => {});
  }

  useEffect(() => {
    if (!cvJSON) return;
    checkProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvJSON]);

  useEffect(() => {
    fetchCountries();
    fetchSectors();
  }, []);

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
        <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center backdrop-blur-sm z-[2]">
          <Loader className="h-6 w-6 text-slate-400 animate-spin duration-1000" />
        </div>
      )}

      <div className="relative min-h-screen w-full overflow-hidden bg-white text-slate-900 selection:bg-purple-200">
        <div className="absolute inset-0 pointer-events-none bg-white" />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-2 py-6 lg:px-0 lg:py-0">
          <div className="max-w-sm w-full px-2 py-6 lg:px-0 lg:py-0 max-h-screen flex flex-col">
            <div>
              <h1 className="text-5xl leading-none flex items-center justify-center">
                <span className="font-extrabold tracking-tight text-[#7C3AED]">
                  JS
                </span>
                <span className="font tracking-tight text-black">cape</span>
              </h1>

              <div className="mb-4">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-center">
                  {heading}
                </h2>

                <p className="text-muted-foreground text-sm">{subText}</p>
              </div>

              <div className="gap-2 grid lg:grid-cols-2 grid-cols-1 mb-4">
                <div className="flex items-center lg:w-auto w-full space-x-4">
                  <div
                    className={`relative px-2 w-full py-2 border rounded-full ${
                      userType === "job-seeker"
                        ? "bg-purple-100 border-purple-300"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      id="job-seeker"
                      name="userType"
                      value="job-seeker"
                      checked={userType === "job-seeker"}
                      onChange={() => {
                        setUserType("job-seeker");
                        setJobSeekerStep("signup");
                        setSelectedFile(null);
                        setCvJSON(null);
                      }}
                      className="sr-only"
                    />
                    <label
                      htmlFor="job-seeker"
                      className="flex items-center cursor-pointer"
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          userType === "job-seeker"
                            ? "bg-purple-100 border-purple-300"
                            : "border-gray-300"
                        }`}
                      >
                        {userType === "job-seeker" && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="md:text-sm sm:text-sm text-xs text-muted-foreground font-medium">
                        {"I'm looking for a job"}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center lg:w-auto w-full space-x-4">
                  <div
                    className={`relative px-2 py-2 w-full border rounded-full ${
                      userType === "hiring"
                        ? "bg-purple-100 border-purple-300"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      id="hiring"
                      name="userType"
                      value="hiring"
                      checked={userType === "hiring"}
                      onChange={() => {
                        setUserType("hiring");
                        setSelectedFile(null);
                        setCvJSON(null);
                      }}
                      className="sr-only"
                    />
                    <label
                      htmlFor="hiring"
                      className="flex items-center cursor-pointer"
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          userType === "hiring"
                            ? "bg-purple-100 border-purple-300"
                            : "border-gray-300"
                        }`}
                      >
                        {userType === "hiring" && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="md:text-sm sm:text-sm text-xs text-muted-foreground font-medium">
                        {"I'm hiring"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {userType === "hiring" ? (
              <Inputs
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                countries={countries}
                sectors={sectors}
              />
            ) : jobSeekerStep === "signup" ? (
              <div className="space-y-4">
                {/* NOTE:
                   UserInfoForm currently redirects to /profile-update after account creation.
                   To keep the user here and show the upload step next, remove that redirect inside UserInfoForm
                   and just call onComplete(). */}
                <UserInfoForm
                  recruiter={false}
                  cvData={null}
                  storeCvJSON={storeCvJSON}
                  email={""}
                  editableEmail={true}
                  onComplete={() => setJobSeekerStep("upload")}
                />

                <button
                  type="button"
                  className="w-full rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted"
                  onClick={() => toast.info("Google sign-in not wired yet")}
                >
                  Continue with Google
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <UploadFile loading={loading} onFileUploaded={onFileUploaded} />

                <BlackStyleButton
                  fullWidth
                  disabled={!selectedFile || loading}
                  onClick={nextStep}
                  title={
                    loading ? (
                      <div className="text-center text-sm animate-pulse">
                        Analyzing your resume, This may take a few minutes
                      </div>
                    ) : (
                      "Submit CV"
                    )
                  }
                />
              </div>
            )}

            <p className="text-sm font-light text-center mt-1">
              Already have an account?{" "}
              <span
                className="cursor-pointer bg-gradient-to-r from-[#B56BFF] to-[#E879F9] bg-clip-text text-transparent hover:opacity-90"
                onClick={() => router.push("/login")}
              >
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="w-full content-center" />
    </>
  );
}
