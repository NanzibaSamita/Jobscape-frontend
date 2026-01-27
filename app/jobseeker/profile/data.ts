import { JobSeeker } from "./types";

export const jobSeeker: JobSeeker = {
  full_name: "Guest User",
  profile_picture_url: null,
  phone: "+8801712345678",
  location: "Dhaka, Bangladesh",
  professional_summary:
    "Aspiring frontend developer focused on building clean UI and experiences.",

  inferred_industries: ["Software", "Web Development", "Frontend"],
  primary_industry: "Frontend Development",

  // JSONB fields
  skills: ["Communication", "Teamwork", "React", "Next.js", "TypeScript"],

  experience: [
    {
      title: "Frontend Intern",
      company: "Example Company",
      start_date: "2023-06-01",
      end_date: "2023-08-01",
      description: "Worked on UI components",
    },
  ],

  education: [
    {
      degree: "BSc",
      institution: "Example University",
      start_date: "2020-01-01",
      end_date: "2024-01-01",
      field: "Computer Science",
    },
  ],

  projects: [
    {
      name: "Job Portal UI",
      role: "Frontend Developer",
      description: "A job portal interface with profiles and listings.",
      duration: "3 months",
    },
  ],

  certifications: [
    { name: "React Basics", authority: "Coursera", dateIssued: "2023-05" },
  ],

  awards: [
    { name: "Best Intern Award", year: "2023" },
    { name: "Best Developer Award", year: "2024" },
  ],

  languages: [
    { name: "English", level: "Fluent" },
    { name: "Bangla", level: "Native" },
  ],

  volunteer_experience: [
    { org: "Red Crescent", role: "Volunteer", year: "2022" },
  ],

  publications: [{ title: "UI Patterns for Job Platforms", year: "2024" }],

  linkedin_url: "https://linkedin.com/in/guest",
  github_url: "https://github.com/guest",
  portfolio_url: "https://guest.dev",
  other_links: ["https://medium.com/@guest"],
};
