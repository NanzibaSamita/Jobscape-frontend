export default function Certifications({ data }: { data: any[] }) {
  return (
    <div>
      {/* Section title */}
      <h2 className="text-lg font-semibold mb-3">Certifications</h2>

      {data.length === 0 ? (
        <p className="text-xs text-gray-400">No certifications added.</p>
      ) : (
        <div className="space-y-2">
          {data.map((c, i) => (
            <div key={i} className="border rounded-lg p-3 bg-white">
              {/* Certification name */}
              <p className="text-sm font-semibold leading-tight">{c.name}</p>

              {/* Authority */}
              {c.authority && (
                <p className="text-xs text-gray-500">
                  Authority: {c.authority}
                </p>
              )}

              {/* Issue date */}
              {c.dateIssued && (
                <p className="text-xs text-gray-400">Issued: {c.dateIssued}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
