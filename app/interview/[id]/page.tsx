"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VideoRoom from "@/components/VideoRoom";
import { Loader2 } from "lucide-react";

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!storedToken) {
      router.push("/login?redirect=/interview/" + params.id);
      return;
    }
    setToken(storedToken);
    setLoading(false);
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <VideoRoom
      interviewId={params.id as string}
      token={token!}
      onLeave={() => router.back()}
    />
  );
}
