"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import UploadFile from "@/app/signup/comps/UploadFile";
import BlackStyleButton from "@/components/custom-UI/Buttons/BlackStyleButton";
import { uploadResume } from "@/lib/api/resume"; // your existing function

export default function CvUploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitCv() {
    if (!selectedFile) return toast.error("Please upload your CV first.");

    setLoading(true);
    try {
      // IMPORTANT: uploadResume must NOT require temp token now
      const res = await uploadResume(selectedFile);

      toast.success(res?.message || "CV uploaded & parsed successfully.");
      router.push("/login");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to upload CV."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-6">
        <h1 className="text-2xl font-semibold text-center">Upload your CV</h1>
        <p className="text-sm text-muted-foreground text-center">
          Upload your CV to complete setup. We’ll parse it automatically.
        </p>

        <UploadFile loading={loading} onFileUploaded={setSelectedFile} />

        <BlackStyleButton
          fullWidth
          disabled={!selectedFile || loading}
          onClick={submitCv}
          title={loading ? "Uploading & parsing..." : "Submit CV"}
        />
      </div>
    </div>
  );
}
