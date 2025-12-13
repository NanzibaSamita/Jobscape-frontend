'use client'

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import BlackYellowStyleButton from '@/components/custom-UI/Buttons/BlackYellowStyleButton';
import WhiteBlackStyleButton from '@/components/custom-UI/Buttons/WhiteBlackStyleButton';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import React from 'react'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function JobDetails({
    nextStep,
    prevStep,
    form,
    loading,
}: {
    nextStep: (currentIndex: number) => void,
    prevStep: (currentIndex: number) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any,
    loading: boolean
}) {
    return (
        <div className="space-y-5">
            {["description", "job_responsibility", "job_requirements", "job_benefits"].map((fieldName) => (
                <FormField
                    key={fieldName}
                    control={form.control}
                    name={fieldName}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="capitalize">{fieldName.replace(/_/g, ' ')} *</FormLabel>
                            <FormControl>
                                <ReactQuill
                                    theme="snow"
                                    value={field.value}
                                    onChange={field.onChange}
                                    className="bg-white"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            ))}

            <div className='sm:grid md:grid-cols-3 grid-cols-1 gap-4'>
                <BlackYellowStyleButton
                    disabled={loading}
                    fullWidth
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        const [
                            description,
                            job_responsibility,
                            job_requirements,
                        ] = form.getValues(["description", "job_responsibility", "job_requirements"]);

                        const errors: { path: string; message: string }[] = [];
                        const data = {
                            description,
                            job_responsibility,
                            job_requirements,
                        };

                        Object.entries(data).forEach(([key, value]) => {
                            const stripped = value.replace(/<(.|\n)*?>/g, '').trim(); // Strip HTML
                            if (!stripped) {
                                errors.push({ path: key, message: `${key.replace(/_/g, ' ')} is required` });
                            }
                        });

                        if (errors.length > 0) {
                            errors.forEach((error) => {
                                form.setError(error.path, { type: 'manual', message: error.message });
                            });
                            return;
                        }

                        nextStep(1);
                    }}
                    title="Next"
                />

                <WhiteBlackStyleButton
                    disabled={loading}
                    fullWidth
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        prevStep(1);
                    }}
                    title="Previous"
                />
            </div>
        </div>
    );
}
