"use client";
import { useState } from "react";

export default function LinksForm({
  linkedin,
  github,
  portfolio,
  other_links,
  onChange,
}: {
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
  other_links: string[];
  onChange: (v: {
    linkedin_url: string;
    github_url: string;
    portfolio_url: string;
    other_links: string[];
  }) => void;
}) {
  const [li, setLi] = useState(linkedin ?? "");
  const [gh, setGh] = useState(github ?? "");
  const [pf, setPf] = useState(portfolio ?? "");
  const [other, setOther] = useState((other_links || []).join("\n"));

  function sync(
    next?: Partial<{
      linkedin_url: string;
      github_url: string;
      portfolio_url: string;
      other_links: string[];
    }>,
  ) {
    const payload = {
      linkedin_url: next?.linkedin_url ?? li,
      github_url: next?.github_url ?? gh,
      portfolio_url: next?.portfolio_url ?? pf,
      other_links:
        next?.other_links ??
        other
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean),
    };
    onChange(payload);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Links</h2>

      <div className="border rounded-lg p-3 bg-white space-y-3">
        <div>
          <label className="text-xs text-gray-500">LinkedIn</label>
          <input
            className="w-full border rounded-md px-2 py-1 text-xs"
            value={li}
            onChange={(e) => {
              setLi(e.target.value);
              sync({ linkedin_url: e.target.value });
            }}
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">GitHub</label>
          <input
            className="w-full border rounded-md px-2 py-1 text-xs"
            value={gh}
            onChange={(e) => {
              setGh(e.target.value);
              sync({ github_url: e.target.value });
            }}
            placeholder="https://github.com/..."
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Portfolio</label>
          <input
            className="w-full border rounded-md px-2 py-1 text-xs"
            value={pf}
            onChange={(e) => {
              setPf(e.target.value);
              sync({ portfolio_url: e.target.value });
            }}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">
            Other Links (one per line)
          </label>
          <textarea
            className="w-full border rounded-md p-2 text-xs"
            rows={4}
            value={other}
            onChange={(e) => {
              setOther(e.target.value);
              sync({
                other_links: e.target.value
                  .split("\n")
                  .map((x) => x.trim())
                  .filter(Boolean),
              });
            }}
            placeholder="https://...\nhttps://..."
          />
        </div>
      </div>
    </div>
  );
}
