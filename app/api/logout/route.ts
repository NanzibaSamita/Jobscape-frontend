import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  
  // ✅ Delete all auth cookies
  cookieStore.delete("session");
  cookieStore.delete(process.env.NEXT_ACCESS_TOKEN || "jobscape");

  return NextResponse.json({ success: true });
}
