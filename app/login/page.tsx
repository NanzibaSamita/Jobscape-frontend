"use client";

import { Suspense } from "react";
import LoginForm from "./comps/LoginForm";
import { Loader } from "lucide-react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
