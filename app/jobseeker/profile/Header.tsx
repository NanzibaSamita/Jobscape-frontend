"use client";
import Link from "next/link";

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? "G";
  const last = parts[parts.length - 1]?.[0] ?? "U";
  return (first + last).toUpperCase();
}

export default function Header({
  name,
  location,
}: {
  name: string;
  location?: string | null;
}) {
  return (
    <div className="bg-gradient-to-r from-purple-100 to-purple-50 px-5 py-4 rounded-xl flex justify-between items-center">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold border-2 border-white">
          {getInitials(name)}
        </div>

        <div>
          {/* Name */}
          <h1 className="text-sm font-semibold leading-tight">{name}</h1>

          {/* Badges */}
          <div className="flex gap-2 mt-1 flex-wrap">
            <span className="bg-violet-900 text-white px-2 py-0.5 rounded-full text-xs font-medium">
              Job Seeker
            </span>

            {location && (
              <span className="border border-purple-200 bg-white px-2 py-0.5 rounded-full text-xs font-medium">
                {location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit button (right side) */}
      <Link href="/jobseeker/profile/edit">
        <button className="bg-white border border-purple-200 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-purple-50 transition">
          Edit
        </button>
      </Link>
    </div>
  );
}
