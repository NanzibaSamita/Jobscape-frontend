"use client";

import React from "react";
import { Check } from "lucide-react";

const STAGES = [
  { key: "PENDING", label: "Applied" },
  { key: "REVIEWED", label: "Reviewed" },
  { key: "SHORTLISTED", label: "Shortlisted" },
  { key: "INTERVIEW_SCHEDULED", label: "Interview" },
  { key: "ACCEPTED", label: "Offered" },
];

// Map rejected to a separate visual
function getStageIndex(status: string): number {
  const upper = status?.toUpperCase();
  return STAGES.findIndex((s) => s.key === upper);
}

interface ApplicationTimelineProps {
  status: string;
}

export default function ApplicationTimeline({ status }: ApplicationTimelineProps) {
  const isRejected = status?.toUpperCase() === "REJECTED" || status?.toUpperCase() === "WITHDRAWN";
  const currentIndex = isRejected ? -1 : getStageIndex(status);

  return (
    <div>
      {isRejected ? (
        <div className="flex items-center gap-2">
          <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
            {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase()}
          </span>
        </div>
      ) : (
        <div className="flex items-center">
          {STAGES.map((stage, i) => (
            <React.Fragment key={stage.key}>
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    i < currentIndex
                      ? "bg-purple-600 border-purple-600 text-white"
                      : i === currentIndex
                      ? "bg-purple-600 border-purple-600 text-white ring-4 ring-purple-100"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {i < currentIndex ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 whitespace-nowrap ${
                    i <= currentIndex ? "text-purple-700 font-medium" : "text-gray-400"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
              {/* Connector */}
              {i < STAGES.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 mb-4 ${
                    i < currentIndex ? "bg-purple-600" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
