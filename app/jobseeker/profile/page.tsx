"use client";
import { useState } from "react";
import { Menu } from "lucide-react";

import { jobSeeker } from "./data";
import Header from "./Header";
import Skills from "./Skills";
import Experience from "./Experience";
import Education from "./Education";
import Projects from "./Projects";
import Certifications from "./Certifications";
import Awards from "./Awards";
import Languages from "./Languages";
import Volunteer from "./Volunteer";
import Publications from "./Publications";
import Links from "./Links";

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* TOP NAVBAR (outside the profile card) */}
      <div className="sticky top-0 z-30 bg-gray-100">
        <div className="max-w-5xl mx-auto px-6 pt-6">
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm px-5 py-4 flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
              <img src="/images/logoBlack.png" alt="Logo" className="h-8 w-auto" />
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
            <h3 className="text-xl font-bold mb-4">Sidebar</h3>
            <p className="text-gray-600">Put navigation here later.</p>
            <button
              className="mt-6 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700"
              onClick={() => setSidebarOpen(false)}
            >
              Close
            </button>
          </div>
        </>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        {/* Profile CARD (inside light purple background) */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-purple-100 p-6 space-y-8">
          {/* Profile header row (inside card) */}
          <Header name={jobSeeker.full_name} location={jobSeeker.location} />

          {/* Sections inside same card */}
          <Skills data={jobSeeker.skills} />
          <Experience data={jobSeeker.experience} />
          <Education data={jobSeeker.education} />
          <Projects data={jobSeeker.projects} />
          <Certifications data={jobSeeker.certifications} />
          <Awards data={jobSeeker.awards} />
          <Languages data={jobSeeker.languages} />
          <Volunteer data={jobSeeker.volunteer_experience} />
          <Publications data={jobSeeker.publications} />
          <Links
            linkedin={jobSeeker.linkedin_url}
            github={jobSeeker.github_url}
            portfolio={jobSeeker.portfolio_url}
            other_links={jobSeeker.other_links}
          />
        </div>
      </div>
    </div>
  );
}
