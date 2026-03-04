"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getJobById, Job } from "@/lib/api/jobs";
import { applyToJob } from "@/lib/api/applications";
import { getCoverLetters, CoverLetter, createCoverLetter } from "@/lib/api/coverletters";
import { getMyResumes, Resume } from "@/lib/api/resume";
import { generateCoverLetter } from "@/lib/api/ai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  Building,
  Loader2,
  ArrowLeft,
  FileText,
  Sparkles,
  Save,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import UploadFile from "@/app/signup/comps/UploadFile" // Your existing upload component
import { reUploadResume } from "@/lib/api/resume"; // Add this import


export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  // Application form state
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [newResumeFile, setNewResumeFile] = useState<File | null>(null);
  
  // AI generation state
  const [generatingAI, setGeneratingAI] = useState(false);
  
  // Save cover letter state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [coverLetterTitle, setCoverLetterTitle] = useState("");
  const [savingCoverLetter, setSavingCoverLetter] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  async function fetchJobDetails() {
    try {
      setLoading(true);
      const data = await getJobById(jobId);
      setJob(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to load job details");
      router.push("/jobs");
    } finally {
      setLoading(false);
    }
  }

  async function openApplyModal() {
    try {
      // Fetch user's resumes
      const resumesData = await getMyResumes();
      setResumes(resumesData.resumes);
      
      // Set primary resume as default
      const primaryResume = resumesData.resumes.find((r) => r.is_primary);
      if (primaryResume) {
        setSelectedResumeId(primaryResume.id);
      }

      // Fetch user's cover letters
      const letters = await getCoverLetters();
      setCoverLetters(letters);

      setIsApplyModalOpen(true);
    } catch (error: any) {
      toast.error("Failed to load application data");
      setIsApplyModalOpen(true);
    }
  }

  async function handleResumeUpload(file: File) {
    if (!file) return;
    
    try {
      setUploadingResume(true);
      const result = await reUploadResume(file);
      toast.success(result.message || "Resume uploaded successfully!");
      
      // Refresh resumes list and select the new one
      const resumesData = await getMyResumes();
      setResumes(resumesData.resumes);
      
      // Set the newly uploaded resume as selected (it should be primary)
      const primaryResume = resumesData.resumes.find((r) => r.is_primary);
      if (primaryResume) {
        setSelectedResumeId(primaryResume.id);
        setNewResumeFile(null); // Clear the temp file
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to upload resume");
    } finally {
      setUploadingResume(false);
    }
  }

  function handleCoverLetterSelect(id: string) {
    setSelectedCoverLetterId(id);
    if (id === "None") {
      setCoverLetterText("");
    } else {
      const selected = coverLetters.find((cl) => cl.id === id);
      if (selected) {
        setCoverLetterText(selected.content);
      }
    }
  }

  async function handleGenerateAICoverLetter() {
    try {
      setGeneratingAI(true);
      const result = await generateCoverLetter(jobId);
      setCoverLetterText(result.cover_letter);
      setSelectedCoverLetterId(""); // Clear saved letter selection
      toast.success("AI cover letter generated!");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to generate cover letter");
    } finally {
      setGeneratingAI(false);
    }
  }

  async function handleSaveCoverLetter() {
    if (!coverLetterTitle.trim()) {
      toast.error("Please enter a title for the cover letter");
      return;
    }

    try {
      setSavingCoverLetter(true);
      await createCoverLetter({
        title: coverLetterTitle,
        content: coverLetterText,
      });
      toast.success("Cover letter saved!");
      setShowSaveDialog(false);
      setCoverLetterTitle("");
      
      // Refresh cover letters list
      const letters = await getCoverLetters();
      setCoverLetters(letters);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to save cover letter");
    } finally {
      setSavingCoverLetter(false);
    }
  }

  async function handleApply() {
    if (!selectedResumeId) {
      toast.error("Please select a resume");
      return;
    }

    try {
      setApplying(true);
      await applyToJob({
        job_id: jobId,
        resume_id: selectedResumeId,
        cover_letter: coverLetterText || undefined,
      });
      toast.success("Application submitted successfully!");
      setIsApplyModalOpen(false);
      router.push("/jobseeker/applications");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 lg:p-8">
        {/* Back Button */}
        <Link href="/jobs">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>

        {/* Job Header Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                <div className="flex items-center gap-2 text-lg text-gray-600">
                  <Building className="h-5 w-5" />
                  {job.company_name || "Company Name"}
                </div>
              </div>
              <Button
                onClick={openApplyModal}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Apply Now
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-5 w-5" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium">{job.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="h-5 w-5" />
                <div>
                  <p className="text-xs text-gray-500">Job Type</p>
                  <p className="font-medium">{job.job_type}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <div>
                  <p className="text-xs text-gray-500">Work Mode</p>
                  <p className="font-medium">{job.work_mode}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="font-medium">{job.experience_level}</p>
                </div>
              </div>
            </div>

            {job.salary_min && (
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg mb-6">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Salary Range</p>
                  <p className="font-semibold text-green-700">
                    {job.salary_min.toLocaleString()}
                    {job.salary_max ? ` - ${job.salary_max.toLocaleString()}` : ""}
                  </p>
                </div>
              </div>
            )}

            {job.is_fresh_graduate_friendly && (
              <Badge className="bg-green-100 text-green-800 mb-4">
                Fresh Graduate Friendly
              </Badge>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Application Deadline:{" "}
                <span className="font-medium text-gray-900">
                  {new Date(job.application_deadline).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </CardContent>
        </Card>

        {/* Required Skills */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Required Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.required_skills.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="default"
                  className="bg-purple-100 text-purple-800"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preferred Skills */}
        {job.preferred_skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Preferred Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.preferred_skills.map((skill, idx) => (
                  <Badge key={idx} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Apply Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
            <DialogDescription>
              Submit your application with a resume and cover letter
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Resume Selection + Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Resume <span className="text-red-500">*</span>
              </label>
              
              {/* Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <UploadFile
                  loading={uploadingResume}
                  onFileUploaded={handleResumeUpload}
                  className="max-w-md mx-auto"
                />
              </div>
              
              {/* Existing Resumes Dropdown */}
              {resumes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Or choose from existing resumes
                  </label>
                  <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a resume" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          {resume.filename} 
                          {resume.is_primary && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Primary</span>}
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(resume.uploaded_at).toLocaleDateString()}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {resumes.length === 0 && !uploadingResume && (
                <p className="text-xs text-gray-500 text-center">
                  No resumes found. Upload one above to continue.
                </p>
              )}
            </div>

            {/* Cover Letter Selection */}
            {coverLetters.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Use Saved Cover Letter (Optional)
                </label>
                <Select
                  value={selectedCoverLetterId}
                  onValueChange={handleCoverLetterSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a saved cover letter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">Write custom</SelectItem>
                    {coverLetters.map((cl) => (
                      <SelectItem key={cl.id} value={cl.id}>
                        {cl.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* AI Generate Button */}
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleGenerateAICoverLetter}
                disabled={generatingAI}
                variant="outline"
                className="flex-1"
              >
                {generatingAI ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {generatingAI ? "Generating..." : "AI Generate Cover Letter"}
              </Button>
              
              {coverLetterText.length > 50 && (
                <Button
                  type="button"
                  onClick={() => setShowSaveDialog(true)}
                  variant="outline"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              )}
            </div>

            {/* Cover Letter Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter (Optional)
              </label>
              <Textarea
                placeholder="Write your cover letter here..."
                value={coverLetterText}
                onChange={(e) => setCoverLetterText(e.target.value)}
                rows={10}
                maxLength={2000}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {coverLetterText.length} / 2000 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApplyModalOpen(false)}
              disabled={applying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={applying || !selectedResumeId}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {applying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Cover Letter Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Cover Letter</DialogTitle>
            <DialogDescription>
              Save this cover letter for future applications
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g., Software Engineer Cover Letter"
              value={coverLetterTitle}
              onChange={(e) => setCoverLetterTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              maxLength={200}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              disabled={savingCoverLetter}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCoverLetter}
              disabled={savingCoverLetter}
            >
              {savingCoverLetter ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
