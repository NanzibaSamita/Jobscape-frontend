"use client";

type ProjectItem = {
  name?: string;
  role?: string;
  duration?: string;
  description?: string;
};

export default function ProjectsForm({
  data,
  onChange,
}: {
  data: ProjectItem[];
  onChange: (v: ProjectItem[]) => void;
}) {
  function updateItem(index: number, patch: Partial<ProjectItem>) {
    const copy = [...(data || [])];
    copy[index] = { ...copy[index], ...patch };
    onChange(copy);
  }

  function addItem() {
    onChange([
      ...(data || []),
      {
        name: "",
        role: "",
        duration: "",
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
        <h2 className="text-lg font-semibold">Projects</h2>

        <button
          type="button"
          onClick={addItem}
          className="bg-violet-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-violet-800"
        >
          + Add
        </button>
      </div>

      {(data || []).length === 0 ? (
        <p className="text-xs text-gray-400">No projects added.</p>
      ) : (
        <div className="space-y-3">
          {(data || []).map((item, i) => (
            <div key={i} className="border rounded-xl p-4 bg-white">
              {/* Name + Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Project Name</label>
                  <input
                    className="w-full border rounded-md px-2 py-1 text-xs"
                    value={item.name ?? ""}
                    onChange={(e) => updateItem(i, { name: e.target.value })}
                    placeholder="Job Portal UI"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Role</label>
                  <input
                    className="w-full border rounded-md px-2 py-1 text-xs"
                    value={item.role ?? ""}
                    onChange={(e) => updateItem(i, { role: e.target.value })}
                    placeholder="Frontend Developer"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="mt-3">
                <label className="text-xs text-gray-500">Duration</label>
                <input
                  className="w-full border rounded-md px-2 py-1 text-xs"
                  value={item.duration ?? ""}
                  onChange={(e) => updateItem(i, { duration: e.target.value })}
                  placeholder="3 months"
                />
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
                  placeholder="Built profile + listing UI using Next.js and Tailwind..."
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
