const PROGRAMMING_KEYWORDS = [
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
];

function normalize(skill: string) {
  return skill.toLowerCase().replace(/[^a-z0-9.+]/g, "");
}

function isProgrammingSkill(skill: string) {
  const s = normalize(skill);
  return PROGRAMMING_KEYWORDS.some((k) => s === normalize(k));
}

export default function Skills({ data }: { data: string[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Skills</h2>

      <div className="flex flex-wrap gap-2">
        {data.map((s) => (
          <span
            key={s}
            className={`px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-medium ${
              isProgrammingSkill(s)
                ? "bg-violet-900 text-white"
                : "bg-purple-50 border border-purple-200 text-black"
            }`}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
