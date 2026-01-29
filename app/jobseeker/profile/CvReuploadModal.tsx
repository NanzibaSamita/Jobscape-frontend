"use client";

import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { uploadResume } from "@/lib/api/resume";

interface CvReuploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CvReuploadModal({ isOpen, onClose, onSuccess }: CvReuploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parseStatus, setParseStatus] = useState<"idle" | "success" | "failed">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a PDF or DOCX file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setParseStatus("idle");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadResume(selectedFile);
      
      setParseStatus(result.parse_status === "SUCCESS" ? "success" : "failed");
      toast.success(result.message || "CV uploaded successfully!");
      
      // Wait a bit to show the status, then call onSuccess
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to upload CV");
      setParseStatus("failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Re-upload Your CV</DialogTitle>
          <DialogDescription>
            Upload a new CV to update your profile. We'll automatically extract and update your information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition"
          >
            {selectedFile ? (
              <div className="space-y-2">
                <FileText className="h-12 w-12 mx-auto text-purple-600" />
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">Click to select a file</p>
                <p className="text-xs text-gray-500">PDF or DOCX (max 10MB)</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Parse Status */}
          {parseStatus !== "idle" && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${
                parseStatus === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-yellow-50 text-yellow-800"
              }`}
            >
              {parseStatus === "success" ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <p className="text-sm">CV parsed successfully! Your profile has been updated.</p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">CV uploaded but parsing had issues. You can manually update your profile.</p>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload CV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
