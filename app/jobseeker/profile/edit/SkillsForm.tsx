"use client";
import { useMemo, useState } from "react";

const TECH = [
  "javascript",
  "typescript",
  "python",
  "java",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "scala",
  "react",
  "next",
  "next.js",
  "vue",
  "angular",
  "node",
  "node.js",
  "django",
  "flask",
  "spring",
  "laravel",
  "express",
  "html",
  "css",
  "tailwind",
  "bootstrap",
  "sql",
  "postgres",
  "postgresql",
  "mysql",
  "mongodb",
  "docker",
  "kubernetes",
  "aws",
  "gcp",
  "azure",
  "git",
  "github",
  "linux",
  "bash",
  "c",
  "c++",
  "c#",
];

function normalize(x: string) {
  return x.toLowerCase().replace(/[^a-z0-9.+]/g, "");
}
function isTechSkill(skill: string) {
  const s = normalize(skill);
  return TECH.some((k) => normalize(k) === s);
}

export default function SkillsForm({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const uniqueSkills = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of skills || []) {
      const s = (raw ?? "").trim();
      if (!s) continue;
      const key = s.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(s);
    }
    return out;
  }, [skills]);

  function addSkill() {
    const s = input.trim();
    if (!s) return;

    const exists = uniqueSkills.some(
      (x) => x.toLowerCase() === s.toLowerCase(),
    );
    if (exists) {
      setInput("");
      return;
    }

    onChange([...uniqueSkills, s]);
    setInput("");
  }

  function removeSkill(skill: string) {
    onChange(
      uniqueSkills.filter((x) => x.toLowerCase() !== skill.toLowerCase()),
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Skills</h2>

      {/* ONE BOX that contains ALL skills + input */}
      <div className="border border-purple-200 bg-white-50 rounded-2xl p-4">
        {/* Skills row (all together) */}
        <div className="flex flex-wrap gap-2 mb-3">
          {uniqueSkills.length === 0 ? (
            <p className="text-xs text-gray-400">No skills added.</p>
          ) : (
            uniqueSkills.map((s) => (
              <span
                key={s}
                className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 ${
                  isTechSkill(s)
                    ? "bg-violet-900 text-white"
                    : "bg-purple-50 border border-purple-200 text-black"
                }`}
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeSkill(s)}
                  className={`leading-none ${
                    isTechSkill(s)
                      ? "text-white/80 hover:text-white"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                  aria-label={`Remove ${s}`}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        {/* Input row */}
        <div className="flex gap-3">
          <input
            className="w-full border rounded-xl px-4 py-2 text-xs bg-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a skill (e.g., React / Communication)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
          />

          <button
            type="button"
            onClick={addSkill}
            className="bg-violet-900 text-white px-5 py-2 rounded-xl text-xs font-medium hover:bg-violet-800"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
