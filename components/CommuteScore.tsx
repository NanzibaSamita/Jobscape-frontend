"use client";
// components/CommuteScore.tsx

import { useState, useEffect } from "react";
import { MapPin, Clock, Car, AlertCircle, Navigation } from "lucide-react";
import { calculateCommuteScore } from "@/lib/api/commute";

interface CommuteScoreProps {
  jobLocation: string;
  workMode: string;
  jobType: string;
  userLocation?: string;
}

interface Coords {
  lat: number;
  lng: number;
}

// ─── Nominatim geocoder ───────────────────────────────────────────────────────

async function geocode(location: string): Promise<Coords | null> {
  // Append ", Bangladesh" if the string looks too short/vague (no comma = no country/city qualifier)
  // This way "Dhaka" becomes "Dhaka, Bangladesh" for Nominatim
  const query = location.includes(",") ? location : `${location}, Bangladesh`;

  try {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(query)}&format=json&limit=1`;

    const res = await fetch(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "JBscape/1.0 (contact@jbscape.com)",
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;

    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

// ─── Score ring SVG ───────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const size = 72;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  const color =
    score >= 80 ? "#10b981" :
    score >= 60 ? "#f59e0b" :
    score >= 40 ? "#f97316" :
    "#ef4444";

  const textColor =
    score >= 80 ? "text-emerald-600" :
    score >= 60 ? "text-amber-500" :
    score >= 40 ? "text-orange-500" :
    "text-red-500";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="currentColor" strokeWidth="6"
          className="text-gray-200 dark:text-gray-700" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-lg font-bold ${textColor}`}>{score}</span>
      </div>
    </div>
  );
}

// ─── Work mode config ─────────────────────────────────────────────────────────

function getWorkModeConfig(workMode: string) {
  const lower = workMode.toLowerCase();
  if (lower === "remote") {
    return { isRemote: true, label: "Remote", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
  }
  if (lower === "hybrid") {
    return { isRemote: false, label: "Hybrid", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
  }
  return { isRemote: false, label: "On-site", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CommuteScore({ jobLocation, workMode, userLocation }: CommuteScoreProps) {
  const [score, setScore] = useState<number | null>(null);
  const [rating, setRating] = useState<string>("");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cfg = getWorkModeConfig(workMode);

  useEffect(() => {
    if (cfg.isRemote) return;
    if (!userLocation) return;
    fetchScore();
  }, [jobLocation, userLocation, workMode]);

  async function fetchScore() {
    setLoading(true);
    setError(null);

    try {
      // Geocode both locations in parallel
      const [origin, dest] = await Promise.all([
        geocode(userLocation!),
        geocode(jobLocation),
      ]);

      if (!origin) {
        setError("Could not find your location. Update it in your profile.");
        return;
      }
      if (!dest) {
        setError("Could not find the job location.");
        return;
      }

      // Use your existing axiosInstance-based API call from lib/api/commute.ts
      const result = await calculateCommuteScore({
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        dest_lat: dest.lat,
        dest_lng: dest.lng,
        mode: "driving",
      });

      setScore(result.score);
      setRating(result.rating);
      setDistanceKm(result.travel_distance_km);
      setDurationMin(result.duration_minutes);
    } catch (err: any) {
      setError("Unable to calculate commute score.");
    } finally {
      setLoading(false);
    }
  }

  // ── Remote job ──
  if (cfg.isRemote) {
    return (
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 p-2.5">
            <Navigation className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Remote Position</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Work from anywhere — no commute required ✓</p>
          </div>
        </div>
      </div>
    );
  }

  // ── No user location set ──
  if (!userLocation) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Commute Score Unavailable</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Add your location in your profile to see how far this job is from you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 p-4">
        <div className="flex items-center gap-3">
          <div className="h-[72px] w-[72px] rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-28 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-4">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // ── Score result ──
  if (score === null) return null;

  const scoreDesc =
    score >= 80 ? "Very close — easy daily commute" :
    score >= 60 ? "Manageable commute distance" :
    score >= 40 ? "Moderate commute — plan accordingly" :
    "Long commute — consider hybrid/remote options";

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
      <div className="flex items-center gap-1.5 mb-3">
        <Car className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Commute Score</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
      </div>

      <div className="flex items-center gap-4">
        <ScoreRing score={score} />

        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">{rating}</p>

          <div className="space-y-1">
            {distanceKm !== null && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{distanceKm} km from your location</span>
              </div>
            )}
            {durationMin !== null && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>~{Math.round(durationMin)} min by car</span>
              </div>
            )}
          </div>

          <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">{scoreDesc}</p>
        </div>
      </div>
    </div>
  );
}