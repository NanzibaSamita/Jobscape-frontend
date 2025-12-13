import { DashboardLayout } from "@/components/layouts/DashboardLayout"
import { cookies } from "next/headers"
import { ProfileUpdateContainer } from "./ProfileUpdateContainer"

export type Certificate = {
    name: string
    authority?: string | null
    dateIssued?: string | null
    credentialId?: string | null
}

export type EducationDetail = {
    level: string
    degree: string
    field: string
    institution: string
    startDate: string
    endDate: string | null
    location: {
        city: string
        country: string
    }
    grade?: string
    certifications?: string
}

export type Project = {
    name: string
    role: string
    field: string
    description: string | null
    duration: string
}

export type Skills = {
    general: string[]
    technical: string[]
}

export type ProfessionalDetails = {
    projects: Project[]
    certifications: (Certificate | string)[]
    skills: Skills
}

export type ExperienceDetail = {
    type: string
    title: string
    organization: string
    startDate: string
    endDate: string
    location: {
        city: string | null
        country: string | null
    }
    description: string
    achievements: string[]
}

export type RecruiterProfile = {
    id: number
    user_name: string
    user_first_name: string
    user_last_name: string
    role_id: number
    email: string
    email_verified_at: string | null
    password: string
    remember_token: string | null
    user_birth_date: string | null
    user_gender: string | null
    user_mobile_code: string | null
    user_mobile: string | null
    user_phone: string | null
    user_image: string | null
    user_street_address: string | null
    user_police_station: string | null
    user_city: string | null
    user_zip: string | null
    user_state: string | null
    user_country: string | null
    otp: string | null
    otp_expire_at: string | null
    is_active: number
    created_at: string
    updated_at: string
    user_type: "recruiter"
}

export type JobSeekerProfile = {
    id: number
    user_id?: number
    user_name: string
    user_first_name: string
    user_last_name: string
    role_id: number
    email: string
    email_verified_at: string | null
    password: string
    remember_token: string | null
    user_birth_date: string | null
    user_gender: string | null
    user_mobile_code: string | null
    user_mobile: string | null
    user_phone: string | null
    user_image: string | null
    user_street_address: string | null
    user_police_station: string | null
    user_city: string | null
    user_zip: string | null
    user_state: string | null
    user_country: string | null
    otp: string | null
    otp_expire_at: string | null
    is_active: number
    created_at: string
    updated_at: string
    user_type: "job_seeker"
    education_details: EducationDetail[]
    professional_details: ProfessionalDetails
    experience_details: ExperienceDetail[]
}

export type UserProfile = RecruiterProfile | JobSeekerProfile

async function getAuth() {
    const cookieStore = cookies()
    const token = cookieStore.get(process.env.NEXT_ACCESS_TOKEN || "wanted_ai")?.value
    const session = cookieStore.get("session")?.value

    if (!token || !session) return null

    try {
        const { userId, roleWeight, roleId } = JSON.parse(session);
        return { token, userId, roleWeight, roleId }
    } catch {
        return null
    }
}

async function fetchUserProfile(token: string, userId: number, roleId: number | string, roleWeight: number | string): Promise<UserProfile | null> {
    const uri = Number(roleWeight) === 90 ? "api/v1/job-seeker-profile" : Number(roleWeight) === 95 ? `api/v1/recruiter-profile` : ``;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${uri}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    })
    if (!res.ok) throw new Error("Failed to fetch user profile")
    const data = await res.json()
    if (data?.data[0]) {
        return { ...data.data[0], user_type: Number(roleWeight) === 90 ? "job_seeker" : "recruiter" }
    }
    return null
}

export default async function ProfileUpdatePage() {
    const auth = await getAuth()

    if (!auth) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-black mb-2">Unauthorized Access</h2>
                        <p className="text-gray-600">Please log in to update your profile.</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    let userProfile: UserProfile | null = null

    try {
        const resp = await fetchUserProfile(auth.token, auth.userId, auth.roleId, auth.roleWeight);
        if (resp) {
            Object.keys(resp).forEach((key) => {
                const k = key as keyof typeof resp;
                if (resp[k] === null || resp[k] === undefined || resp[k] === "undefined") {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (resp as any)[k] = "";
                }
            })
            userProfile = resp
        }
    } catch {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-black mb-2">Error Loading Profile</h2>
                        <p className="text-gray-600">Failed to fetch profile data. Please try again later.</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!userProfile) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-black mb-2">Profile Not Found</h2>
                        <p className="text-gray-600">No profile data found.</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }
    return (
        <DashboardLayout>
            <div className="w-full flex flex-col h-full space-y-1 items-center justify-start">
                {/* Header */}
                <div className="w-full text-center">
                    <h1 className="text-4xl font-bold">Update Profile</h1>
                    <p className="text-lg text-muted-foreground">
                        Update your{" "}
                        <span className="text-yellow-600 font-semibold">
                            {userProfile.user_type === "recruiter" ? "recruiter" : "job seeker"}
                        </span>{" "}
                        profile information
                    </p>
                </div>

                {/* Profile Update Container */}
                <ProfileUpdateContainer userProfile={userProfile} token={auth.token} />
            </div>
        </DashboardLayout>
    )
}

