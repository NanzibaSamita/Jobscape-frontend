"use client";

type ExperienceItem = {
  title?: string;
  company?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
};

export default function ExperienceForm({
  data,
  onChange,
}: {
  data: ExperienceItem[];
  onChange: (v: ExperienceItem[]) => void;
}) {
  function updateItem(index: number, patch: Partial<ExperienceItem>) {
    const copy = [...(data || [])];
    copy[index] = { ...copy[index], ...patch };
    onChange(copy);
  }

  function addItem() {
    onChange([
      ...(data || []),
      {
        title: "",
        company: "",
        start_date: "",
        end_date: "",
        description: "",
      },
    ]);
  }

  function removeItem(index: number) {
    onChange((data || []).filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Experience</h2>

        <button
          type="button"
          onClick={addItem}
          className="bg-violet-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-violet-800"
        >
          + Add
        </button>
      </div>

      {(data || []).length === 0 ? (
        <p className="text-xs text-gray-400">No experience added.</p>
      ) : (
        <div className="space-y-3">
          {(data || []).map((item, i) => (
            <div key={i} className="border rounded-xl p-4 bg-white">
              {/* Top row: Title + Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Title</label>
                  <input
                    className="w-full border rounded-md px-2 py-1 text-xs"
                    value={item.title ?? ""}
                    onChange={(e) => updateItem(i, { title: e.target.value })}
                    placeholder="Frontend Intern"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Company</label>
                  <input
                    className="w-full border rounded-md px-2 py-1 text-xs"
                    value={item.company ?? ""}
                    onChange={(e) => updateItem(i, { company: e.target.value })}
                    placeholder="Example Company"
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

              {/* Description */}
              <div className="mt-3">
                <label className="text-xs text-gray-500">Description</label>
                <textarea
                  className="w-full border rounded-md p-2 text-xs"
                  rows={3}
                  value={item.description ?? ""}
                  onChange={(e) =>
                    updateItem(i, { description: e.target.value })
                  }
                  placeholder="Worked on UI components..."
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
