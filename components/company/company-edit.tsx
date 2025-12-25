"use client"

import { useForm, Controller } from "react-hook-form"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Briefcase, Globe } from "lucide-react"
import { toast } from "react-toastify"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { api } from "@/lib/axios/axios"

type FormData = {
    name: string
    country_id: string
    sector_id: string
    logo?: File | null
    is_active: boolean
}

interface Company {
    id: number
    company_name: string
    logo: string | null
    country_id: number
    sector_id: number
    is_active: number
    country_name: string
    sector_name: string
    company_created_by_full_name: string
    company_updated_by_full_name: string | null
    created_at: string
    updated_at: string
}

interface EditCompanyDialogProps {
    company: Company
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    sectors: { id: number; name: string }[],
    countries: { id: number; name: string }[],
}

export function EditCompanyDialog({ company, open, onOpenChange, onSuccess, sectors, countries }: EditCompanyDialogProps) {
    const [loading, setLoading] = useState(false)
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
            name: company.company_name,
            country_id: company.country_id ? company.country_id.toString() : "",
            sector_id: company.sector_id ? company.sector_id.toString() : "",
            logo: null,
            is_active: company.is_active === 1,
        },
    })

    const logo = watch("logo")

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("country_id", data.country_id);
            formData.append("sector_id", data.sector_id);
            formData.append("is_active", data.is_active ? "1" : "0");
            formData.append("_method", "PUT"); // For Laravel or similar backends that require method override
            if (data.logo) {
                formData.append("logo", data.logo);
            }
            // Use wrapped axios instance (api)
            await api.post(`/api/v1/companies/${company.id}`, formData);
            toast.success("Company updated successfully");
            onSuccess();
            reset();
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update company. Please try again.");
            console.error("Update error:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Company</DialogTitle>
                    <DialogDescription>Update company information and logo. Changes will be saved immediately.</DialogDescription>
                </DialogHeader>
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
                    {/* Status */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Active Status</Label>
                            <div className="text-sm text-muted-foreground">Enable or disable this company</div>
                        </div>
                        <Controller
                            name="is_active"
                            control={control}
                            render={({ field }) => (
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            )}
                        />
                    </div>
                    {/* Logo Uploader */}
                    <div className="space-y-2">
                        <Label htmlFor="logo" className="text-sm font-medium">Company Logo</Label>
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-muted/30 rounded-lg border">
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
                                <div className="flex items-center gap-4">
                                    <div className="relative h-16 w-16 rounded-lg overflow-hidden border shadow shrink-0">
                                        {logo ? (
                                            <Image
                                                src={URL.createObjectURL(logo)}
                                                alt="Logo Preview"
                                                fill
                                                style={{ objectFit: "cover" }}
                                            />
                                        ) : (
                                            company.logo && (
                                                <Image
                                                    src={company.logo}
                                                    alt="Current Logo"
                                                    fill
                                                    style={{ objectFit: "cover" }}
                                                />
                                            )
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {logo ? (
                                            <>
                                                <div>
                                                    <span className="text-sm font-medium">{logo.name}</span>
                                                    <span className="text-xs text-muted-foreground">{(logo.size / 1024).toFixed(1)} KB</span>
                                                </div>
                                                <Button type="button" variant="destructive" size="sm" onClick={() => setValue("logo", null)} className="ml-2">
                                                    Remove
                                                </Button>
                                            </>
                                        ) : (
                                            <>
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
                                        )}
                                    </div>
                                </div>
                            </>
                        </div>
                    </div>
                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4 lg:flex-nowrap flex-wrap">
                        <Button onClick={() => onOpenChange(false)} type="button" variant="outline" className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading ? "Updating..." : "Update Company"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}