"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(id: string, username: string, token: string, roleId: number | null, weight: number | null) {
    // Create session data
    const sessionData = {
        userId: id,
        username: username,
        loginTime: new Date().toISOString(),
        roleId: roleId,
        roleWeight: weight
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session", JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    cookieStore.set(process.env.NEXT_ACCESS_TOKEN || "wanted_ai", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return { success: true }
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete("session");
    cookieStore.delete(process.env.NEXT_ACCESS_TOKEN || "wanted_ai")
    redirect("/login")
}

export async function verifySession() {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")

    if (!session?.value) {
        return null
    }

    try {
        const sessionData = JSON.parse(session.value)
        return sessionData
    } catch {
        return null
    }
}
