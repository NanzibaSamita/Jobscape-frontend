"use client";

import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { axiosInstance } from "@/lib/axios/axios";
import { useRouter } from "next/navigation";
import UserInfoForm from "./UserInfoForm";
import { Inputs } from "./Inputs";

const COUNTRY_API_ENDPOINT = "/api/v1/country-select";
const SECTOR_API_ENDPOINT = "/api/v1/sector-select";

export default function PurposeSwitcher() {
  const router = useRouter();

  const [userType, setUserType] = useState<"job-seeker" | "hiring">("job-seeker");
  const [isLoading, setIsLoading] = useState(false);

  const [countries, setCountries] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);

  const fetchCountries = () => {
    axiosInstance
      .get(COUNTRY_API_ENDPOINT)
      .then((res) => setCountries(res.data?.data || []))
      .catch(() => {});
  };

  const fetchSectors = () => {
    axiosInstance
      .get(SECTOR_API_ENDPOINT)
      .then((res) => setSectors(res.data?.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (userType !== "hiring") return;
    fetchCountries();
    fetchSectors();
  }, [userType]);

  const heading =
    userType === "job-seeker" ? "Create a new account" : "Welcome! Let's get started";

  const subText =
    userType === "job-seeker"
      ? "Create your account. We'll send a verification link to your email. After verifying, you'll upload your CV."
      : "To create your free account, we just need a few details.";

  const handleSignInClick = () => {
    console.log("🔵🔵🔵 SIGN IN CLICKED");
    router.push("/login");
  };

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
              onClick={() => setUserType("hiring")}
              className={`rounded-full py-2 border ${
                userType === "hiring" ? "bg-purple-100" : ""
              }`}
            >
              I'm hiring
            </button>
          </div>

          {/* CONTENT */}
          {userType === "job-seeker" ? (
            <UserInfoForm
              recruiter={false}
              email=""
              editableEmail
              onComplete={() => {}}
            />
          ) : (
            <Inputs
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              countries={countries}
              sectors={sectors}
            />
          )}

          {/* SIGN IN LINK - SIMPLIFIED */}
          <div className="text-sm text-center">
            Already have an account?{" "}
            <button
              onClick={handleSignInClick}
              className="text-purple-600 cursor-pointer hover:underline font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
