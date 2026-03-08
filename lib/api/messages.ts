import { axiosInstance } from "@/lib/axios/axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface SendMessagePayload {
  recipient_id: string;
  recipient_type: "employer" | "job_seeker";
  content: string;
  attachments?: File[];
}

export async function sendMessage(payload: SendMessagePayload): Promise<any> {
  const token = localStorage.getItem("access_token");
  
  // If there are attachments, we would typically use FormData
  // For now, depending on the backend, we implement a simple POST
  if (payload.attachments && payload.attachments.length > 0) {
    const formData = new FormData();
    formData.append("recipient_id", payload.recipient_id);
    formData.append("recipient_type", payload.recipient_type);
    formData.append("content", payload.content);
    
    payload.attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const res = await fetch(`${API_BASE}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to send message with attachments");
    }
    return res.json();
  }

  // Without attachments, a simple JSON POST
  const res = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      recipient_id: payload.recipient_id,
      recipient_type: payload.recipient_type,
      content: payload.content,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to send message");
  }
  return res.json();
}
