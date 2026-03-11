"use client";

type CertificationItem = {
  name?: string;
  authority?: string;
  dateIssued?: string;
};

export default function CertificationsForm({
  data,
  onChange,
}: {
  data: CertificationItem[];
  onChange: (v: CertificationItem[]) => void;
}) {
  function updateItem(index: number, patch: Partial<CertificationItem>) {
    const copy = [...(data || [])];
    copy[index] = { ...copy[index], ...patch };
    onChange(copy);
  }

  function addItem() {
    onChange([
      ...(data || []),
      {
        name: "",
        authority: "",
        dateIssued: "",
      },
    ]);
  }

  function removeItem(index: number) {
    onChange((data || []).filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Certifications</h2>

        <button
          type="button"
          onClick={addItem}
          className="bg-violet-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-violet-800"
        >
          + Add
        </button>
      </div>

      {(data || []).length === 0 ? (
        <p className="text-xs text-gray-400">No certifications added.</p>
      ) : (
        <div className="space-y-3">
          {(data || []).map((item, i) => (
            <div key={i} className="border rounded-xl p-4 bg-white">
              {/* Name */}
              <div>
                <label className="text-xs text-gray-500">
                  Certification Name
                </label>
                <input
                  className="w-full border rounded-md px-2 py-1 text-xs"
                  value={item.name ?? ""}
                  onChange={(e) => updateItem(i, { name: e.target.value })}
                  placeholder="React Basics"
                />
              </div>

              {/* Authority + Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs text-gray-500">Authority</label>
                  <input
                    className="w-full border rounded-md px-2 py-1 text-xs"
                    value={item.authority ?? ""}
                    onChange={(e) =>
                      updateItem(i, { authority: e.target.value })
                    }
                    placeholder="Coursera / Google / Microsoft"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Date Issued</label>
                  <input
                    type="date"
                    className="w-full border rounded-md px-2 py-1 text-xs text-black"
                    value={item.dateIssued ?? ""}
                    onChange={(e) =>
                      updateItem(i, { dateIssued: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Delete */}
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
