/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Save, Loader2 } from "lucide-react"
import { JobSeekerProfile } from "./page"
import { toast } from "react-toastify"
import { EducationSection } from "./EducationSection"
import { ExperienceSection } from "./ExperienceSection"
import { ProfessionalSection } from "./ProfessionalSection"
import { countryCodes } from "@/local/countries"
import { api } from "@/lib/axios/axios"

interface JobSeekerProfileFormProps {
    profile: JobSeekerProfile
    token: string
    onProfileUpdate: (profile: JobSeekerProfile) => void
}

const SEEKER_PROFILE_UPDATE = "/api/v1/job-seeker-profile-update";
export function JobSeekerProfileForm({ profile, onProfileUpdate }: JobSeekerProfileFormProps) {
    const [formData, setFormData] = useState<JobSeekerProfile>(profile)
    const [loading, setLoading] = useState(false)

    const genderOptions = [
        { label: "Female", value: "1" },
        { label: "Male", value: "2" },
        { label: "Other", value: "3" },
    ]

    const handleInputChange = (field: keyof JobSeekerProfile, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const paths = ["user_first_name", "user_last_name", "user_birth_date", "user_phone", "user_gender", "user_mobile_code", "user_mobile", "user_street_address", "user_police_station", "user_city", "user_state", "user_country", "user_zip"];
            const rawData: {
                [key: string]: any
            } = {
            };
            paths.forEach((path: string) => {
                rawData[path] = formData[path as keyof JobSeekerProfile];
            });
            const resp = await api.post(SEEKER_PROFILE_UPDATE, rawData);
            if (resp.data && resp.data.data) {
                // console.log(resp.data.data.user, rawData)
                // setFormData(resp.data.data);
                onProfileUpdate(resp.data.data.user);
            }
            toast.success("Profile updated successfully")
        } catch (error) {
            console.error("Failed to update profile:", error)
            toast.error("Failed to update profile. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    const handlePropSubmit = async (prop: string, stringify: boolean) => {
        setLoading(true)

        try {
            const rawData: {
                [key: string]: any
            } = {
            };
            rawData[prop] = stringify ? JSON.stringify(formData[prop as keyof JobSeekerProfile]) : formData[prop as keyof JobSeekerProfile];
            const resp = await api.post(SEEKER_PROFILE_UPDATE, rawData);
            if (resp.data && resp.data.data) {
                onProfileUpdate(resp.data.data.user);
            }
            toast.success("Profile updated successfully")
        } catch (error) {
            console.error("Failed to update profile:", error)
            toast.error("Failed to update profile. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Basic Information Card */}
            {/* 
            <Card className="border-2 border-muted bg-transparent shadow-sm">
                <CardHeader className="bg-gradient-to-r from-primary/40 to-primary/10 rounded-t-lg">
            */}
            <Card className="border-2 border-muted bg-transparent shadow-sm">
                <CardHeader className="bg-gradient-to-r from-primary/40 to-primary/10 rounded-t-lg">
                    <CardTitle className="flex items-center space-x-2">
                        <User className="h-6 w-6" />
                        <span>Basic Information</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="user_name" className="  font-medium">
                                        Username *
                                    </Label>
                                    <Input
                                        id="user_name"
                                        value={formData.user_name}
                                        disabled
                                        onChange={(e) => handleInputChange("user_name", e.target.value)}
                                        className="  focus:border-yellow-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="  font-medium">
                                        Email *
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        disabled
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        className="  focus:border-yellow-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user_first_name" className="  font-medium">
                                        First Name *
                                    </Label>
                                    <Input
                                        id="user_first_name"
                                        value={formData.user_first_name}
                                        onChange={(e) => handleInputChange("user_first_name", e.target.value)}
                                        className="  focus:border-yellow-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user_last_name" className="  font-medium">
                                        Last Name *
                                    </Label>
                                    <Input
                                        id="user_last_name"
                                        value={formData.user_last_name}
                                        onChange={(e) => handleInputChange("user_last_name", e.target.value)}
                                        className="  focus:border-yellow-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user_birth_date" className="  font-medium">
                                        Birth Date
                                    </Label>
                                    <Input
                                        id="user_birth_date"
                                        type="date"
                                        value={formData.user_birth_date || ""}
                                        onChange={(e) => handleInputChange("user_birth_date", e.target.value || null)}
                                        className="  focus:border-yellow-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user_gender" className="  font-medium">
                                        Gender
                                    </Label>
                                    <Select
                                        value={formData.user_gender?.toString() || ""}
                                        onValueChange={(value) => handleInputChange("user_gender", value)}
                                    >
                                        <SelectTrigger className="  focus:border-yellow-500">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {genderOptions.map((gender) => (
                                                <SelectItem key={gender.value} value={gender.value}>
                                                    {gender.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold   border-b   pb-2">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="user_phone" className="  font-medium">
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="user_phone"
                                        value={formData.user_phone || ""}
                                        onChange={(e) => handleInputChange("user_phone", e.target.value || null)}
                                        className="  focus:border-yellow-500"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="user_mobile_code" className="  font-medium">
                                            Code
                                        </Label>
                                        <Select
                                            value={formData.user_mobile_code || ""}
                                            onValueChange={(value) => handleInputChange("user_mobile_code", value || null)}
                                        >
                                            <SelectTrigger className="  focus:border-yellow-500">
                                                <SelectValue placeholder="Select Phone Code" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countryCodes.map(({ code }: { code: string }) => (
                                                    <SelectItem key={code} value={code.replace("-", "")}>
                                                        {code}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="user_mobile" className="  font-medium">
                                            Mobile Number
                                        </Label>
                                        <Input
                                            id="user_mobile"
                                            value={formData.user_mobile || ""}
                                            onChange={(e) => handleInputChange("user_mobile", e.target.value || null)}
                                            className="  focus:border-yellow-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold   border-b   pb-2">Address Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="user_street_address" className="  font-medium">
                                        Street Address
                                    </Label>
                                    <Textarea
                                        id="user_street_address"
                                        value={formData.user_street_address || ""}
                                        onChange={(e) => handleInputChange("user_street_address", e.target.value || null)}
                                        className="  focus:border-yellow-500"
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user_police_station" className="  font-medium">
                                        Police Station
                                    </Label>
                                    <Input
                                        id="user_police_station"
                                        value={formData.user_police_station || ""}
                                        onChange={(e) => handleInputChange("user_police_station", e.target.value || null)}
                                        className="  focus:border-yellow-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user_city" className="  font-medium">
                                        City
                                    </Label>
                                    <Input
                                        id="user_city"
                                        value={formData.user_city || ""}
                                        onChange={(e) => handleInputChange("user_city", e.target.value || null)}
                                        className="  focus:border-yellow-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user_state" className="  font-medium">
                                        State
                                    </Label>
                                    <Input
                                        id="user_state"
                                        value={formData.user_state || ""}
                                        onChange={(e) => handleInputChange("user_state", e.target.value || null)}
                                        className="  focus:border-yellow-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user_country" className="  font-medium">
                                        Country
                                    </Label>
                                    <Input
                                        id="user_country"
                                        value={formData.user_country || ""}
                                        onChange={(e) => handleInputChange("user_country", e.target.value || null)}
                                        className="  focus:border-yellow-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user_zip" className="  font-medium">
                                        ZIP Code
                                    </Label>
                                    <Input
                                        id="user_zip"
                                        value={formData.user_zip || ""}
                                        onChange={(e) => handleInputChange("user_zip", e.target.value || null)}
                                        className="  focus:border-yellow-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6">
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-primary hover:bg-secondary   font-semibold px-8 py-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update Basic Info
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Education Section */}
            <EducationSection
                educationDetails={formData.education_details}
                onUpdate={(education) => handleInputChange("education_details", education)}
                handlePropSubmit={handlePropSubmit}
                loading={loading}
            />

            {/* Experience Section */}
            <ExperienceSection
                experienceDetails={formData.experience_details}
                onUpdate={(experience) => handleInputChange("experience_details", experience)}
                handlePropSubmit={handlePropSubmit}
                loading={loading}
            />

            {/* Professional Section */}
            <ProfessionalSection
                professionalDetails={formData.professional_details}
                onUpdate={(professional) => handleInputChange("professional_details", professional)}
                handlePropSubmit={handlePropSubmit}
                loading={loading}
            />
        </div>
    )
}
