"use client";

type VolunteerItem = {
  org?: string;
  role?: string;
  year?: string;
};

export default function VolunteerForm({
  data,
  onChange,
}: {
  data: VolunteerItem[];
  onChange: (v: VolunteerItem[]) => void;
}) {
  function updateItem(index: number, patch: Partial<VolunteerItem>) {
    const copy = [...(data || [])];
    copy[index] = { ...copy[index], ...patch };
    onChange(copy);
  }

  function addItem() {
    onChange([...(data || []), { org: "", role: "", year: "" }]);
  }

  function removeItem(index: number) {
    onChange((data || []).filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Volunteer Experience</h2>

        <button
          type="button"
          onClick={addItem}
          className="bg-violet-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-violet-800"
        >
          + Add
        </button>
      </div>

      {(data || []).length === 0 ? (
        <p className="text-xs text-gray-400">No volunteer experience added.</p>
      ) : (
        <div className="space-y-3">
          {(data || []).map((item, i) => (
            <div key={i} className="border rounded-xl p-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Organization</label>
                  <input
                    className="w-full border rounded-md px-2 py-1 text-xs"
                    value={item.org ?? ""}
                    onChange={(e) => updateItem(i, { org: e.target.value })}
                    placeholder="Red Crescent"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Role</label>
                  <input
                    className="w-full border rounded-md px-2 py-1 text-xs"
                    value={item.role ?? ""}
                    onChange={(e) => updateItem(i, { role: e.target.value })}
                    placeholder="Volunteer"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs text-gray-500">Year</label>
                <input
                  className="w-full border rounded-md px-2 py-1 text-xs"
                  value={item.year ?? ""}
                  onChange={(e) => updateItem(i, { year: e.target.value })}
                  placeholder="2023"
                />
              </div>

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
