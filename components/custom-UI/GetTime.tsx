'use client'

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

type Props = {
    name: string;
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
    disabled?: boolean; // Optional prop to disable the input
};

export default function GetTime({ name, label, form, disabled = false }: Props) {
    const totalSeconds = form.watch(name) ?? 0;
    const [hours, setHours] = useState(Math.floor(totalSeconds / 3600));
    const [minutes, setMinutes] = useState((totalSeconds % 3600) / 60);

    // Update form value when hours or minutes change
    useEffect(() => {
        const totalSeconds = hours * 3600 + minutes * 60;
        form.setValue(name, totalSeconds, { shouldValidate: true });
    }, [hours, minutes]);

    return (
        <FormField
            control={form.control}
            name={name}
            render={() => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <div className="flex gap-2">
                            <Select
                                disabled={disabled}
                                value={String(hours)}
                                onValueChange={(val) => setHours(Number(val))}
                            >
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Hour" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <SelectItem key={i} value={String(i)}>
                                            {i} hr
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                disabled={disabled}
                                value={String(minutes)}
                                onValueChange={(val) => setMinutes(Number(val))}
                            >
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Minute" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 60 }, (_, i) => (
                                        <SelectItem key={i} value={String(i)}>
                                            {i} min
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
