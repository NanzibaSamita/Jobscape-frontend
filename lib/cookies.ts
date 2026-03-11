"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(
  id: string,
  email: string,
  token: string,
  profilePicture: string | null,
  role: string // ✅ Changed to 'role' (string like "EMPLOYER" or "JOB_SEEKER")
) {
  // Create session data
  const sessionData = {
    userId: id,
    email: email, // ✅ Store email instead of username
    loginTime: new Date().toISOString(),
    role: role, // ✅ Store role (not roleId/roleWeight)
    profilePicture: profilePicture,
  };

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set("session", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // ✅ Changed to 30 days for better UX
  });

  // Set access token
  cookieStore.set(process.env.NEXT_ACCESS_TOKEN || "jobscape", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // ✅ Changed to 30 days
  });

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete(process.env.NEXT_ACCESS_TOKEN || "jobscape");
  redirect("/login");
}

export async function verifySession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session?.value) {
    return null;
  }

  try {
    const sessionData = JSON.parse(session.value);
    return sessionData;
  } catch {
    return null;
  }
}
