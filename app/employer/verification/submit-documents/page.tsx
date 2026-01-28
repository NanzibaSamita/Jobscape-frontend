"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axios/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SubmitDocumentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rjsc_registration_number: "",
    trade_license_number: "",
    tin_number: "",
    linkedin_company_url: "",
    additional_notes: "",
  });
  const [documents, setDocuments] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid file type`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });
    
    setDocuments([...documents, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (documents.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      
      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      // Add files
      documents.forEach((file) => {
        formDataToSend.append("documents", file);
      });

      await axiosInstance.post("/employer/verification/submit-documents", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Documents submitted successfully! 🎉");
      router.push("/employer/profile");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error?.response?.data?.detail || "Failed to submit documents");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/employer/profile">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submit Verification Documents
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Upload your company documents to get verified. This helps us ensure the authenticity of your company.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* RJSC Number */}
              <div>
                <Label htmlFor="rjsc">RJSC Registration Number (Optional)</Label>
                <Input
                  id="rjsc"
                  type="text"
                  value={formData.rjsc_registration_number}
                  onChange={(e) =>
                    setFormData({ ...formData, rjsc_registration_number: e.target.value })
                  }
                  placeholder="e.g., C-123456/2020"
                />
              </div>

              {/* Trade License */}
              <div>
                <Label htmlFor="trade">Trade License Number (Optional)</Label>
                <Input
                  id="trade"
                  type="text"
                  value={formData.trade_license_number}
                  onChange={(e) =>
                    setFormData({ ...formData, trade_license_number: e.target.value })
                  }
                  placeholder="e.g., TL-789012"
                />
              </div>

              {/* TIN */}
              <div>
                <Label htmlFor="tin">TIN Number (Optional)</Label>
                <Input
                  id="tin"
                  type="text"
                  value={formData.tin_number}
                  onChange={(e) => setFormData({ ...formData, tin_number: e.target.value })}
                  placeholder="e.g., 123-456-789"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <Label htmlFor="linkedin">LinkedIn Company Page (Optional)</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={formData.linkedin_company_url}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedin_company_url: e.target.value })
                  }
                  placeholder="https://www.linkedin.com/company/your-company"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.additional_notes}
                  onChange={(e) =>
                    setFormData({ ...formData, additional_notes: e.target.value })
                  }
                  placeholder="Any additional information you'd like to provide..."
                  rows={4}
                />
              </div>

              {/* File Upload */}
              <div>
                <Label>Upload Documents (Required)</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Upload company documents (Trade License, RJSC Certificate, etc.). Accepted: JPG, PNG, PDF. Max 5MB per file.
                </p>
                
                <Input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />

                {documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {documents.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Documents
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
