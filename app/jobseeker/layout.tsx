"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, User, Briefcase, FileText, MessageSquare, Bell } from "lucide-react";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";
import { NotificationTray } from "@/components/notifications/NotificationTray";

export default function JobSeekerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    // ✅ Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // ✅ Clear server-side cookies
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      // Ignore errors
    }

    // ✅ Show success message
    dispatch(showAlert({
      title: "Success",
      message: "Logged out successfully",
      type: "success"
    }));

    // ✅ Hard redirect to login (bypasses cache)
    window.location.href = "/login";
  };

  const navItems = [
    { href: "/jobseeker/profile", label: "Profile", icon: User },
    { href: "/jobs", label: "Browse Jobs", icon: Briefcase },
    { href: "/jobseeker/applications", label: "My Applications", icon: FileText },
    { href: "/jobseeker/messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/jobs" className="text-xl font-bold text-purple-600">
                Jobscape
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
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

