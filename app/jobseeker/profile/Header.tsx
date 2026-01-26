import Link from "next/link";

function getInitials(name?: string | null) {
  if (!name || typeof name !== "string") {
    return "GU"; // Default: Guest User
  }
  
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? "G";
  const last = parts[parts.length - 1]?.[0] ?? "U";
  return (first + last).toUpperCase();
}

export default function Header({
  name,
  location,
}: {
  name?: string | null;
  location?: string | null;
}) {
  const displayName = name || "Guest User";
  const displayLocation = location || "Location not set";

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        {/* Left: Avatar + Info */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-2xl font-semibold text-purple-600">
              {getInitials(name)}
            </span>
          </div>

          {/* Name & Location */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
            <p className="text-sm text-gray-500 mt-1">{displayLocation}</p>
          </div>
        </div>

        {/* Edit button (right side) */}
        <Link href="/jobseeker/profile/edit">
          <button className="bg-white border border-purple-200 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-purple-50 transition">
            Edit
          </button>
        </Link>
      </div>
    </div>
  );
}
