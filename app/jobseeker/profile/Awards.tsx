export default function Awards({ data }: { data: any[] }) {
  return (
    <div>
      {/* Section title */}
      <h2 className="text-lg font-semibold mb-3">Awards</h2>

      {data.length === 0 ? (
        <p className="text-xs text-gray-400">No awards added.</p>
      ) : (
        <div className="space-y-2">
          {data.map((a, i) => (
            <div key={i} className="border rounded-lg p-3 bg-white">
              {/* Award name */}
              <p className="text-sm font-semibold leading-tight">{a.name}</p>

              {/* Year */}
              {a.year && (
                <p className="text-xs text-gray-400">Year: {a.year}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
