export default function Education({ data }: { data: any[] }) {
  return (
    <div>
      {/* Section title */}
      <h2 className="text-lg font-semibold mb-3">Education</h2>

      {data.length === 0 ? (
        <p className="text-xs text-gray-400">No education added.</p>
      ) : (
        <div className="space-y-2">
          {data.map((e, i) => (
            <div key={i} className="border rounded-lg p-3 bg-white">
              {/* Degree + Institution */}
              <p className="text-sm font-semibold leading-tight">
                {e.degree} — {e.institution}
              </p>

              {/* Date range */}
              <p className="text-xs text-gray-500">
                {e.start_date} - {e.end_date}
              </p>

              {/* Field */}
              {e.field && (
                <p className="text-xs text-gray-400">Field: {e.field}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
