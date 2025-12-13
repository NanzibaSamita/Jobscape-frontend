import React from "react";
import {
    useFieldArray,
    UseFormReturn,
    FieldArrayPath,
    FieldValues,
} from "react-hook-form";

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import BlackStyleButton from "@/components/custom-UI/Buttons/BlackStyleButton";

/** -------------------------------------------------------------------
 * EducationForm
 * --------------------------------------------------------------------
 * A repeatable section for editing an `education_details` field array
 * inside a larger form (react-hook-form).
 *
 * Requirements met:
 *  • Mirrors the structure / styling of your existing BasicForm snippet
 *  • Uses `useFieldArray` so users can add/remove multiple entries
 *  • Default values come from `useForm({ defaultValues: { education_details }})`
 *  • Each field is validated via rules passed through `FormField`
 *
 *  ⚠️ Parent component must initialise RHF like:
 *    const form = useForm({ defaultValues: { education_details: [] }})
 * ------------------------------------------------------------------*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface EducationFormProps<T extends FieldValues = any> {
    /** The react‑hook‑form instance */
    form: UseFormReturn<T>;
    /**
     * The name/path of the array field. Defaults to "education_details".
     * Allowing generic path makes component reusable.
     */
    name?: FieldArrayPath<T>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateProfileValue: (field: any, tab: any) => void;
    edit?: boolean; // Whether the form is in edit mode
    loading: boolean; // Whether the form is currently loading
}

export default function EducationForm({
    edit = true,
    form,
    name = "education_details",
    updateProfileValue,
    loading,
}: EducationFormProps) {
    // ---------------------------------------------
    // Field array hooks
    // ---------------------------------------------
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name,
    });

    // Template for a new education entry
    const emptyEdu = {
        level: "",
        degree: "",
        field: "",
        institution: "",
        startDate: "",
        endDate: "",
        location: {
            city: "",
            country: "",
        },
        grade: "",
        certifications: "", // treat as comma‑separated string for simplicity
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customLevels = fields.map((field: any) => field?.level);

    // Base options
    const baseOptions = [
        "High School",
        "Associate",
        "Bachelor",
        "Master",
        "Doctorate",
    ];

    // Merge with custom levels and remove empty ones
    const mergedLevels = [
        ...baseOptions,
        ...customLevels.filter((lvl) => lvl && lvl !== ""),
    ];

    // Remove duplicates by converting to a Set, then create a Map
    const levelMap = new Map(
        Array.from(new Set(mergedLevels)).map((level) => [level, level])
    );
    return (
        <div className="space-y-6">
            {fields.map((field, index) => (
                <div
                    key={field.id}
                    className="border border-border rounded-lg p-4 space-y-4 relative"
                >
                    {/* Remove button */}
                    {fields.length >= 1 && (
                        <Button disabled={!edit}
                            type="button"
                            onClick={() => remove(index)}
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}

                    {/* First row: Level & Degree */}
                    <div className="flex justify-between items-center gap-4 lg:flex-nowrap flex-wrap">
                        {/* Level */}
                        <FormField
                            control={form.control}
                            name={`${name}.${index}.level`}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Level</FormLabel>
                                    <FormControl>
                                        <Select disabled={!edit} value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from(levelMap.values()).map((lvl) => (
                                                    <SelectItem key={lvl} value={lvl}>
                                                        {lvl}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Degree */}
                        <FormField
                            control={form.control}
                            name={`${name}.${index}.degree`}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Degree</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} placeholder="BSc, MSc, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Second row: Field & Institution */}
                    <div className="flex justify-between items-center gap-4 lg:flex-nowrap flex-wrap">
                        <FormField
                            control={form.control}
                            name={`${name}.${index}.field`}
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Field of Study</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} placeholder="Computer Science" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={`${name}.${index}.institution`}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Institution</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} placeholder="University name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Dates */}
                    <div className="flex justify-between items-center gap-4 lg:flex-nowrap flex-wrap">
                        <FormField
                            control={form.control}
                            name={`${name}.${index}.startDate`}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Start (YYYY-MM)</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} type="month" placeholder="2019-08" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={`${name}.${index}.endDate`}
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>End (YYYY-MM or present)</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} type="month" placeholder="2023-06" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Location & Grade */}
                    <div className="flex justify-between items-center gap-4 lg:flex-nowrap flex-wrap">
                        <FormField
                            control={form.control}
                            name={`${name}.${index}.location.city`}
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} placeholder="City" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={`${name}.${index}.location.country`}
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} placeholder="Country" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Grade & Certifications */}
                    <div className="flex justify-between items-center gap-4 lg:flex-nowrap flex-wrap">
                        <FormField
                            control={form.control}
                            name={`${name}.${index}.grade`}
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Grade / GPA</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} placeholder="e.g. 3.8 GPA" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={`${name}.${index}.certifications`}
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Certifications (comma‑separated)</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} placeholder="AWS, Azure, ..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            ))}

            {/* Add new education entry */}
            <Button disabled={!edit} type="button" onClick={() => append(emptyEdu)}>
                Add Education
            </Button>
            <BlackStyleButton fullWidth onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data: any = form.getValues("education_details");
                const errors: { path: string; message: string }[] = [];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.forEach(({ level, degree, field, institution, startDate, grade, }: any, i: number) => {
                    if (!level?.trim()) errors.push({ path: `education_details.${i}.level`, message: `level is required` })
                    if (!degree?.trim()) errors.push({ path: `education_details.${i}.degree`, message: `degree is required` })
                    if (!field?.trim()) errors.push({ path: `education_details.${i}.field`, message: `field issued is required` })
                    if (!institution?.trim()) errors.push({ path: `education_details.${i}.institution`, message: `institution is required` })
                    if (!startDate?.trim()) errors.push({ path: `education_details.${i}.startDate`, message: `startDate is required` })
                    if (!grade?.trim()) errors.push({ path: `education_details.${i}.grade`, message: `grade is required` })
                })
                if (errors.length > 0) {
                    errors.forEach((error) => {
                        form.setError(error.path, { type: 'manual', message: error.message });
                    });
                    const firstErrorPath = errors[0]?.path;
                    return form.setFocus(firstErrorPath);
                }
                return updateProfileValue({
                    education_details: data,
                }, "Experience Details")
            }} title={loading ? <Loader2 className="animate-spin" /> : "Save and Continue"} />
        </div>
    );
}
