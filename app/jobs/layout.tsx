"use client";

import { useEffect, useState } from "react";
import JobSeekerLayout from "@/app/jobseeker/layout";
import EmployerLayout from "@/app/employer/layout";
import { useAppSelector } from "@/lib/store";

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const roleWeight = useAppSelector((state) => state.auth.roleWeight);

  useEffect(() => {
    // 1. Prioritize Redux roleWeight (95 = Employer, 90 = Job Seeker)
    if (roleWeight?.toString() === "95") {
      setRole("EMPLOYER");
      setReady(true);
      return;
    } else if (roleWeight?.toString() === "90") {
      setRole("JOB_SEEKER");
      setReady(true);
      return;
    }

    // 2. Fallback to localStorage string
    let userRole = localStorage.getItem("user_role");
    
    if (!userRole) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          userRole = userObj?.role || (userObj?.roles && userObj.roles.length > 0 ? userObj.roles[0]?.name : null);
        } catch (e) {}
      }
    }
    
    if (userRole) {
      userRole = userRole.toUpperCase().replace('_', '');
    }

    setRole(userRole);
    setReady(true);
  }, [roleWeight]);

  if (!ready) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // If we definitely know they are an employer from Redux or fallback
  if (role === "EMPLOYER" || roleWeight?.toString() === "95") {
    return <EmployerLayout>{children}</EmployerLayout>;
  }

  return <JobSeekerLayout>{children}</JobSeekerLayout>;
}
