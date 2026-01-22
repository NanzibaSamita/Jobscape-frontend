export default function Projects({ data }: { data: any[] }) {
  return (
    <div>
      {/* Section title */}
      <h2 className="text-lg font-semibold mb-3">Projects</h2>

      {data.length === 0 ? (
        <p className="text-xs text-gray-400">No projects added.</p>
      ) : (
        <div className="space-y-2">
          {data.map((p, i) => (
            <div key={i} className="border rounded-lg p-3 bg-white">
              {/* Project name */}
              <p className="text-sm font-semibold leading-tight">{p.name}</p>

              {/* Role */}
              {p.role && <p className="text-xs text-gray-600">{p.role}</p>}

              {/* Duration */}
              {p.duration && (
                <p className="text-xs text-gray-400">Duration: {p.duration}</p>
              )}

              {/* Description */}
              {p.description && (
                <p className="text-xs text-gray-600 mt-1 leading-snug">
                  {p.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
