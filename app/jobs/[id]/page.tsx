"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";
import { getJobById, Job, SelectionProcess, searchJobs } from "@/lib/api/jobs";
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
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import UploadFile from "@/app/signup/comps/UploadFile";
import { reUploadResume } from "@/lib/api/resume";

// ✅ NEW: Import CommuteScore
import CommuteScore from "@/components/CommuteScore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const dispatch = useAppDispatch();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  // Selection process & similar jobs
  const [selectionProcess, setSelectionProcess] = useState<SelectionProcess | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);

  // ✅ NEW: State for user's location
  const [userLocation, setUserLocation] = useState<string | undefined>(undefined);

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
    fetchUserLocation();
  }, [jobId]);

  async function fetchJobDetails() {
    try {
      setLoading(true);
      const data = await getJobById(jobId);
      setJob(data);

      // Fetch selection process (silent fail)
      try {
        const token = localStorage.getItem("access_token");
        const selRes = await fetch(`${API_BASE}/selection/job/${jobId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (selRes.ok) setSelectionProcess(await selRes.json());
      } catch { /* silent */ }

      // Fetch similar jobs by first 3 skills
      try {
        if (data.required_skills?.length) {
          const skills = data.required_skills.slice(0, 3).join(",");
          const sim = await searchJobs({ skills, limit: 4 });
          setSimilarJobs(sim.items.filter((j) => j.id !== jobId));
        }
      } catch { /* silent */ }
    } catch (error: any) {
      dispatch(showAlert({
        title: "Load Error",
        message: error?.response?.data?.detail || "Failed to load job details",
        type: "error"
      }));
      router.push("/jobs");
    } finally {
      setLoading(false);
    }
  }

  // ✅ NEW: Fetch the job seeker's location from their profile
  async function fetchUserLocation() {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${API_BASE}/auth/me/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data.role === "jobseeker" && data.profile?.location) {
        setUserLocation(data.profile.location);
      }
    } catch {
      // silent fail
    }
  }

  async function openApplyModal() {
    try {
      const resumesData = await getMyResumes();
      setResumes(resumesData.resumes);

      const primaryResume = resumesData.resumes.find((r) => r.is_primary);
      if (primaryResume) {
        setSelectedResumeId(primaryResume.id);
      }

      const letters = await getCoverLetters();
      setCoverLetters(letters);

      setIsApplyModalOpen(true);
    } catch (error: any) {
      dispatch(showAlert({
        title: "Data Error",
        message: "Failed to load application data",
        type: "error"
      }));
      setIsApplyModalOpen(true);
    }
  }

  async function handleResumeUpload(file: File) {
    if (!file) return;

    try {
      setUploadingResume(true);
      const result = await reUploadResume(file);
      dispatch(showAlert({
        title: "Success",
        message: result.message || "Resume uploaded successfully!",
        type: "success"
      }));

      const resumesData = await getMyResumes();
      setResumes(resumesData.resumes);

      const primaryResume = resumesData.resumes.find((r) => r.is_primary);
      if (primaryResume) {
        setSelectedResumeId(primaryResume.id);
        setNewResumeFile(null);
      }
    } catch (error: any) {
      dispatch(showAlert({
        title: "Upload Error",
        message: error?.response?.data?.detail || "Failed to upload resume",
        type: "error"
      }));
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
      setSelectedCoverLetterId("");
      dispatch(showAlert({
        title: "AI Generated",
        message: "AI cover letter generated!",
        type: "success"
      }));
    } catch (error: any) {
      dispatch(showAlert({
        title: "Generation Error",
        message: error?.response?.data?.detail || "Failed to generate cover letter",
        type: "error"
      }));
    } finally {
      setGeneratingAI(false);
    }
  }

  async function handleSaveCoverLetter() {
    if (!coverLetterTitle.trim()) {
      dispatch(showAlert({
        title: "Missing Title",
        message: "Please enter a title for the cover letter",
        type: "error"
      }));
      return;
    }

    try {
      setSavingCoverLetter(true);
      await createCoverLetter({
        title: coverLetterTitle,
        content: coverLetterText,
      });
      dispatch(showAlert({
        title: "Success",
        message: "Cover letter saved!",
        type: "success"
      }));
      setShowSaveDialog(false);
      setCoverLetterTitle("");

      const letters = await getCoverLetters();
      setCoverLetters(letters);
    } catch (error: any) {
      dispatch(showAlert({
        title: "Save Error",
        message: error?.response?.data?.detail || "Failed to save cover letter",
        type: "error"
      }));
    } finally {
      setSavingCoverLetter(false);
    }
  }

  async function handleApply() {
    if (!selectedResumeId) {
      dispatch(showAlert({
        title: "Missing Resume",
        message: "Please select a resume",
        type: "error"
      }));
      return;
    }

    try {
      setApplying(true);
      await applyToJob({
        job_id: jobId,
        resume_id: selectedResumeId,
        cover_letter: coverLetterText || undefined,
      });
      dispatch(showAlert({
        title: "Success",
        message: "Application submitted successfully!",
        type: "success"
      }));
      setIsApplyModalOpen(false);
      router.push("/jobseeker/applications");
    } catch (error: any) {
      dispatch(showAlert({
        title: "Apply Error",
        message: error?.response?.data?.detail || "Failed to submit application",
        type: "error"
      }));
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
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <CardTitle className="text-3xl">{job.title}</CardTitle>
                  {/* Closing Soon badge */}
                  {(() => {
                    const daysLeft = Math.ceil(
                      (new Date(job.application_deadline).getTime() - Date.now()) / 86400000
                    );
                    return daysLeft > 0 && daysLeft <= 3 ? (
                      <Badge className="bg-red-100 text-red-700 border-0 animate-pulse">
                        Closing in {daysLeft} day{daysLeft === 1 ? "" : "s"}
                      </Badge>
                    ) : null;
                  })()}
                </div>
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

        {/* Posted By Card */}
        {job.posted_by && (
          <Card
            className="mb-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/employer/public/${job.posted_by!.id}`)}
          >
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">
                Posted By
              </p>
              <div className="flex items-center gap-3">
                {job.posted_by.logo_url ? (
                  <img
                    src={job.posted_by.logo_url}
                    alt="logo"
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Building className="h-6 w-6 text-purple-600" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{job.posted_by.full_name}</p>
                  {job.posted_by.job_title && (
                    <p className="text-sm text-gray-500">{job.posted_by.job_title}</p>
                  )}
                  <p className="text-sm text-purple-600">{job.posted_by.company_name}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        )}

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
          <Card className="mb-6">
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

        {/* Selection Process */}
        {selectionProcess && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-purple-600" />
                Selection Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectionProcess.rounds.map((round) => (
                  <div
                    key={round.number}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {round.number}
                    </div>
                    <div>
                      <p className="font-medium">{round.title}</p>
                      <p className="text-sm text-purple-600 capitalize">{round.type}</p>
                      {round.description && (
                        <p className="text-sm text-gray-600 mt-1">{round.description}</p>
                      )}
                      <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        {round.duration_minutes && (
                          <span>{round.duration_minutes} min</span>
                        )}
                        <span>{round.is_online ? "Online" : "In-Person"}</span>
                        {round.location_or_link && (
                          <span>{round.location_or_link}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {selectionProcess.instructions && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-medium text-amber-800">Additional Instructions</p>
                  <p className="text-sm text-amber-700 mt-1">{selectionProcess.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Commute Estimate */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Commute Estimate</CardTitle>
          </CardHeader>
          <CardContent>
            <CommuteScore
              jobLocation={job.location}
              workMode={job.work_mode}
              jobType={job.job_type}
              userLocation={userLocation}
            />
          </CardContent>
        </Card>

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Similar Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {similarJobs.map((sj) => (
                <Link key={sj.id} href={`/jobs/${sj.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{sj.title}</p>
                      <p className="text-xs text-gray-500">
                        {sj.company_name} • {sj.location}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

      </div>

      {/* Apply Modal — unchanged */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
            <DialogDescription>
              Submit your application with a resume and cover letter
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Resume <span className="text-red-500">*</span>
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <UploadFile
                  loading={uploadingResume}
                  onFileUploaded={(file) => file && handleResumeUpload(file)}
                />
              </div>

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
                          {resume.is_primary && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Primary
                            </span>
                          )}
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

      {/* Save Cover Letter Dialog — unchanged */}
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
            <Button onClick={handleSaveCoverLetter} disabled={savingCoverLetter}>
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