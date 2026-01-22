export default function Languages({ data }: { data: any[] }) {
  return (
    <div>
      {/* Section title */}
      <h2 className="text-lg font-semibold mb-3">Languages</h2>

      {data.length === 0 ? (
        <p className="text-xs text-gray-400">No languages added.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {data.map((l, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-medium"
            >
              {l.name}
              {l.level ? ` — ${l.level}` : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
