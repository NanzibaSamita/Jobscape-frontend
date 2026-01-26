"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store";
import { logoutUser } from "@/lib/store/slices/authSlice";
import LoginForm from "./comps/LoginForm";
import { Loader } from "lucide-react";

export default function Page() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log("🟢 LOGIN PAGE MOUNTED");
    console.log("🟢 isAuthenticated:", isAuthenticated);
    
    // If Redux has stale auth state, clear it
    if (isAuthenticated) {
      console.log("🟢 Clearing stale auth state");
      dispatch(logoutUser());
    }
    
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  console.log("🟢 RENDERING LOGIN FORM");
  return <LoginForm />;
}
