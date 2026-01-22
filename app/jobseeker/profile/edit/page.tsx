"use client";
import { useState } from "react";
import { Menu } from "lucide-react";

import { jobSeeker } from "../data"; // uses view dummy data for now
import ProfileEditHeader from "./ProfileEditHeader";
import SummaryForm from "./SummaryForm";
import SkillsForm from "./SkillsForm";
import EducationForm from "./EducationForm";
import ExperienceForm from "./ExperienceForm";
import ProjectsForm from "./ProjectsForm";
import CertificationsForm from "./CertificationsForm";
import AwardsForm from "./AwardsForm";
import LanguagesForm from "./LanguagesForm";
import VolunteerForm from "./VolunteerForm";
import PublicationsForm from "./PublicationsForm";
import LinksForm from "./LinksForm";

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Local editable state (later replace with API data)
  const [profile, setProfile] = useState(jobSeeker);

  function save() {
    // Later: PUT to API
    // await fetch("/api/jobseeker/profile", { method:"PUT", body: JSON.stringify(profile)})
    console.log("SAVE PAYLOAD:", profile);
    alert("Saved (mock). Check console.");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* TOP NAVBAR (outside the profile card) */}
      <div className="sticky top-0 z-30 bg-gray-100">
        <div className="max-w-5xl mx-auto px-6 pt-6">
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm px-5 py-4 flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
              <img
                src="/images/logoBlack.png"
                alt="Logo"
                className="h-8 w-auto"
              />
            </div>

            {/* Right: Hamburger */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 transition"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar / Drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-white border-l shadow-lg p-6 z-50">
            <h3 className="text-lg font-semibold mb-3">Sidebar</h3>
            <p className="text-xs text-gray-600">Put navigation here later.</p>
            <button
              className="mt-6 bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-purple-700"
              onClick={() => setSidebarOpen(false)}
            >
              Close
            </button>
          </div>
        </>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        {/* Profile CARD */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-purple-100 p-6 space-y-8">
          {/* Edit header row */}
          <ProfileEditHeader
            name={profile.full_name}
            location={profile.location}
            onSave={save}
          />

          <SkillsForm
            skills={profile.skills}
            onChange={(v) => setProfile((p) => ({ ...p, skills: v }))}
          />

          <ExperienceForm
            data={profile.experience}
            onChange={(v) => setProfile((p) => ({ ...p, experience: v }))}
          />

          <EducationForm
            data={profile.education}
            onChange={(v) => setProfile((p) => ({ ...p, education: v }))}
          />

          <ProjectsForm
            data={profile.projects}
            onChange={(v) => setProfile((p) => ({ ...p, projects: v }))}
          />

          <CertificationsForm
            data={profile.certifications}
            onChange={(v) => setProfile((p) => ({ ...p, certifications: v }))}
          />

          <AwardsForm
            data={profile.awards}
            onChange={(v) => setProfile((p) => ({ ...p, awards: v }))}
          />

          <LanguagesForm
            data={profile.languages}
            onChange={(v) => setProfile((p) => ({ ...p, languages: v }))}
          />

          <VolunteerForm
            data={profile.volunteer_experience}
            onChange={(v) =>
              setProfile((p) => ({ ...p, volunteer_experience: v }))
            }
          />

          <PublicationsForm
            data={profile.publications}
            onChange={(v) => setProfile((p) => ({ ...p, publications: v }))}
          />

          <LinksForm
            linkedin={profile.linkedin_url}
            github={profile.github_url}
            portfolio={profile.portfolio_url}
            other_links={profile.other_links}
            onChange={(v) =>
              setProfile((p) => ({
                ...p,
                linkedin_url: v.linkedin_url,
                github_url: v.github_url,
                portfolio_url: v.portfolio_url,
                other_links: v.other_links,
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}
