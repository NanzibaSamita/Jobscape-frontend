"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPublicJobSeekerProfile, trackProfileView, JobSeekerProfile } from "@/lib/api/profile";
import { sendMessage } from "@/lib/api/messages";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";
import { 
  Loader2, Mail, MessageSquare, MapPin, User,
  ChevronLeft, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Re-using seeker profile components
import Skills from "@/app/jobseeker/profile/Skills";
import Experience from "@/app/jobseeker/profile/Experience";
import Education from "@/app/jobseeker/profile/Education";
import Projects from "@/app/jobseeker/profile/Projects";
import Certifications from "@/app/jobseeker/profile/Certifications";
import Awards from "@/app/jobseeker/profile/Awards";
import Languages from "@/app/jobseeker/profile/Languages";
import Links from "@/app/jobseeker/profile/Links";

export default function JobSeekerPublicProfile() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        const data = await getPublicJobSeekerProfile(id as string);
        setProfile(data);
        
        // Track the view (notify the seeker)
        await trackProfileView(id as string);
      } catch (error: any) {
        dispatch(showAlert({
          title: "Error",
          message: error?.response?.data?.detail || "Failed to load candidate profile",
          type: "error"
        }));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, dispatch]);

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !profile) return;
    
    setSendingMessage(true);
    try {
      await sendMessage({
        recipient_id: profile.id,
        recipient_type: "job_seeker",
        content: messageContent,
      });
      
      dispatch(showAlert({
        title: "Message Sent",
        message: `Your message has been sent to ${profile.full_name}`,
        type: "success"
      }));
      
      setIsMessageModalOpen(false);
      setMessageContent("");
    } catch (error: any) {
      dispatch(showAlert({
        title: "Failed to send message",
        message: error?.message || "An unexpected error occurred",
        type: "error"
      }));
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-red-500 font-medium">Candidate profile not found</p>
        <Button variant="link" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button 
                onClick={() => setIsMessageModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Message Candidate
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-10 -mt-10 opacity-50" />
          
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start relative z-10">
            {profile.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                alt={profile.full_name}
                className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-purple-100 flex items-center justify-center border-4 border-white shadow-md">
                <User className="h-14 w-14 text-purple-400" />
              </div>
            )}
            
            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-600 mt-2">
                {profile.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
                {profile.phone && (
                   <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
              </div>
              
              {profile.professional_summary && (
                <p className="text-gray-600 text-sm leading-relaxed mt-4 max-w-2xl">
                  {profile.professional_summary}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-8">
          <Skills data={profile.skills || []} />
          <Experience data={profile.experience || []} />
          <Education data={profile.education || []} />
          <Projects data={profile.projects || []} />
          <Certifications data={profile.certifications || []} />
          <Awards data={profile.awards || []} />
          <Languages data={profile.languages || []} />
          <Links
            linkedin={profile.linkedin_url}
            github={profile.github_url}
            portfolio={profile.portfolio_url}
            other_links={profile.other_links || []}
          />
        </div>
      </div>

      {/* Message Modal */}
      <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Message {profile.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-gray-500">
                Send a direct message to this candidate to discuss opportunities or ask for more information.
            </p>
            <Textarea
              placeholder="Type your message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="min-h-[150px] resize-none focus-visible:ring-purple-500"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageModalOpen(false)}>
              Cancel
            </Button>
            <Button 
                onClick={handleSendMessage} 
                disabled={!messageContent.trim() || sendingMessage}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              {sendingMessage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
