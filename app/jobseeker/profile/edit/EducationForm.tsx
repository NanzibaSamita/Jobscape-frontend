"use client";

type EducationItem = {
  degree?: string;
  institution?: string;
  start_date?: string;
  end_date?: string;
  field?: string;
};

export default function EducationForm({
  data,
  onChange,
}: {
  data: EducationItem[];
  onChange: (v: EducationItem[]) => void;
}) {
  function updateItem(index: number, patch: Partial<EducationItem>) {
    const copy = [...(data || [])];
    copy[index] = { ...copy[index], ...patch };
    onChange(copy);
  }

  function addItem() {
    onChange([
      ...(data || []),
      {
        degree: "",
        institution: "",
        start_date: "",
        end_date: "",
        field: "",
      },
    ]);
  }

  function removeItem(index: number) {
    onChange((data || []).filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Education</h2>

        <button
          type="button"
          onClick={addItem}
          className="bg-violet-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-violet-800"
        >
          + Add
        </button>
      </div>

      {(data || []).length === 0 ? (
        <p className="text-xs text-gray-400">No education added.</p>
      ) : (
        <div className="space-y-3">
          {(data || []).map((item, i) => (
            <div key={i} className="border rounded-xl p-4 bg-white">
              {/* Degree + Institution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Degree</label>
                  <input
                    className="w-full border rounded-md px-2 py-1 text-xs"
                    value={item.degree ?? ""}
                    onChange={(e) => updateItem(i, { degree: e.target.value })}
                    placeholder="BSc"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Institution</label>
                  <input
                    className="w-full border rounded-md px-2 py-1 text-xs"
                    value={item.institution ?? ""}
                    onChange={(e) =>
                      updateItem(i, { institution: e.target.value })
                    }
                    placeholder="Example University"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs text-gray-500">Start Date</label>
                  <input
                    type="date"
                    className="w-full border rounded-md px-2 py-1 text-xs"
                    value={item.start_date ?? ""}
                    onChange={(e) =>
                      updateItem(i, { start_date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">End Date</label>
                  <input
                    type="date"
                    className="w-full border rounded-md px-2 py-1 text-xs"
                    value={item.end_date ?? ""}
                    onChange={(e) =>
                      updateItem(i, { end_date: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Field */}
              <div className="mt-3">
                <label className="text-xs text-gray-500">Field</label>
                <input
                  className="w-full border rounded-md px-2 py-1 text-xs"
                  value={item.field ?? ""}
                  onChange={(e) => updateItem(i, { field: e.target.value })}
                  placeholder="Computer Science"
                />
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
