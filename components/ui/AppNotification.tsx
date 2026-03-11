"use client";
// components/ui/AppNotification.tsx
// Replaces toast notifications with branded in-app notifications

import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

type NotifType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotifContextValue {
  notify: (type: NotifType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotifContext = createContext<NotifContextValue | null>(null);

export function useNotify() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error("useNotify must be used within NotifProvider");
  return ctx;
}

const CONFIG: Record<NotifType, { icon: React.ElementType; bar: string; bg: string; border: string; iconColor: string }> = {
  success: {
    icon: CheckCircle2,
    bar: "bg-emerald-500",
    bg: "bg-white dark:bg-zinc-900",
    border: "border-emerald-200 dark:border-emerald-800",
    iconColor: "text-emerald-500",
  },
  error: {
    icon: XCircle,
    bar: "bg-red-500",
    bg: "bg-white dark:bg-zinc-900",
    border: "border-red-200 dark:border-red-800",
    iconColor: "text-red-500",
  },
  warning: {
    icon: AlertTriangle,
    bar: "bg-amber-400",
    bg: "bg-white dark:bg-zinc-900",
    border: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-500",
  },
  info: {
    icon: Info,
    bar: "bg-violet-500",
    bg: "bg-white dark:bg-zinc-900",
    border: "border-violet-200 dark:border-violet-800",
    iconColor: "text-violet-500",
  },
};

function NotifItem({
  notif,
  onDismiss,
}: {
  notif: Notification;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = notif.duration ?? 4000;
  const cfg = CONFIG[notif.type];
  const Icon = cfg.icon;
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    // Entrance
    const t = setTimeout(() => setVisible(true), 10);

    // Progress bar
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
    }, 30);

    // Auto-dismiss
    const dismiss = setTimeout(() => handleDismiss(), duration);

    return () => {
      clearTimeout(t);
      clearTimeout(dismiss);
      clearInterval(intervalRef.current);
    };
  }, [duration]);

  const handleDismiss = useCallback(() => {
    setLeaving(true);
    clearInterval(intervalRef.current);
    setTimeout(() => onDismiss(notif.id), 350);
  }, [notif.id, onDismiss]);

  return (
    <div
      onClick={handleDismiss}
      style={{
        transform: visible && !leaving ? "translateX(0) scale(1)" : "translateX(110%) scale(0.92)",
        opacity: visible && !leaving ? 1 : 0,
        transition: leaving
          ? "transform 0.35s cubic-bezier(0.4,0,1,1), opacity 0.35s ease"
          : "transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.3s ease",
      }}
      className={`
        relative w-80 cursor-pointer select-none overflow-hidden rounded-xl border shadow-lg
        ${cfg.bg} ${cfg.border}
        hover:shadow-xl transition-shadow
      `}
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar} rounded-l-xl`} />

      <div className="flex items-start gap-3 px-4 py-3 pl-5">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
            {notif.title}
          </p>
          {notif.message && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-snug">
              {notif.message}
            </p>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mt-0.5"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 dark:bg-zinc-800">
        <div
          className={`h-full ${cfg.bar} transition-none`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function NotifProvider({ children }: { children: React.ReactNode }) {
  const [notifs, setNotifs] = useState<Notification[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (type: NotifType, title: string, message?: string, duration?: number) => {
      const id = Math.random().toString(36).slice(2);
      setNotifs((prev) => [...prev.slice(-4), { id, type, title, message, duration }]);
    },
    []
  );

  const value: NotifContextValue = {
    notify,
    success: (t, m) => notify("success", t, m),
    error: (t, m) => notify("error", t, m),
    warning: (t, m) => notify("warning", t, m),
    info: (t, m) => notify("info", t, m),
  };

  return (
    <NotifContext.Provider value={value}>
      {children}
      {/* Portal-like stack, bottom-right */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
        {notifs.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <NotifItem notif={n} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </NotifContext.Provider>
  );
}