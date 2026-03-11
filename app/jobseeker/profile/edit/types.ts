export type JSONBItem = Record<string, any>;

export type EditJobSeeker = {
  full_name: string;
  location?: string | null;
  professional_summary?: string | null;

  // JSONB
  education: JSONBItem[];
  experience: JSONBItem[];
  skills: string[];
  projects: JSONBItem[];
  certifications: JSONBItem[];
  awards: JSONBItem[];
  languages: JSONBItem[];
  volunteer_experience: JSONBItem[];
  publications: JSONBItem[];

  // Links
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  other_links: string[];
};
