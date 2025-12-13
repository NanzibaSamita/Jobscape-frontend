import React from "react"
import { useFieldArray } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import BlackStyleButton from "@/components/custom-UI/Buttons/BlackStyleButton"
import { Loader2 } from "lucide-react"

export default function ExperienceForm({ form,
    updateProfileValue,
    loading
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: { form: any; loading: boolean; updateProfileValue: (field: any, tab: any) => void }) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "experience_details",
    })

    return (
        <div className="space-y-6">
            {fields.map((item, index) => (
                <div
                    key={item.id}
                    className="border p-4 rounded-md shadow-sm relative"
                >
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Experience #{index + 1}</h3>
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                            Remove
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormField
                            control={form.control}
                            name={`experience_details.${index}.type`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Professional, Internship" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={`experience_details.${index}.title`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Software Engineer" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={`experience_details.${index}.organization`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organization</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Google" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={`experience_details.${index}.location.city`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Dhaka" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={`experience_details.${index}.location.country`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Bangladesh" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={`experience_details.${index}.startDate`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                        <Input type="month" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={`experience_details.${index}.endDate`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl>
                                        <Input type="month" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name={`experience_details.${index}.description`}
                        render={({ field }) => (
                            <FormItem className="mt-4">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        className="min-h-[80px]"
                                        placeholder="Describe your role and responsibilities"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={`experience_details.${index}.achievements`}
                        render={({ field }) => (
                            <FormItem className="mt-4">
                                <FormLabel>Achievements (comma separated)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Achievement 1, Achievement 2"
                                        value={field.value?.join(", ") || ""}
                                        onChange={(e) => field.onChange(e.target.value.split(",").map(v => v.trim()))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            ))}

            <Button type="button" onClick={() => append({})}>
                Add Experience
            </Button>
            <BlackStyleButton fullWidth onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data: any = form.getValues("experience_details");
                const errors: { path: string; message: string }[] = [];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.forEach(({ type, title, organization, startDate, }: any, i: number) => {
                    if (!type?.trim()) errors.push({ path: `experience_details.${i}.type`, message: `type is required` })
                    if (!title?.trim()) errors.push({ path: `experience_details.${i}.title`, message: `title is required` })
                    if (!organization?.trim()) errors.push({ path: `experience_details.${i}.organization`, message: `organization is required` })
                    if (!startDate?.trim()) errors.push({ path: `experience_details.${i}.startDate`, message: `startDate is required` })
                })
                if (errors.length > 0) {
                    errors.forEach((error) => {
                        form.setError(error.path, { type: 'manual', message: error.message });
                    });
                    const firstErrorPath = errors[0]?.path;
                    return form.setFocus(firstErrorPath);
                }
                return updateProfileValue({
                    experience_details: data,
                }, "done")
            }} title={loading ? <Loader2 className="animate-spin" /> : "Save and Continue"} />
        </div>
    )
}
