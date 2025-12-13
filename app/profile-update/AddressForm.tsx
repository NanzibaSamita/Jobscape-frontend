import BlackStyleButton from '@/components/custom-UI/Buttons/BlackStyleButton';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react';
import React from 'react'

export default function AddressForm({
    form,
    edit = true,
    updateProfileValue,
    loading
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
    edit?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateProfileValue: (field: any, tab: any) => void,
    loading: boolean;
}) {
    return (
        <>
            <div className="flex justify-between items-center gap-4 lg:flex-nowrap flex-wrap">
                <FormField
                    control={form.control}
                    name="user_street_address"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                                <Input disabled={!edit} placeholder="123 Main Street" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="user_police_station"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Police Station</FormLabel>
                            <FormControl>
                                <Input disabled={!edit} placeholder="e.g. Dhanmondi" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex justify-between items-center gap-4 lg:flex-nowrap flex-wrap">
                <FormField
                    control={form.control}
                    name="user_city"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>City</FormLabel>
                            <FormControl>
                                <Input disabled={!edit} placeholder="e.g. Dhaka" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="user_zip"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                                <Input disabled={!edit} placeholder="e.g. 1209" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex justify-between items-center gap-4 lg:flex-nowrap flex-wrap">
                <FormField
                    control={form.control}
                    name="user_state"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>State/Division</FormLabel>
                            <FormControl>
                                <Input disabled={!edit} placeholder="e.g. Dhaka Division" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="user_country"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                                <Input disabled={!edit} placeholder="e.g. Bangladesh" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <BlackStyleButton fullWidth onClick={() => updateProfileValue({
                user_street_address: form.getValues("user_street_address"),
                user_police_station: form.getValues("user_police_station"),
                user_city: form.getValues("user_city"),
                user_zip: form.getValues("user_zip"),
                user_state: form.getValues("user_state"),
                user_country: form.getValues("user_country")
            }, "Professional Details")} disabled={loading} title={loading ? <Loader2 className="animate-spin" /> : "Save and Continue"} />
        </>

    )
}
