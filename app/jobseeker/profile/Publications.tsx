export default function Publications({ data }: { data: any[] }) {
  return (
    <div>
      {/* Section title */}
      <h2 className="text-lg font-semibold mb-3">Publications</h2>

      {data.length === 0 ? (
        <p className="text-xs text-gray-400">No publications added.</p>
      ) : (
        <div className="space-y-2">
          {data.map((p, i) => (
            <div key={i} className="border rounded-lg p-3 bg-white">
              {/* Publication title */}
              <p className="text-sm font-semibold leading-tight">{p.title}</p>

              {/* Year */}
              {p.year && (
                <p className="text-xs text-gray-400">Year: {p.year}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
