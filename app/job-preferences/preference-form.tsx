/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"

import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyboardEvent, useEffect, useRef, useState } from "react"
import { MultiSelect } from "@/components/ui/MultiSelect"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, X } from "lucide-react"
import { RangeSlider } from "@/components/ui/Range"
import BlackStyleButton from "@/components/custom-UI/Buttons/BlackStyleButton"
import { api } from "@/lib/axios/axios"
import { toast } from "react-toastify"
// import { useUI } from "@/contexts/ui-context"
// import ProfileCompleteModal from "./ProfileCompleteModal"
import { useRouter } from "next/navigation"
const PREFERENCE_STORE_API = "/api/v1/job-preference-store-update";

const formSchema = z.object({
    user_id: z.union([z.number(), z.null()]),//
    preferred_job_titles: z.array(z.string().max(255)),//
    preferred_sectors_id: z.array(z.number()),
    expected_salary_min: z.number().min(0).nullable(),
    expected_salary_max: z.number().nullable(),
    is_salary_negotiable: z.boolean(),
    job_types: z.array(z.enum(['Full-Time', 'Part-Time', 'Contract', 'Internship'])),
    preferred_locations: z.array(z.string().max(255)),
    remote_only: z.boolean(),
    remote_preferred: z.boolean(),
    preferred_work_mode: z.enum(['Onsite', 'Hybrid', 'Remote'])
}).refine(
    (data: {
        expected_salary_min: number | null,
        expected_salary_max: number | null
    }) => {
        if (data.expected_salary_max === null) return true;
        const min = data.expected_salary_min ?? 0;
        return data.expected_salary_max >= min;
    },
    {
        message: "Max salary must be greater than or equal to min salary",
        path: ["expected_salary_max"]
    }
)

type FormSchema = z.infer<typeof formSchema>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function JobPreferenceForm({ sectors, user }: { sectors: { value: string; label: string }[]; user: any }) {
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const typeArray: ('Full-Time' | 'Part-Time' | 'Contract' | 'Internship')[] = ['Full-Time', 'Part-Time', 'Contract', 'Internship'];
    const refLocation = useRef<HTMLInputElement>(null);
    // const { openModal, closeModal } = useUI()
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            user_id: user.id,
            preferred_job_titles: [],
            preferred_sectors_id: [],
            expected_salary_min: null,
            expected_salary_max: null,
            is_salary_negotiable: false,
            job_types: [],
            preferred_locations: [""], // Ensure at least one string for correct inference
            remote_only: false,
            remote_preferred: false,
            preferred_work_mode: "Onsite"
        }
    })

    const {
        fields: locations,
        append: addLocation,
        remove: removeLocation,
    } = useFieldArray({
        control: form.control,
        // @ts-ignore
        name: "preferred_locations",
    });

    function onSubmit(data: FormSchema) {
        setLoading(true);
        api.post(PREFERENCE_STORE_API, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(() => {
                toast.success("Preference saved successfully!");
                form.reset();
                // openModal("profileProgress", <ProfileCompleteModal actions={[{
                //     label: "Look for jobs",
                //     onClick: () => {
                //         router.push("/jobs");
                //         return closeModal("profileProgress");
                //     }
                // }, {
                //     label: "Home",
                //     onClick: () => {
                //         router.push("/home");
                //         return closeModal("profileProgress");
                //     }
                // }, {
                //     label: "Profile",
                //     onClick: () => {
                //         router.push("/profile");
                //         return closeModal("profileProgress");
                //     }
                // }]} />)
                router.push("/jobs");
            })
            .catch((error) => {
                console.error("Update failed:", error);
                const msg =
                    error?.response?.data?.message ||
                    "Something went wrong while updating profile.";
                toast.error(msg);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    function handleSalaryRangeChange([min, max]: [number, number]) {
        form.setValue("expected_salary_min", min)
        form.setValue("expected_salary_max", max)

        // Optional: trigger validation/touched/dirty
        form.trigger(["expected_salary_min", "expected_salary_max"])
    }

    useEffect(() => {
        form.setValue("preferred_sectors_id", selected.map(e => Number(e)))
    }, [selected]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 my-4">
                <FormField
                    control={form.control}
                    name="preferred_work_mode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Preferred Work Mode</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select work mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Onsite">Onsite</SelectItem>
                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                    <SelectItem value="Remote">Remote</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="space-y-1">
                    <FormLabel >Preferred Sector</FormLabel >
                    <MultiSelect
                        options={sectors}
                        selected={selected}
                        onChange={(value) => {
                            setSelected(value)
                        }}
                        placeholder="Select frameworks..."
                        maxCount={1}
                    />
                </div>
                <div className="space-y-1">
                    <FormLabel >Preferred Location</FormLabel >
                    <div className="flex flex-wrap gap-2">
                        {locations.map((item, index) => (
                            <div className="flex items-start gap-2" key={item.id}>
                                <FormField
                                    control={form.control}
                                    name={`preferred_locations.${index}`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                {/* <Input placeholder="e.g., Communication" {...field} /> */}
                                                <div className="border border-muted-foreground flex items-center justify-around gap-2 px-3 py-1 rounded-full bg-slate-300/20">
                                                    <p className="text-sm font-medium line-clamp-1 text-muted-foreground text-ellipsis">{field.value}</p>
                                                    <X className="h-4 w-4 shrink-0 text-muted-foreground cursor-pointer" onClick={() => removeLocation(index)} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 md:flex-nowrap flex-wrap">
                        <Input onKeyUp={(e: KeyboardEvent) => {
                            if (e.key === "Enter") {
                                if (refLocation.current) {
                                    addLocation(refLocation?.current?.value);
                                    refLocation.current.value = "";
                                }
                            }
                        }
                        } ref={refLocation} placeholder="e.g., Dhaka, Bangladesh" />
                        <Button type="button" size="sm" onClick={() => {
                            if (refLocation.current?.value) {
                                addLocation(refLocation.current.value);
                            }
                            refLocation.current!.value = "";
                        }}>
                            + Add Location
                        </Button>
                    </div>
                </div>
                <FormField
                    control={form.control}
                    name="job_types"
                    render={() => (
                        <FormItem>
                            <FormLabel>Job Types</FormLabel>
                            <div className="grid grid-cols-2 gap-2">
                                {typeArray.map((type) => (
                                    <FormField
                                        key={type}
                                        control={form.control}
                                        name="job_types"
                                        render={({ field }) => {
                                            const isChecked = field.value?.includes(type);
                                            return (
                                                <FormItem
                                                    key={type}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={isChecked}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    field.onChange([...field.value, type]);
                                                                } else {
                                                                    field.onChange(field.value.filter((t) => t !== type));
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="text-sm font-normal">{type}</FormLabel>
                                                </FormItem>
                                            );
                                        }}
                                    />
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormLabel>
                    Salary Range
                </FormLabel>
                <RangeSlider min={0} max={1000000} defaultValue={[50000, 150000]} onValueChange={handleSalaryRangeChange} />
                <FormField
                    control={form.control}
                    name={`is_salary_negotiable`}
                    render={({ field }) => (
                        <FormItem className="flex justify-start gap-5 items-center">
                            <FormLabel >
                                Is Salary Negotiable?
                            </FormLabel>
                            <FormControl>
                                <div className="relative inline-flex items-center">
                                    <div className="relative bg-gray-200 rounded-full p-1 w-20 h-6">
                                        <div
                                            className={`absolute top-1 left-1 w-10 h-4 bg-yellow-400 rounded-full shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center ${field.value ? "translate-x-8 bg-green-500" : "bg-white"
                                                }`}
                                        >
                                            <span className="text-xs font-bold text-black">{field.value ? "YES" : "NO"}</span>
                                        </div>
                                        <div className="flex justify-between items-center h-full px-1">
                                            <span className={`text-xs font-medium ${!field.value ? "text-white" : "text-gray-500"}`}>NO</span>
                                            <span className={`text-xs font-medium ${field.value ? "text-white" : "text-gray-500"}`}>YES</span>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={form.getValues("is_salary_negotiable") ? false : true}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            return field.onChange(form.getValues("is_salary_negotiable") ? false : true)
                                        }}
                                        className="absolute inset-0 w-full h-full cursor-pointer"
                                        aria-label={`Switch to ${form.getValues("is_salary_negotiable") ? "No" : "Yes"}`}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <BlackStyleButton fullWidth disabled={loading} title={loading ? <Loader2 className="animate-spin" /> : "Save"} />
            </form>
        </Form>
    )
}
