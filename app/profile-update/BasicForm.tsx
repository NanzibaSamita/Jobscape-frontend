'use client'

import React, { useRef } from 'react'
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger
} from '@/components/ui/select'
import { countryCodes } from '@/local/countries'
import Image, { StaticImageData } from 'next/image'
import { Button } from '@/components/ui/button'
import { Edit3, Loader2 } from 'lucide-react'
import defaultImageLocal from '@/public/images/placeholder.png'
import BlackStyleButton from '@/components/custom-UI/Buttons/BlackStyleButton'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function BasicForm({ form, edit = true, updateProfileValue, loading }: { form: any, edit?: boolean, loading: boolean; updateProfileValue: (field: any, tab: any) => void }) {
    const selectedCountry = countryCodes.find((c) => c.code === form.watch("user_mobile_code"));
    const [imagePreview, setImagePreview] = React.useState<string | StaticImageData>(() => {
        const defaultImage = form.getValues("user_image")
        return typeof defaultImage === "string" ? `${defaultImage}` : defaultImageLocal
    })
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setImagePreview(url)
            form.setValue("user_image", file)
        }
    }
    return (
        <div className="flex items-start flex-col gap-4">
            <div className="relative">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border">
                    <div className="w-full h-full rounded-full overflow-hidden">
                        <Image
                            src={imagePreview}
                            alt="Profile picture"
                            width={256}
                            height={256}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>


                {edit && <Button
                    onClick={handleImageClick}
                    size="icon"
                    className="absolute bottom-3 right-0 w-8 h-8 rounded-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 shadow-lg"
                    variant="outline"
                >
                    <Edit3 className="w-5 h-5" />
                    <span className="sr-only">Edit profile picture</span>
                </Button>}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    aria-label="Upload profile picture"
                    disabled={!edit}
                />
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-2 w-full">
                <div className="flex justify-between items-center gap-4 lg:flex-nowrap flex-wrap">
                    <FormField
                        control={form.control}
                        name="user_first_name"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input disabled={!edit} placeholder="Enter your first name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="user_last_name"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input disabled={!edit} placeholder="Enter your last name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Work e-mail</FormLabel>
                            <FormControl>
                                <Input disabled={!edit} placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="user_mobile_code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-600">Phone number</FormLabel>
                            <FormControl>
                                <div className="flex items-center border border-input rounded-lg bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
                                    {/* Country Code Section */}
                                    <Select disabled={!edit} value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="border-0 shadow-none focus:ring-0 w-auto px-3 rounded-r-none">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{selectedCountry?.flag}</span>
                                                <span className="font-medium">{field?.value?.replace("-", "")}</span>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countryCodes.map((country) => (
                                                <SelectItem key={`${country.code}-${country.name}`} value={country.code}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{country.flag}</span>
                                                        <span className="font-medium">{country.code}</span>
                                                        <span className="text-sm text-muted-foreground">{country.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Separator */}
                                    <div className="w-px h-6 bg-border"></div>

                                    {/* Phone Number Input */}
                                    <FormField
                                        control={form.control}
                                        name="user_mobile"
                                        render={({ field: phoneField }) => (
                                            <FormControl>
                                                <Input
                                                    disabled={!edit}
                                                    placeholder="01856459865"
                                                    value={phoneField.value}
                                                    onChange={(e) => {
                                                        const digits = e.target.value.replace(/\D/g, "")
                                                        phoneField.onChange(digits)
                                                    }}
                                                    className="border-0 shadow-none focus-visible:ring-0 flex-1 px-3 rounded-l-none"
                                                />
                                            </FormControl>
                                        )}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                            <FormField control={form.control} name="user_mobile" render={() => <FormMessage />} />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="about_me"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>About Me</FormLabel>
                            <FormControl>
                                <textarea
                                    placeholder="Tell us about yourself" disabled={!edit}
                                    {...field}
                                    className="min-h-[80px] border resize-y border-input rounded-md w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <BlackStyleButton fullWidth onClick={() => {
                const data = {
                    user_first_name: form.getValues("user_first_name"),
                    user_last_name: form.getValues("user_last_name"),
                    email: form.getValues("email"),
                    user_mobile_code: form.getValues("user_mobile_code"),
                    user_mobile: form.getValues("user_mobile"),
                    about_me: form.getValues("about_me"),
                    user_image: form.getValues("user_image")
                };
                if (!(data.user_image instanceof File)) delete data.user_image;
                return updateProfileValue(data, "Address Information");
            }
            } disabled={loading} title={loading ? <Loader2 className="animate-spin" /> : "Save And Continue"} />
        </div>
    )
}
