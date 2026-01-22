export default function Experience({ data }: { data: any[] }) {
  return (
    <div>
      {/* Section title */}
      <h2 className="text-lg font-semibold mb-3">Experience</h2>

      {data.length === 0 ? (
        <p className="text-xs text-gray-400">No experience added.</p>
      ) : (
        <div className="space-y-2">
          {data.map((e, i) => (
            <div key={i} className="border rounded-lg p-3 bg-white">
              {/* Job title + company */}
              <p className="text-sm font-semibold leading-tight">
                {e.title} — {e.company}
              </p>

              {/* Date range */}
              <p className="text-xs text-gray-500">
                {e.start_date} - {e.end_date}
              </p>

              {/* Description */}
              {e.description && (
                <p className="text-xs text-gray-600 mt-1 leading-snug">
                  {e.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
