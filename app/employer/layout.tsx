"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bell, Briefcase, Calendar, InboxIcon, LogOut, User } from "lucide-react";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";
import { useState, useEffect } from "react";
import { NotificationTray } from "@/components/notifications/NotificationTray";
import JobSeekerLayout from "@/app/jobseeker/layout";
import { useAppSelector } from "@/lib/store";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [userRole, setUserRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const roleWeight = useAppSelector((state) => state.auth.roleWeight);

  useEffect(() => {
    // 1. Prioritize Redux roleWeight (95 = Employer, 90 = Job Seeker)
    if (roleWeight?.toString() === "95") {
      setUserRole("EMPLOYER");
      setReady(true);
      return;
    } else if (roleWeight?.toString() === "90") {
      setUserRole("JOB_SEEKER");
      setReady(true);
      return;
    }

    // 2. Fallback to localStorage
    let storedRole = localStorage.getItem("user_role");
    
    if (!storedRole) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          storedRole = userObj?.role || (userObj?.roles && userObj.roles.length > 0 ? userObj.roles[0]?.name : null);
        } catch (e) {}
      }
    }
    
    if (storedRole) {
      storedRole = storedRole.toUpperCase().replace('_', '');
      if (storedRole === "JOBSEEKER") {
        setUserRole("JOB_SEEKER");
      } else if (storedRole === "EMPLOYER") {
        setUserRole("EMPLOYER");
      }
    }

    setReady(true);
  }, [roleWeight]);

  const isPublicProfile = pathname.startsWith("/employer/public/");
  const shouldShowJobSeekerHeader = isPublicProfile && userRole === "JOB_SEEKER";

  if (ready && shouldShowJobSeekerHeader) {
    return <JobSeekerLayout>{children}</JobSeekerLayout>;
  }

  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      // Ignore errors
    }
    dispatch(showAlert({
      title: "Success",
      message: "Logged out successfully",
      type: "success"
    }));
    window.location.href = "/login";
  };

  const navItems = [
    { href: "/employer/profile", label: "Profile", icon: User },
    { href: "/employer/jobs", label: "My Jobs", icon: Briefcase },
    { href: "/employer/interviews", label: "Interviews", icon: Calendar },
    { href: "/employer/inbox", label: "Inbox", icon: InboxIcon },
    { href: "/jobs", label: "Browse Jobs", icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/employer/jobs" className="text-xl font-bold text-purple-600">
                Jobscape
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-purple-50 text-purple-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Notification Bell */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full border"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                >
                  {unreadCount > 0 && (
                    <span className="w-[18px] h-[18px] rounded-full bg-red-600 absolute -top-1 -right-1 flex items-center justify-center border-2 border-white text-[10px] text-white font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  <Bell className="h-4 w-4" />
                </Button>
                <NotificationTray
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                  onUnreadCountChange={setUnreadCount}
                />
              </div>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}
