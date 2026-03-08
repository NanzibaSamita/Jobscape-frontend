'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Award,
  Languages,
  Link as LinkIcon,
  Download,
  Loader2,
  FileText,
  TrendingUp,
  MessageSquare,
  Filter,
  Search,
  AlertCircle,
  Star,
  ArrowRight,
  Megaphone,
  Video,
  CheckCircle2
} from 'lucide-react';
import axiosInstance from '@/lib/axios/axios';
import { useAppDispatch } from '@/lib/store';
import { showAlert } from '@/lib/store/slices/notificationSlice';

interface ApplicationDetailModalProps {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ApplicationDetails {
  application: {
    id: string;
    match_score: number;
    status: string;
    cover_letter: string | null;
    applied_at: string;
    ats_score?: number;
    ats_report?: any;
    current_round: number;
    skills_match: {
      matched_required: string[];
      matched_preferred: string[];
      missing_required: string[];
    };
  };
  job_seeker: {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    headline: string;
    summary: string;
    skills: string[];
    experience_level: string;
    work_experience: any[];
    education: any[];
    certifications: any[];
    languages: any[];
    portfolio_url: string[];
  };
  resume: {
    id: string;
    file_url: string;
    file_name: string;
    uploaded_at: string;
  } | null;
}

export default function ApplicationDetailModal({ 
  applicationId, 
  isOpen, 
  onClose 
}: ApplicationDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [startingInterview, setStartingInterview] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isOpen && applicationId) {
      loadDetails();
    }
  }, [isOpen, applicationId]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/applications/${applicationId}/details`);
      setDetails(response.data);
    } catch (error: any) {
      console.error('Failed to load details:', error);
      // axios interceptor handles showAlert, but we still need to close modal
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = () => {
    if (details?.resume?.file_url) {
      window.open(details.resume.file_url, '_blank');
    }
  };

  const handleStartInterview = async () => {
    if (!applicationId) return;
    try {
      setStartingInterview(true);
      const res = await axiosInstance.get(`/interviews/application/${applicationId}`);
      const schedule = res.data;
      
      if (!schedule?.schedule_id) throw new Error("No active interview schedule found");

      await axiosInstance.post(`/interviews/${schedule.schedule_id}/start`);
      
      dispatch(showAlert({
        title: "Interview Started",
        message: "Candidate has been notified and invitation sent.",
        type: "success"
      }));
    } catch (err: any) {
      dispatch(showAlert({
        title: "Error starting interview",
        message: err?.response?.data?.detail || err.message || "Failed to notify candidate",
        type: "error"
      }));
    } finally {
      setStartingInterview(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!details) return null;

  const { application, job_seeker, resume } = details;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{job_seeker.full_name}</DialogTitle>
              {job_seeker.headline && (
                <p className="text-muted-foreground mt-1">{job_seeker.headline}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {application.match_score}% Match
              </Badge>
              <span className="text-sm text-muted-foreground">
                Applied {new Date(application.applied_at).toLocaleDateString()}
              </span>
              {application.status === 'INTERVIEW_SCHEDULED' && (
                <Button 
                  size="sm" 
                  onClick={handleStartInterview} 
                  disabled={startingInterview}
                  className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                >
                  {startingInterview ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Video className="h-3.5 w-3.5 mr-2" />}
                  Start Interview
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Contact Information */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${job_seeker.email}`} className="hover:underline">
                    {job_seeker.email}
                  </a>
                </div>
                {job_seeker.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${job_seeker.phone}`} className="hover:underline">
                      {job_seeker.phone}
                    </a>
                  </div>
                )}
                {job_seeker.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job_seeker.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{job_seeker.experience_level}</span>
                </div>
              </div>
            </section>

            {/* AI Analysis & Feedback */}
            {application.ats_report && (
              <section className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 rounded-xl border border-violet-100 dark:border-violet-800/50 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-violet-900 dark:text-violet-100">AI ATS Insight</h3>
                    <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">Automated resume & profile evaluation</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-3 border border-violet-100 dark:border-violet-800">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">ATS Score</p>
                    <p className="text-2xl font-bold text-violet-700">{application.ats_score}%</p>
                  </div>
                  <div className="col-span-2 bg-white dark:bg-zinc-900/50 rounded-lg p-3 border border-violet-100 dark:border-violet-800">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">AI Recommendation</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {application.ats_report.recommendation || "Highly suitable for technical rounds."}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-violet-800 dark:text-violet-300 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="h-4 w-4" /> Strong Aspects
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {application.ats_report.strengths?.map((s: string, i: number) => (
                        <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-violet-800 dark:text-violet-300 flex items-center gap-1.5 mb-2">
                      <AlertCircle className="h-4 w-4" /> Areas for Improvement
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {application.ats_report.gaps?.map((g: string, i: number) => (
                        <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md border border-amber-100">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Skills Match */}
            {application.skills_match && (
              <section>
                <h3 className="text-lg font-semibold mb-3">Skills Match Analysis</h3>
                <div className="space-y-3">
                  {application.skills_match.matched_required?.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Matched Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {application.skills_match.matched_required.map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-green-100 text-green-800">
                            ✓ {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {application.skills_match.matched_preferred?.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Matched Preferred Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {application.skills_match.matched_preferred.map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800">
                            + {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {application.skills_match.missing_required?.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Missing Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {application.skills_match.missing_required.map(skill => (
                          <Badge key={skill} variant="outline" className="text-red-600 border-red-200">
                            ✗ {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Cover Letter */}
            {application.cover_letter && (
              <section>
                <h3 className="text-lg font-semibold mb-3">Cover Letter</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{application.cover_letter}</p>
                </div>
              </section>
            )}

            {/* Summary */}
            {job_seeker.summary && (
              <section>
                <h3 className="text-lg font-semibold mb-3">Professional Summary</h3>
                <p className="text-sm text-muted-foreground">{job_seeker.summary}</p>
              </section>
            )}

            {/* Skills */}
            {job_seeker.skills && job_seeker.skills.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-3">All Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job_seeker.skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Work Experience */}
            {job_seeker.work_experience && job_seeker.work_experience.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </h3>
                <div className="space-y-4">
                  {job_seeker.work_experience.map((exp: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-primary/20 pl-4">
                      <h4 className="font-medium">{exp.job_title}</h4>
                      <p className="text-sm text-muted-foreground">{exp.company_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {exp.start_date} - {exp.end_date || 'Present'}
                      </p>
                      {exp.description && (
                        <p className="text-sm mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {job_seeker.education && job_seeker.education.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </h3>
                <div className="space-y-4">
                  {job_seeker.education.map((edu: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-primary/20 pl-4">
                      <h4 className="font-medium">{edu.degree}</h4>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <p className="text-xs text-muted-foreground">
                        {edu.start_date} - {edu.end_date || 'Present'}
                      </p>
                      {edu.gpa && (
                        <p className="text-sm mt-1">GPA: {edu.gpa}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {job_seeker.certifications && job_seeker.certifications.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications
                </h3>
                <div className="space-y-2">
                  {job_seeker.certifications.map((cert: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <div>
                        <p className="font-medium text-sm">{cert.name}</p>
                        {cert.issuing_organization && (
                          <p className="text-xs text-muted-foreground">
                            {cert.issuing_organization}
                            {cert.issue_date && ` • ${cert.issue_date}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {job_seeker.languages && job_seeker.languages.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job_seeker.languages.map((lang: any, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {lang.language} - {lang.proficiency}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Portfolio Links */}
            {job_seeker.portfolio_url && job_seeker.portfolio_url.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Portfolio & Links
                </h3>
                <div className="space-y-2">
                  {job_seeker.portfolio_url.map((link: string, idx: number) => (
                    <a 
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <LinkIcon className="h-3 w-3" />
                      {link}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Resume Viewer */}
            {resume && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Resume
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadResume}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                
                {/* Embedded PDF Viewer */}
                <div className="border rounded-lg overflow-hidden bg-muted/20">
                  <iframe
                    src={`${resume.file_url}#toolbar=0`}
                    className="w-full h-[600px]"
                    title="Resume"
                  />
                </div>
                
                {/* Fallback link if iframe doesn't work */}
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Can't see the resume? 
                  <button 
                    onClick={downloadResume}
                    className="text-primary hover:underline ml-1"
                  >
                    Open in new tab
                  </button>
                </p>
              </section>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}