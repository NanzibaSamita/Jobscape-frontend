"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  getUserProfile,
  updateJobSeekerProfile,
  uploadProfilePicture,
  removeProfilePicture,
  JobSeekerProfile,
} from "@/lib/api/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, X, Plus, Trash2, Save, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProfileEditPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    location: "",
    professional_summary: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
        setLoading(true);
        
        // ✅ Check if token exists first
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        if (!token) {
        router.push("/login");
        return;
        }
        
        const data = await getUserProfile();
        const prof = data.profile as JobSeekerProfile;
        setProfile(prof);
        setFormData({
        full_name: prof.full_name || "",
        phone: prof.phone || "",
        location: prof.location || "",
        professional_summary: prof.professional_summary || "",
        linkedin_url: prof.linkedin_url || "",
        github_url: prof.github_url || "",
        portfolio_url: prof.portfolio_url || "",
        });
        setSkills(prof.skills || []);
    } catch (error: any) {
        toast.error(error?.response?.data?.detail || "Failed to load profile");
        router.push("/login");  // ✅ Redirect on error
    } finally {
        setLoading(false);
    }
    }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      const result = await uploadProfilePicture(file);
      toast.success("Profile picture uploaded successfully");
      // Update local state
      if (profile) {
        setProfile({ ...profile, profile_picture_url: result.url });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleRemoveImage() {
    if (!confirm("Remove profile picture?")) return;

    try {
      await removeProfilePicture();
      toast.success("Profile picture removed");
      if (profile) {
        setProfile({ ...profile, profile_picture_url: null });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to remove image");
    }
  }

  function addSkill() {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      toast.error("Skill already added");
      return;
    }
    setSkills([...skills, trimmed]);
    setNewSkill("");
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  async function handleSave() {
    try {
      setSaving(true);
      await updateJobSeekerProfile({
        ...formData,
        skills,
      });
      toast.success("Profile updated successfully!");
      router.push("/jobseeker/profile");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/jobseeker/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600 mt-1">Update your personal and professional information</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Profile Picture */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                {profile?.profile_picture_url ? (
                  <Image
                    src={profile.profile_picture_url}
                    alt="Profile"
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-4 border-purple-100"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="h-12 w-12 text-purple-600" />
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="relative" disabled={uploadingImage}>
                    <Upload className="h-4 w-4 mr-2" />
                    {profile?.profile_picture_url ? "Change" : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploadingImage}
                    />
                  </Button>

                  {profile?.profile_picture_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={uploadingImage}
                      className="text-red-600"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Recommended: Square image, at least 400x400px. Max size: 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullname">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullname"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+880 1XXX-XXXXXX"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Dhaka, Bangladesh"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                value={formData.professional_summary}
                onChange={(e) => setFormData({ ...formData, professional_summary: e.target.value })}
                placeholder="Brief summary of your professional background and goals..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.professional_summary.length} / 500 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="Add a skill (e.g., JavaScript, Python)"
              />
              <Button onClick={addSkill} type="button">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.length === 0 ? (
                <p className="text-sm text-gray-500">No skills added yet</p>
              ) : (
                skills.map((skill, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="px-3 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:text-red-600"
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Professional Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div>
              <Label htmlFor="github">GitHub URL</Label>
              <Input
                id="github"
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="https://github.com/yourusername"
              />
            </div>

            <div>
              <Label htmlFor="portfolio">Portfolio URL</Label>
              <Input
                id="portfolio"
                type="url"
                value={formData.portfolio_url}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button (bottom) */}
        <div className="flex justify-end gap-2">
          <Link href="/jobseeker/profile">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
