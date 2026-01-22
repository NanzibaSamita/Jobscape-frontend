"use client";
import Link from "next/link";

export default function ProfileEditHeader({
  name,
  location,
  onSave,
}: {
  name: string;
  location?: string | null;
  onSave: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500">Editing profile</p>
        <h1 className="text-sm font-semibold leading-tight">
          {name}
          {location ? (
            <span className="text-xs font-medium text-gray-500">
              {" "}
              • {location}
            </span>
          ) : null}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/jobseeker/profile">
          <button
            type="button"
            className="px-3 py-1.5 rounded-xl border border-purple-100 bg-white text-xs font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </Link>

        <button
          type="button"
          onClick={onSave}
          className="px-3 py-1.5 rounded-xl bg-violet-900 text-white text-xs font-medium hover:bg-violet-800"
        >
          Save
        </button>
      </div>
    </div>
  );
}
