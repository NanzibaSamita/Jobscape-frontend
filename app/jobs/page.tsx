"use client";

import { useState, useEffect, useCallback } from "react";
import { searchJobs, Job, JobSearchParams } from "@/lib/api/jobs";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Search,
  SlidersHorizontal,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Filters {
  keyword: string;
  work_mode: string;
  job_type: string;
  experience_level: string;
  salary_min: string;
  salary_max: string;
  posted_within_days: string;
  sort_by: "recent" | "salary_high" | "salary_low";
  fresh_grad_friendly: boolean;
  verification_tier: string;
}

const EMPTY_FILTERS: Filters = {
  keyword: "",
  work_mode: "",
  job_type: "",
  experience_level: "",
  salary_min: "",
  salary_max: "",
  posted_within_days: "",
  sort_by: "recent",
  fresh_grad_friendly: false,
  verification_tier: "",
};

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    doSearch();
  }, []);

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    doSearch(EMPTY_FILTERS);
  }

  async function doSearch(overrideFilters?: Filters) {
    const f = overrideFilters ?? filters;
    try {
      setLoading(true);
      const params: JobSearchParams = {
        keyword: f.keyword || undefined,
        work_mode: f.work_mode || undefined,
        job_type: f.job_type || undefined,
        experience_level: f.experience_level || undefined,
        salary_min: f.salary_min ? Number(f.salary_min) : undefined,
        salary_max: f.salary_max ? Number(f.salary_max) : undefined,
        posted_within_days: f.posted_within_days
          ? Number(f.posted_within_days)
          : undefined,
        sort_by: f.sort_by,
        fresh_grad_friendly: f.fresh_grad_friendly || undefined,
        verification_tier: f.verification_tier || undefined,
        limit: 30,
      };
      const data = await searchJobs(params);
      setJobs(data.items);
      setTotal(data.total);
    } catch (error: any) {
      dispatch(showAlert({
        title: "Search Error",
        message: error?.response?.data?.detail || "Failed to load jobs",
        type: "error"
      }));
    } finally {
      setLoading(false);
    }
  }

  // derive active chips
  const activeChips: { label: string; key: keyof Filters }[] = [];
  if (filters.work_mode) activeChips.push({ label: filters.work_mode, key: "work_mode" });
  if (filters.job_type) activeChips.push({ label: filters.job_type.replace("_", " "), key: "job_type" });
  if (filters.experience_level) activeChips.push({ label: filters.experience_level, key: "experience_level" });
  if (filters.salary_min) activeChips.push({ label: `Min ৳${Number(filters.salary_min).toLocaleString()}`, key: "salary_min" });
  if (filters.salary_max) activeChips.push({ label: `Max ৳${Number(filters.salary_max).toLocaleString()}`, key: "salary_max" });
  if (filters.posted_within_days) activeChips.push({ label: `Last ${filters.posted_within_days}d`, key: "posted_within_days" });
  if (filters.fresh_grad_friendly) activeChips.push({ label: "Fresh Grad Friendly", key: "fresh_grad_friendly" });
  if (filters.verification_tier) activeChips.push({ label: "Verified Only", key: "verification_tier" });

  function clearChip(key: keyof Filters) {
    const cleared = { ...filters, [key]: key === "fresh_grad_friendly" ? false : "" };
    setFilters(cleared);
    doSearch(cleared);
  }

  const Sidebar = () => (
    <aside className="bg-white rounded-xl p-5 shadow-sm h-fit lg:sticky lg:top-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-lg">Filters</h2>
        <button
          onClick={resetFilters}
          className="text-sm text-purple-600 hover:text-purple-800"
        >
          Clear all
        </button>
      </div>

      {/* Sort By */}
      <FilterSection label="Sort By">
        <Select
          value={filters.sort_by}
          onValueChange={(v) => updateFilter("sort_by", v as Filters["sort_by"])}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="salary_high">Highest Salary</SelectItem>
            <SelectItem value="salary_low">Lowest Salary</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      {/* Work Mode */}
      <FilterSection label="Work Mode">
        {["remote", "onsite", "hybrid"].map((m) => (
          <label key={m} className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="radio"
              name="work_mode"
              value={m}
              checked={filters.work_mode === m}
              onChange={() => updateFilter("work_mode", m)}
              className="accent-purple-600"
            />
            <span className="capitalize">{m}</span>
          </label>
        ))}
        {filters.work_mode && (
          <button
            className="text-xs text-gray-400 hover:text-red-500"
            onClick={() => updateFilter("work_mode", "")}
          >
            Clear
          </button>
        )}
      </FilterSection>

      {/* Job Type */}
      <FilterSection label="Job Type">
        {["full_time", "part_time", "contract", "internship"].map((t) => (
          <label key={t} className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="radio"
              name="job_type"
              value={t}
              checked={filters.job_type === t}
              onChange={() => updateFilter("job_type", t)}
              className="accent-purple-600"
            />
            <span>{t.replace("_", " ")}</span>
          </label>
        ))}
        {filters.job_type && (
          <button
            className="text-xs text-gray-400 hover:text-red-500"
            onClick={() => updateFilter("job_type", "")}
          >
            Clear
          </button>
        )}
      </FilterSection>

      {/* Experience Level */}
      <FilterSection label="Experience Level">
        {["entry", "mid", "senior", "lead"].map((l) => (
          <label key={l} className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="radio"
              name="experience_level"
              value={l}
              checked={filters.experience_level === l}
              onChange={() => updateFilter("experience_level", l)}
              className="accent-purple-600"
            />
            <span className="capitalize">{l}</span>
          </label>
        ))}
        {filters.experience_level && (
          <button
            className="text-xs text-gray-400 hover:text-red-500"
            onClick={() => updateFilter("experience_level", "")}
          >
            Clear
          </button>
        )}
      </FilterSection>

      {/* Salary Range */}
      <FilterSection label="Salary Range (BDT)">
        <div className="flex gap-2">
          <Input
            placeholder="Min"
            value={filters.salary_min}
            onChange={(e) => updateFilter("salary_min", e.target.value)}
            type="number"
            className="text-sm"
          />
          <Input
            placeholder="Max"
            value={filters.salary_max}
            onChange={(e) => updateFilter("salary_max", e.target.value)}
            type="number"
            className="text-sm"
          />
        </div>
      </FilterSection>

      {/* Posted Within */}
      <FilterSection label="Posted Within">
        <Select
          value={filters.posted_within_days || "all"}
          onValueChange={(v) => updateFilter("posted_within_days", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any time</SelectItem>
            <SelectItem value="1">Last 24 hours</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      {/* Fresh Grad */}
      <label className="flex items-center gap-2 cursor-pointer text-sm mb-4">
        <input
          type="checkbox"
          checked={filters.fresh_grad_friendly}
          onChange={(e) => updateFilter("fresh_grad_friendly", e.target.checked)}
          className="accent-purple-600"
        />
        <span>Fresh Graduate Friendly</span>
      </label>

      {/* Verified Only */}
      <label className="flex items-center gap-2 cursor-pointer text-sm">
        <input
          type="checkbox"
          checked={filters.verification_tier === "FULLY_VERIFIED"}
          onChange={(e) =>
            updateFilter("verification_tier", e.target.checked ? "FULLY_VERIFIED" : "")
          }
          className="accent-purple-600"
        />
        <span>Verified Employers Only</span>
      </label>

      <Button
        onClick={() => doSearch()}
        className="w-full mt-5 bg-purple-600 hover:bg-purple-700"
      >
        Apply Filters
      </Button>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-6">
          {/* Sidebar — desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search Bar */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Search job title, keywords..."
                value={filters.keyword}
                onChange={(e) => updateFilter("keyword", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                className="flex-1"
              />
              <Button
                onClick={() => doSearch()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              {/* Mobile filter toggle */}
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
              <div className="lg:hidden mb-4">
                <Sidebar />
              </div>
            )}

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => clearChip(chip.key)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200 transition-colors"
                  >
                    {chip.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}

            {/* Results count */}
            {!loading && (
              <p className="text-sm text-gray-500 mb-4">
                {total} job{total !== 1 ? "s" : ""} found
              </p>
            )}

            {/* Jobs */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No jobs found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try adjusting your filters or search terms
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={resetFilters}
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => {
                  const daysLeft = Math.ceil(
                    (new Date(job.application_deadline).getTime() - Date.now()) /
                      86400000
                  );
                  return (
                    <Card
                      key={job.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-xl">
                                {job.title}
                              </CardTitle>
                              {daysLeft > 0 && daysLeft <= 3 && (
                                <Badge className="bg-red-100 text-red-700 border-0 animate-pulse text-xs">
                                  Closing in {daysLeft}d
                                </Badge>
                              )}
                              {job.is_fresh_graduate_friendly && (
                                <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                                  Fresh Grad ✓
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mt-0.5">
                              {job.company_name || "Company"}
                            </p>
                          </div>
                          <Link href={`/jobs/${job.id}`}>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex-shrink-0">
                              View
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Briefcase className="h-4 w-4 flex-shrink-0" />
                            {job.job_type?.replace("_", " ")}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            {job.work_mode}
                          </div>
                          {job.salary_min && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <DollarSign className="h-4 w-4 flex-shrink-0" />
                              {job.salary_min.toLocaleString()}
                              {job.salary_max
                                ? ` - ${job.salary_max.toLocaleString()}`
                                : "+"}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {job.required_skills.slice(0, 5).map((skill, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {job.required_skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.required_skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
