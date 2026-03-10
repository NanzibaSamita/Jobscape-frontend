"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Paperclip, FileText, Image as ImageIcon, X } from "lucide-react";
import { useAppDispatch } from "@/lib/store";
import { showAlert } from "@/lib/store/slices/notificationSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Attachment {
  url: string;
  filename: string;
  size: number;
  type: string;
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
  attachments: Attachment[];
  created_at: string;
}

interface Room {
  id: string;
  application_id: string;
  job_title?: string;
  other_party_name: string;
  last_message?: string;
  last_message_at?: string;
  is_active: boolean;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchRooms() {
    try {
      const res = await fetch(`${API_BASE}/chat/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setRooms(await res.json());
    } catch {
      dispatch(showAlert({
        title: "Load Error",
        message: "Failed to load conversations",
        type: "error"
      }));
    }
  }

  async function fetchMessages(roomId: string) {
    try {
      const res = await fetch(`${API_BASE}/chat/rooms/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setMessages(await res.json());
    } catch {
      dispatch(showAlert({
        title: "Load Error",
        message: "Failed to load messages",
        type: "error"
      }));
    }
  }

  async function sendMessage() {
    if (!selectedRoom || (!newMessage.trim() && pendingFiles.length === 0)) return;
    setSending(true);

    try {
      // Send the text message first
      const msgRes = await fetch(`${API_BASE}/chat/rooms/${selectedRoom.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage.trim() || '📎 Attachment' }),
      });

      if (!msgRes.ok) throw new Error('Failed to send message');
      const sentMsg: Message = await msgRes.json();

      // Upload any pending files
      if (pendingFiles.length > 0) {
        setUploadingFile(true);
        for (const file of pendingFiles) {
          const formData = new FormData();
          formData.append('file', file);
          await fetch(`${API_BASE}/chat/messages/${sentMsg.id}/attachments`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
        }
        setUploadingFile(false);
        setPendingFiles([]);
      }

      setNewMessage('');
      await fetchMessages(selectedRoom.id);
    } catch (e: any) {
      dispatch(showAlert({
        title: "Send Error",
        message: e.message || "Failed to send",
        type: "error"
      }));
    } finally {
      setSending(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const MAX_MB = 10;
    const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    const valid = files.filter(f => {
      if (!ALLOWED.includes(f.type)) {
        dispatch(showAlert({
          title: "File Type Error",
          message: `${f.name}: file type not allowed`,
          type: "error"
        }));
        return false;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        dispatch(showAlert({
          title: "File Size Error",
          message: `${f.name}: exceeds ${MAX_MB}MB limit`,
          type: "error"
        }));
        return false;
      }
      return true;
    });

    setPendingFiles([...pendingFiles, ...valid]);
    e.target.value = '';
  }

  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex gap-4">

        {/* Left: Conversation List */}
        <aside className="w-72 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-4 border-b">
            <h2 className="font-bold text-gray-900">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {rooms.length === 0 ? (
              <p className="text-sm text-gray-400 p-4 text-center">No conversations yet.</p>
            ) : (
              rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                    selectedRoom?.id === room.id ? 'bg-purple-50 border-l-2 border-l-purple-600' : ''
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900 truncate">{room.other_party_name}</p>
                  {room.job_title && (
                    <p className="text-xs text-purple-600 truncate">{room.job_title}</p>
                  )}
                  {room.last_message && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{room.last_message}</p>
                  )}
                  {!room.is_active && (
                    <Badge variant="secondary" className="text-xs mt-1">Closed</Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Right: Chat Window */}
        <main className="flex-1 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
          {!selectedRoom ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation to start chatting
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-4 border-b">
                <p className="font-semibold text-gray-900">{selectedRoom.other_party_name}</p>
                {selectedRoom.job_title && (
                  <p className="text-xs text-purple-600">{selectedRoom.job_title}</p>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.sender_user_id === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] space-y-1 ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isMine && (
                          <p className="text-xs text-gray-500 px-1">{msg.sender_name}</p>
                        )}
                        <div className={`rounded-2xl px-4 py-2 text-sm ${
                          isMine
                            ? 'bg-purple-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}>
                          {msg.content}
                        </div>

                        {/* Attachments */}
                        {msg.attachments?.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${
                              isMine ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'
                            } hover:opacity-80 transition-opacity`}
                          >
                            {att.type.startsWith('image/') ? (
                              <ImageIcon className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <FileText className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span className="truncate max-w-[120px]">{att.filename}</span>
                            <span className="opacity-70">{formatFileSize(att.size)}</span>
                          </a>
                        ))}

                        <p className="text-xs text-gray-400 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Pending files preview */}
              {pendingFiles.length > 0 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {pendingFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-1 bg-purple-50 border border-purple-200 rounded px-2 py-1 text-xs text-purple-700">
                      <FileText className="h-3 w-3" />
                      <span className="max-w-[100px] truncate">{f.name}</span>
                      <span className="text-purple-400">{formatFileSize(f.size)}</span>
                      <button onClick={() => setPendingFiles(pendingFiles.filter((_, j) => j !== i))}>
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input bar */}
              <div className="p-4 border-t flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  className="hidden"
                  onChange={handleFileSelect}
                  multiple
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex-shrink-0"
                  title="Attach file"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  disabled={!selectedRoom?.is_active}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={sending || uploadingFile || (!newMessage.trim() && pendingFiles.length === 0)}
                  className="bg-purple-600 hover:bg-purple-700 flex-shrink-0"
                >
                  {sending || uploadingFile ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          )}
        </main>

      </div>
    </div>
  );
}