"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Building2 } from "lucide-react"
import { RecruiterProfileForm } from "./RecruiterProfileForm"
import { JobSeekerProfileForm } from "./JobSeekerProfileForm"
import { UserProfile } from "./page"

interface ProfileUpdateContainerProps {
    userProfile: UserProfile
    token: string
}

export function ProfileUpdateContainer({ userProfile, token }: ProfileUpdateContainerProps) {
    console.log("User Profile:", userProfile)
    const [profile, setProfile] = useState<UserProfile>(userProfile)

    const handleProfileUpdate = (updatedProfile: UserProfile) => {
        setProfile(updatedProfile)
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
        // console.log({ firstName, lastName })
        // return "sds"
    }
    return (
        <div className="w-full max-w-6xl space-y-8 py-4">
            {/* Profile Header Card */}
            <Card className="border-2 border-muted bg-transparent shadow-sm">
                <CardHeader className="bg-gradient-to-r from-primary/40 to-primary/10 rounded-t-lg">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16 border-4 border-white">
                            <AvatarImage
                                src={profile.user_image || "/placeholder.svg"}
                                alt={`${profile.user_first_name} ${profile.user_last_name}`}
                            />
                            <AvatarFallback className="bg-black text-white text-lg">
                                {getInitials(profile.user_first_name, profile.user_last_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl font-bold">
                                {profile.user_first_name} {profile.user_last_name}
                            </CardTitle>
                            {/* <p className="text-sm opacity-90">@{profile.user_name}</p> */}
                            <div className="flex items-center space-x-2 mt-2">
                                {profile.user_type === "recruiter" ? (
                                    <Badge className="bg-primary font-semibold">
                                        <Building2 className="h-4 w-4 mr-1" />
                                        Recruiter
                                    </Badge>
                                ) : (
                                    <Badge className="bg-primary font-semibold">
                                        <User className="h-4 w-4 mr-1" />
                                        Job Seeker
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-semibold  ">Email:</span>
                            <span className=" text-muted-foreground ml-2">{profile.email}</span>
                        </div>
                        <div>
                            <span className="font-semibold  ">Phone:</span>
                            <span className=" text-muted-foreground ml-2">{profile.user_phone || "Not provided"}</span>
                        </div>
                        <div>
                            <span className="font-semibold  ">Mobile:</span>
                            <span className=" text-muted-foreground ml-2">
                                {profile.user_mobile_code && profile.user_mobile
                                    ? `${profile.user_mobile_code} ${profile.user_mobile}`
                                    : "Not provided"}
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold  ">Location:</span>
                            <span className=" text-muted-foreground ml-2">
                                {profile.user_city && profile.user_country
                                    ? `${profile.user_city}, ${profile.user_country}`
                                    : "Not provided"}
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold  ">Gender:</span>
                            <span className=" text-muted-foreground ml-2">{profile?.user_gender?.toString() === "1" ? "Female" : profile?.user_gender?.toString() === "2" ? "Male" : profile?.user_gender?.toString() === "3" ? "Other" : "Not specified"}</span>
                        </div>
                        <div>
                            <span className="font-semibold  ">Birth Date:</span>
                            <span className=" text-muted-foreground ml-2">
                                {profile.user_birth_date ? new Date(profile.user_birth_date).toLocaleDateString() : "Not provided"}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dynamic Form Based on User Type */}
            {profile.user_type === "recruiter" ? (
                <RecruiterProfileForm profile={profile} token={token} onProfileUpdate={handleProfileUpdate} />
            ) : (
                <JobSeekerProfileForm profile={{
                    ...profile,
                    education_details: (profile.education_details && typeof profile.education_details === "string") ? JSON.parse(profile.education_details) : profile.education_details || [],
                    experience_details: (profile.experience_details && typeof profile.experience_details === "string") ? JSON.parse(profile.experience_details) : profile.experience_details || [],
                    professional_details: (profile.professional_details && typeof profile.professional_details === "string") ? JSON.parse(profile.professional_details) : profile.professional_details || {},
                }} token={token} onProfileUpdate={handleProfileUpdate} />
            )}
        </div>
    )
}
