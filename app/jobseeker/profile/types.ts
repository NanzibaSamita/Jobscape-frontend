export type JSONBItem = Record<string, any>;

export type JobSeeker = {
  full_name: string;
  profile_picture_url?: string | null;
  phone?: string | null;
  location?: string | null;
  professional_summary?: string | null;

  inferred_industries: string[];
  primary_industry?: string | null;

  // JSONB fields (backend)
  education: JSONBItem[];
  experience: JSONBItem[];
  skills: string[];
  projects: JSONBItem[];
  certifications: JSONBItem[];
  awards: JSONBItem[];
  languages: JSONBItem[];
  volunteer_experience: JSONBItem[];
  publications: JSONBItem[];

  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  other_links: string[];
};
