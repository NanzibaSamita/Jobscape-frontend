"use client";
import { Menu } from "lucide-react";

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? "G";
  const last = parts[parts.length - 1]?.[0] ?? "U";
  return (first + last).toUpperCase();
}

export default function Header({
  name,
  location,
  onToggleSidebar,
}: {
  name: string;
  location?: string | null;
  onToggleSidebar: () => void;
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
            <span
              className="bg-violet-900 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1
"
            >
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

      {/* Sidebar toggle */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="p-1.5 rounded-md hover:bg-purple-200 transition"
        aria-label="Toggle sidebar"
      >
        <Menu size={16} />
      </button>
    </div>
  );
}
