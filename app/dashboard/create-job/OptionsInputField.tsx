import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Check, Plus, Trash2 } from 'lucide-react';
import React from 'react'
import { useFieldArray } from 'react-hook-form';

export default function OptionsInputField({
    isMultiSelect,
    name,
    form,
    disabled
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any, // Replace with actual form type if available
    name: string,
    isMultiSelect: boolean,
    disabled?: boolean // Optional prop to disable the input
}) {
    const { control, setValue, getValues } = form;
    interface Option {
        id: string;
        value: string;
        isAnswer: boolean;
    }

    // Replace 'FormValues' with your actual form values type if available
    interface FormValues {
        [key: string]: Option[];
    }

    const { fields, append, remove } = useFieldArray<FormValues, string>({
        control,
        name,
    });

    const handleToggleAnswer = (index: number) => {
        const currentOptions = getValues(name);
        if (!isMultiSelect) {
            // Single-select: unset all, set only the clicked one
            const updated = currentOptions.map((item: {
                isAnswer: boolean;
                value: string;
            }, i: number) => ({
                ...item,
                isAnswer: i === index
            }));
            setValue(name, updated);
        } else {
            // Multi-select: toggle the clicked one
            const updated = [...currentOptions];
            updated[index].isAnswer = !updated[index]?.isAnswer;
            setValue(name, updated);
        }
    };

    return (
        <div className="space-y-1">
            <FormLabel>Options</FormLabel>
            {fields.map((item, index) => (
                <div key={item.id} className="space-y-2">
                    <FormField
                        control={form.control}
                        name={`${name}.${index}.value`}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className={`flex items-center justify-around gap-2 border rounded pl-4 ${item?.isAnswer ? 'bg-green-100' : 'bg-transparent'}`}>
                                        <Input
                                            disabled={disabled}
                                            placeholder="Ex. Dhaka, Bangladesh"
                                            className="border-0 p-0 h-6 shadow-none outline-none focus-visible:outline-none focus-visible:ring-0 ring-0 text-xs"
                                            {...field}
                                        />
                                        <Trash2

                                            className="w-4 h-4 cursor-pointer"
                                            onClick={() => !disabled && remove(index)}
                                        />
                                        <div
                                            onClick={() => !disabled && handleToggleAnswer(index)}
                                        >
                                            <Check
                                                className={`w-4 h-4 cursor-pointer `}
                                            />
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            ))}
            {fields.length <= 3 && <Button
                disabled={disabled}
                type="button"
                className="rounded bg-primary/10 border border-primary text-xs font-light hover:bg-primary transition-all duration-1000 p-0 h-6 w-full"
                onClick={() => append({ id: crypto.randomUUID(), value: '', isAnswer: false })}
            >
                <Plus className="w-4 h-4" />
                Add Option
            </Button>}
            <FormField
                control={form.control}
                name={name}
                render={() => <FormMessage />}
            />
        </div>
    );
}