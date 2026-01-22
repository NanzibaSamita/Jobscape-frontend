export default function Volunteer({ data }: { data: any[] }) {
  return (
    <div>
      {/* Section title */}
      <h2 className="text-lg font-semibold mb-3">Volunteer Experience</h2>

      {data.length === 0 ? (
        <p className="text-xs text-gray-400">No volunteer experience added.</p>
      ) : (
        <div className="space-y-2">
          {data.map((v, i) => (
            <div key={i} className="border rounded-lg p-3 bg-white">
              {/* Organization */}
              <p className="text-sm font-semibold leading-tight">{v.org}</p>

              {/* Role */}
              {v.role && <p className="text-xs text-gray-600">{v.role}</p>}

              {/* Year */}
              {v.year && (
                <p className="text-xs text-gray-400">Year: {v.year}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
