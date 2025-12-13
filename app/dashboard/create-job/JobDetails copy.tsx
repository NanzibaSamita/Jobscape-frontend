import BlackYellowStyleButton from '@/components/custom-UI/Buttons/BlackYellowStyleButton';
import WhiteBlackStyleButton from '@/components/custom-UI/Buttons/WhiteBlackStyleButton';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'

export default function JobDetails({
    nextStep,
    prevStep,
    form,
    loading,
}: {
    nextStep: (currentIndex: number) => void,
    prevStep: (currentIndex: number) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any, // Replace with actual form type if available
    loading: boolean
}) {
    return (
        <div className="space-y-5">
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Description *</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Describe the job responsibilities, required skills, etc."
                                className="min-h-[120px] text-sm font-light text-muted-foreground" // optional styling
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="job_responsibility"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Responsibility *</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Describe the job responsibilities, required skills, etc."
                                className="min-h-[120px] text-sm font-light text-muted-foreground" // optional styling
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="job_requirements"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Requirements *</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Describe the job responsibilities, required skills, etc."
                                className="min-h-[120px] text-sm font-light text-muted-foreground" // optional styling
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className='sm:grid md:grid-cols-3 grid-cols-1 gap-4'>
                <BlackYellowStyleButton
                    disabled={loading}  // Disable button if loading
                    fullWidth onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                        e?.preventDefault();
                        const [
                            description,
                            job_responsibility,
                            job_requirements,
                        ] = form.getValues(["description", "job_responsibility", "job_requirements"]);
                        const errors: { path: string; message: string }[] = [];
                        const data = {
                            description: description,
                            job_responsibility: job_responsibility,
                            job_requirements: job_requirements,
                        };
                        Object.keys(data).forEach((key) => {
                            if (!data[key as keyof typeof data]) {
                                errors.push({ path: key, message: `${key.replace(/_/g, ' ')} is required` });
                            }
                        })
                        if (errors.length > 0) {
                            errors.forEach((error) => {
                                form.setError(error.path, { type: 'manual', message: error.message });
                            });
                            return;
                        }

                        return nextStep(1)
                    }
                    } title={"Next"} />

                <WhiteBlackStyleButton disabled={loading} fullWidth onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    e?.preventDefault();
                    return prevStep(1)
                }
                } title={"Previous"} />

            </div>
        </div>
    )
}
