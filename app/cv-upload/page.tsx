"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";
import UploadFile from "@/app/signup/comps/UploadFile";
import BlackStyleButton from "@/components/custom-UI/Buttons/BlackStyleButton";
import { uploadResume } from "@/lib/api/resume"; // your existing function

export default function CvUploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  async function submitCv() {
    if (!selectedFile) {
      dispatch(showAlert({
        title: "Upload Required",
        message: "Please upload your CV first.",
        type: "error"
      }));
      return;
    }

    setLoading(true);
    try {
      // IMPORTANT: uploadResume must NOT require temp token now
      const res = await uploadResume(selectedFile);
      dispatch(showAlert({
        title: "Success",
        message: res?.message || "CV uploaded & parsed successfully.",
        type: "success"
      }));
      router.push("/login");
    } catch (err: any) {
      dispatch(showAlert({
        title: "Upload Error",
        message: err?.response?.data?.detail || err?.response?.data?.message || err?.message || "Failed to upload CV.",
        type: "error"
      }));
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
