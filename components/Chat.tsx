"use client";
// components/Chat.tsx — Shared chat component for both employer + job seeker views

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, MessageSquare, ChevronLeft, Circle, Megaphone } from "lucide-react";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Room {
  id: string;
  application_id: string;
  job_title?: string;
  company_name?: string;
  applicant_name?: string;
  other_party_name: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  is_active: boolean;
}

interface Message {
  id: string;
  room_id: string;
  sender_user_id: string;
  sender_role: string;
  sender_name: string;
  content: string;
  status: string;
  is_system_message: boolean;
  created_at: string;
}

interface ChatProps {
  /** Pass this to open directly into a specific application's room */
  applicationId?: string;
  currentUserRole: "employer" | "job_seeker";
  currentUserId: string;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Chat({ applicationId, currentUserRole, currentUserId }: ChatProps) {
  const dispatch = useAppDispatch();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [polling, setPolling] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  // Load rooms on mount
  useEffect(() => {
    loadRooms();
  }, []);

  // If applicationId given, open that room
  useEffect(() => {
    if (applicationId && !loadingRooms) {
      openRoomByApplication(applicationId);
    }
  }, [applicationId, loadingRooms]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll messages every 5s when room is active
  useEffect(() => {
    if (!activeRoom) return;
    pollRef.current = setInterval(() => {
      loadMessages(activeRoom.id, true);
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [activeRoom?.id]);

  async function loadRooms() {
    try {
      setLoadingRooms(true);
      const res = await fetch(`${API_BASE}/chat/rooms`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load chats");
      setRooms(await res.json());
    } catch (err: any) {
      // Silent fail — user may not have any chats yet
    } finally {
      setLoadingRooms(false);
    }
  }

  async function openRoomByApplication(appId: string) {
    try {
      const res = await fetch(`${API_BASE}/chat/rooms/${appId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Cannot open chat");
      const data = await res.json();
      // Now find or reload the rooms list and open it
      await loadRooms();
      const allRes = await fetch(`${API_BASE}/chat/rooms`, { credentials: "include" });
      const allRooms: Room[] = await allRes.json();
      const target = allRooms.find(r => r.application_id === appId);
      if (target) openRoom(target);
    } catch (err: any) {
      dispatch(showAlert({
        title: "Chat unavailable",
        message: err.message || "Chat is only available after your application is reviewed",
        type: "error"
      }));
    }
  }

  async function openRoom(room: Room) {
    setActiveRoom(room);
    await loadMessages(room.id);
    // Mark as read in UI
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unread_count: 0 } : r));
  }

  async function loadMessages(roomId: string, silent = false) {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await fetch(`${API_BASE}/chat/rooms/${roomId}/messages?limit=100`, { credentials: "include" });
      if (!res.ok) throw new Error();
      setMessages(await res.json());
    } catch {
      // silent
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || !activeRoom || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    // Optimistic add
    const tempMsg: Message = {
      id: "temp-" + Date.now(),
      room_id: activeRoom.id,
      sender_user_id: currentUserId,
      sender_role: currentUserRole,
      sender_name: "You",
      content: text,
      status: "sent",
      is_system_message: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch(`${API_BASE}/chat/rooms/${activeRoom.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error();
      const sent = await res.json();
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? sent : m));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      dispatch(showAlert({
        title: "Send Error",
        message: "Failed to send message",
        type: "error"
      }));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const isMe = (msg: Message) => msg.sender_role === currentUserRole;

  return (
    <div className="flex h-full min-h-[600px] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
      {/* Sidebar */}
      <div className={`flex flex-col border-r border-gray-200 dark:border-gray-800 
        ${activeRoom ? "hidden md:flex w-72" : "flex flex-1 md:flex-none md:w-72"}`}>
        
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-violet-600" />
            Messages
          </h2>
        </div>

        {/* Room list */}
        <div className="flex-1 overflow-y-auto">
          {loadingRooms ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">
                {currentUserRole === "job_seeker"
                  ? "Chats open after employers review your applications"
                  : "Open a chat from an application to get started"}
              </p>
            </div>
          ) : (
            rooms.map(room => (
              <button
                key={room.id}
                onClick={() => openRoom(room)}
                className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors border-b border-gray-100 dark:border-gray-800/50
                  ${activeRoom?.id === room.id ? "bg-violet-50 dark:bg-violet-900/20 border-l-2 border-l-violet-500" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-200 to-purple-200 dark:from-violet-900/50 dark:to-purple-900/50 flex items-center justify-center shrink-0 text-sm font-semibold text-violet-700 dark:text-violet-300">
                    {room.other_party_name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {room.other_party_name}
                      </span>
                      {room.last_message_at && (
                        <span className="text-xs text-gray-400 shrink-0 ml-1">
                          {formatTime(room.last_message_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {room.job_title || room.last_message || "Start a conversation"}
                    </p>
                    {room.unread_count > 0 && (
                      <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-violet-600 text-white text-xs font-medium mt-1">
                        {room.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      {activeRoom ? (
        <div className="flex flex-col flex-1 min-w-0">
          {/* Chat header */}
          <div className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
            <button
              onClick={() => setActiveRoom(null)}
              className="md:hidden text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-200 to-purple-200 dark:from-violet-900/50 dark:to-purple-900/50 flex items-center justify-center text-sm font-semibold text-violet-700 dark:text-violet-300 shrink-0">
              {activeRoom.other_party_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{activeRoom.other_party_name}</p>
              {activeRoom.job_title && (
                <p className="text-xs text-gray-500 truncate">Re: {activeRoom.job_title}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500">
              <Circle className="h-2 w-2 fill-emerald-500" />
              Active
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const mine = isMe(msg);
                const prevMsg = messages[i - 1];
                const showName = !prevMsg || prevMsg.sender_role !== msg.sender_role;

                if (msg.is_system_message) {
                  if (msg.sender_role === "employer") {
                    // Render as Job Announcement
                    return (
                      <div key={msg.id} className="flex justify-center my-4">
                        <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-100 dark:border-violet-800/50 rounded-xl p-4 max-w-[85%] shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Megaphone className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            <span className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                              Job Announcement
                            </span>
                          </div>
                          <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                            {msg.content}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-2 text-right">
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  // Standard system message
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      {showName && !mine && (
                        <span className="text-xs text-gray-500 ml-1">{msg.sender_name}</span>
                      )}
                      <div className={`
                        px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                        ${mine
                          ? "bg-violet-600 text-white rounded-br-sm"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                        }
                        ${msg.id.startsWith("temp-") ? "opacity-70" : ""}
                      `}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-gray-400 mx-1">
                        {formatTime(msg.created_at)}
                        {mine && msg.status === "read" && " · Read"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {activeRoom.is_active ? (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              {(() => {
                const lastMessage = messages[messages.length - 1];
                const isInputDisabled = currentUserRole === "job_seeker" && lastMessage?.is_system_message && lastMessage?.sender_role === "employer";

                if (isInputDisabled) {
                  return (
                    <div className="flex items-center justify-center py-2 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Megaphone className="h-4 w-4" />
                        Replies to announcements are disabled.
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="flex items-end gap-2 bg-gray-50 dark:bg-zinc-800 rounded-xl p-2">
                      <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a message... (Enter to send)"
                        rows={1}
                        className="flex-1 resize-none bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none py-1.5 px-1 max-h-32"
                        style={{ height: "auto" }}
                        onInput={e => {
                          const el = e.target as HTMLTextAreaElement;
                          el.style.height = "auto";
                          el.style.height = Math.min(el.scrollHeight, 128) + "px";
                        }}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!input.trim() || sending}
                        className={`rounded-lg p-2 transition-all ${
                          input.trim()
                            ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {sending
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Send className="h-4 w-4" />
                        }
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-1.5">Shift+Enter for new line</p>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-center text-gray-500 italic">This conversation is no longer active.</p>
            </div>
          )}
        </div>
      ) : (
        /* Empty state - show on md+ when no room selected */
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="h-14 w-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-7 w-7 text-violet-600 dark:text-violet-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Select a conversation</p>
            <p className="text-xs text-gray-400 mt-1">Pick a chat from the left to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}