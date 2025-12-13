"use client"

import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Globe, Briefcase } from "lucide-react"





interface FormData {
    name: string
    country_id: string
    sector_id: string
    logo?: File | null
}

export default function CreateCompanyForm({ createLoading, closeModal, keyIs, handelSubmit, countries, sectors }: {
    closeModal: (key: string) => void
    keyIs: string
    handelSubmit: (data: FormData) => void,
    countries: { id: number; name: string }[]
    sectors: { id: number; name: string }[],
    createLoading: boolean
}) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            name: "",
            country_id: "",
            sector_id: "",
            logo: null,
        },
    })

    const logo = watch("logo")

    const onSubmit = async (data: FormData) => {
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("country_id", data.country_id);
            formData.append("sector_id", data.sector_id);
            if (data.logo) {
                formData.append("logo", data.logo);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            handelSubmit(formData as any); // Update your backend to accept FormData
            reset();
            closeModal(keyIs);
        } catch (error) {
            console.error("Error creating company:", error);
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto border-0 shadow-none">
            <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Create Company</CardTitle>
                        <CardDescription>Add a new company to your organization</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Company Name */}
                    <div className="space-y-2">
                        <Label htmlFor="company-name" className="text-sm font-medium">
                            Company Name
                        </Label>
                        <Input
                            id="company-name"
                            type="text"
                            placeholder="Enter company name"
                            {...register("name", {
                                required: "Company name is required",
                                maxLength: {
                                    value: 255,
                                    message: "Company name must not exceed 255 characters",
                                },
                            })}
                            className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    {/* Country Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm font-medium">
                            Country
                        </Label>
                        <Controller
                            name="country_id"
                            control={control}
                            rules={{ required: "Please select a country" }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={errors.country_id ? "border-red-500 focus:ring-red-500" : ""}>
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder="Select country" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="z-[102]">
                                        {countries.map((country) => (
                                            <SelectItem key={country.id} value={country.id.toString()}>
                                                {country.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.country_id && <p className="text-sm text-red-500">{errors.country_id.message}</p>}
                    </div>

                    {/* Sector Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="sector" className="text-sm font-medium">
                            Sector
                        </Label>
                        <Controller
                            name="sector_id"
                            control={control}
                            rules={{ required: "Please select a sector" }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={errors.sector_id ? "border-red-500 focus:ring-red-500" : ""}>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder="Select sector" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="z-[102]">
                                        {sectors.map((sector) => (
                                            <SelectItem key={sector.id} value={sector.id.toString()}>
                                                {sector.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.sector_id && <p className="text-sm text-red-500">{errors.sector_id.message}</p>}
                    </div>

                    {/* Logo Uploader */}
                    <div className="space-y-2">
                        <Label htmlFor="logo" className="text-sm font-medium">Company Logo</Label>
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-muted/30 rounded-lg border">
                            {!logo ? (
                                <>
                                    <Input
                                        type="file"
                                        id="logo"
                                        accept="image/*"
                                        onChange={e => {
                                            const file = e.target.files?.[0] || null;
                                            setValue("logo", file);
                                        }}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('logo')?.click()}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-primary bg-white hover:bg-primary/10"
                                    >
                                        <span className="font-medium text-primary">Upload Logo</span>
                                    </Button>
                                    <span className="text-xs text-muted-foreground">PNG, JPG, JPEG, SVG, GIF (max 5MB)</span>
                                </>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="relative h-16 w-16 rounded-lg overflow-hidden border shadow shrink-0">
                                        <Image
                                            src={URL.createObjectURL(logo)}
                                            alt="Logo Preview"
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div>
                                            <span className="text-sm font-medium">{logo.name}</span>
                                            <span className="text-xs text-muted-foreground">{(logo.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                        <Button type="button" variant="destructive" size="sm" onClick={() => setValue("logo", null)} className="ml-2">
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4 lg:flex-nowrap flex-wrap">
                        <Button onClick={() => closeModal(keyIs)} type="button" variant="outline" className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={createLoading}>
                            {createLoading ? "Creating..." : "Create Company"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
