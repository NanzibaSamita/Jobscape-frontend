"use client"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save, Building2 } from "lucide-react"
import { toast } from "react-toastify"
import type { RecruiterProfile } from "./page"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/axios/axios"
import { countryCodes } from "@/local/countries"


const genderOptions = [
    { label: "Female", value: "1" },
    { label: "Male", value: "2" },
    { label: "Other", value: "3" },
]

// 🔐 Validation Schema
const profileSchema = z.object({
    user_name: z.string().min(1, "Username is required"),
    email: z.string().email(),
    user_first_name: z.string().min(1, "First name is required"),
    user_last_name: z.string().min(1, "Last name is required"),
    user_birth_date: z.string().nullable().optional(),
    user_gender: z.string().nullable().optional(),
    user_phone: z.string().nullable().optional(),
    user_mobile_code: z.string().nullable().optional(),
    user_mobile: z.string().nullable().optional(),
    user_street_address: z.string().nullable().optional(),
    user_police_station: z.string().nullable().optional(),
    user_city: z.string().nullable().optional(),
    user_state: z.string().nullable().optional(),
    user_country: z.string().nullable().optional(),
    user_zip: z.string().nullable().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface RecruiterProfileFormProps {
    profile: RecruiterProfile
    token: string
    onProfileUpdate: (profile: RecruiterProfile) => void
}

const RECRUITER_PROFILE_UPDATE = "/api/v1/recruiter-profile-update";
export function RecruiterProfileForm({
    profile,
    onProfileUpdate,
}: RecruiterProfileFormProps) {
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            ...profile,
            user_gender: profile.user_gender?.toString()
        },
    })
    const loading = form.formState.isSubmitting

    const onSubmit = async (values: ProfileFormValues) => {
        console.log("Submitting profile update", values)
        try {
            const resp = await api.post(RECRUITER_PROFILE_UPDATE, values);

            if (!(resp.data && resp.data.data)) throw new Error("Failed to update profile")
            onProfileUpdate({
                ...resp.data.data, user_type: "recruiter"
            })
            toast.success("Profile updated successfully")
        } catch (err) {
            console.error(err)
            toast.error("Failed to update profile.")
        }
    }

    return (
        <Card className="border-2 border-muted bg-transparent shadow-sm">
            <CardHeader className="bg-gradient-to-r from-primary/40 to-primary/10 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-6 w-6" />
                    <span>Recruiter Profile Information</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 mb-4">
                <Form {...form}>
                    {/* <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6"> */}
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b   pb-2">Basic Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {["user_name", "email", "user_first_name", "user_last_name"].map((key) => (
                                <FormField
                                    key={key}
                                    control={form.control}
                                    disabled={(key === "email") || (key === "user_name")} // Disable email field
                                    name={key as keyof ProfileFormValues}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-medium">
                                                {field.name.replaceAll("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </FormLabel>
                                            <FormControl>
                                                <Input className="  focus:border-yellow-500" {...field} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}

                            <FormField
                                control={form.control}
                                name="user_birth_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="  font-medium">Birth Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" className="  focus:border-yellow-500" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="user_gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="  font-medium">Gender</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                                            <FormControl>
                                                <SelectTrigger className="  focus:border-yellow-500">
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {genderOptions.map((gender) => (
                                                    <SelectItem key={gender.value} value={gender.value}>
                                                        {gender.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold   border-b   pb-2">Contact Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="user_phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="  font-medium">Phone Number</FormLabel>
                                        <FormControl>
                                            <Input className="  focus:border-yellow-500" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-3 gap-2">
                                <FormField
                                    control={form.control}
                                    name="user_mobile_code"
                                    render={({ field }) => (
                                        <div className="space-y-1">
                                            <FormLabel htmlFor="user_mobile_code" className="  font-medium">
                                                Code
                                            </FormLabel>
                                            <Select
                                                value={field.value || ""}
                                                onValueChange={field.onChange}
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
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="user_mobile"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel className="  font-medium">Mobile Number</FormLabel>
                                            <FormControl>
                                                <Input className="  focus:border-yellow-500" {...field} value={field.value ?? ""} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold   border-b   pb-2">Address Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="user_street_address"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel className="  font-medium">Street Address</FormLabel>
                                        <FormControl>
                                            <Textarea rows={2} className="  focus:border-yellow-500" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            {["user_police_station", "user_city", "user_state", "user_country", "user_zip"].map((fieldName) => (
                                <FormField
                                    key={fieldName}
                                    control={form.control}
                                    name={fieldName as keyof ProfileFormValues}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="  font-medium">
                                                {fieldName.replaceAll("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </FormLabel>
                                            <FormControl>
                                                <Input className="  focus:border-yellow-500" {...field} value={field.value ?? ""} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <Button
                            type="submit"
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={loading}
                            className="bg-primary hover:bg-yellow-500   font-semibold px-8 py-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Update Profile
                                </>
                            )}
                        </Button>
                    </div>
                    {/* </form> */}
                </Form>
            </CardContent>
        </Card>
    )
}
