"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

interface EmployerProfileTabsProps {
  activeTab: "profile" | "jobs" | "browse";
}

export function EmployerProfileTabs({ activeTab }: EmployerProfileTabsProps) {
  const router = useRouter();

  return (
    <TabsList className="grid w-full grid-cols-3 mb-8">
      <TabsTrigger 
        value="profile" 
        onClick={() => router.push("/employer/profile")}
      >
        Profile
      </TabsTrigger>
      <TabsTrigger 
        value="jobs" 
        onClick={() => router.push("/employer/jobs")}
      >
        My Jobs
      </TabsTrigger>
      <TabsTrigger 
        value="browse"
        onClick={() => router.push("/jobs")}
      >
        Browse Jobs
      </TabsTrigger>
    </TabsList>
  );
}
