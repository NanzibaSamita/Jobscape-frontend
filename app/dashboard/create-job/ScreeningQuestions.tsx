import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CirclePlus, Loader2, Plus, Trash2 } from 'lucide-react';
import React, {  useState } from 'react'
import { useFieldArray } from 'react-hook-form';
import OptionsInputField from './OptionsInputField';
import BlackYellowStyleButton from '@/components/custom-UI/Buttons/BlackYellowStyleButton';
import WhiteBlackStyleButton from '@/components/custom-UI/Buttons/WhiteBlackStyleButton';
import StarButton from '@/components/custom-UI/Buttons/StarButton';
import { AiIcon } from '@/assets/svg';
import { aiBOT } from '@/lib/axios/axios';
import { toast } from 'react-toastify';
import { screening_question_prompt } from '@/local/screening_prompt';
import GetTime from '@/components/custom-UI/GetTime';

export default function ScreeningQuestions({
    nextStep,
    prevStep,
    form,
    loading,
    setLoading,
    countries,
    sectors,
    disabled = true
}: {
    nextStep: (currentIndex: number) => void,
    prevStep: (currentIndex: number) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any, // Replace with actual form type if available
    loading: boolean
    setLoading: (loading: boolean) => void
    disabled?: boolean
    countries: {
        id: string;
        name: string;
    }[]
    sectors: {
        id: string;
        name: string;
    }[]
}) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "screening_questions",
    });
    const watchedQuestions = form.watch("screening_questions");

    const [emptyQuestion, setEmptyQuestion] = useState<{
        type: string,
        question: string,
        required: boolean,
        options: {
            value: string;
            isAnswer: boolean; // Optional, only for multiple-choice or multi-multiple-choice
        }[]
    }>({
        "type": "text",
        "question": "",
        "required": true,
        "options": [
        ]
    });

    const [aiQuestions, setAIQuestions] = useState<{
        id: string;
        question: string;
        type: string;
        required: boolean;
        options?: {
            value: string;
            isAnswer: boolean;
        }[];
    }[]>([]);

    async function handelAISuggestedQuestion(e: React.MouseEvent<HTMLParagraphElement>) {
        e.preventDefault();
        if (loading) return;
        const [
            title,
            sector_id,
            job_type,
            salary_range,
            location,
            job_mode,
            description,
            job_requirements,
            job_responsibility,
        ] = form.getValues(["title", "sector_id", "job_type", "salary_range", "location", "job_mode", 'description', 'job_requirements', 'job_responsibility']);
        const country = countries.find((c) => c.id.toString() === location?.toString())?.name || "";
        const sector = sectors.find(s => s.id.toString() === sector_id?.toString())?.name || "";
        const json = {
            title,
            sector_id: sector,
            job_type,
            salary_range,
            location: country,
            job_mode,
            description,
            job_requirements,
            job_responsibility
        };
        if (!JSON?.stringify(json)?.trim()) return
        try {
            setLoading(true)
            const data = await aiBOT(screening_question_prompt.replace("<RAW_TEXT_HERE>", JSON?.stringify(json)?.trim()));

            setAIQuestions(data.map((q: {
                id: string;
                question: string;
                type: string;
                required: boolean;
                options?: {
                    value: string;
                    isAnswer: boolean;
                }[];
            }) => ({
                ...q,
                id: crypto.randomUUID(),
            })));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error generating job post:", error)
            toast.error(error?.message || "Failed to generate job post. Please try again.");
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='space-y-4'>
            <div className='flex justify-between items-center flex-wrap gap-2'>
                <GetTime
                    name={"timer_seconds"}
                    label="Duration"
                    form={form}
                    disabled={disabled}
                />
                {
                    disabled && <div className="px-2 py-1 max-w-min whitespace-nowrap text-xs text-yellow-800 rounded-lg bg-yellow-100 border border-yellow-400">
                        ⚠️ Editing is disabled. This form is read-only.
                    </div>

                }
            </div>
            <div className='space-y-2'>
                {
                    fields.map((item, index) => (
                        <div
                            key={item.id}
                            className='space-y-2 rounded-lg p-2 bg-primary/10'
                        >
                            <FormField
                                control={form.control}
                                name={`screening_questions.${index}.question`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className='text-sm font-semibold flex items-center justify-around gap-2 border rounded-lg px-4'>
                                                <p>{index + 1}.</p>
                                                <Input disabled={disabled} placeholder="Ex. What is your name?" className='border-0 p-0 shadow-none outline-none focus-visible:outline-none focus-visible:ring-0 ring-0' {...field} />
                                                {!disabled && <Trash2 className='w-4 h-4 cursor-pointer' onClick={() =>{
                                                     remove(index);
                                                    setSelectedIds((prev) => prev.filter((id, indx) => index !== indx));
                                                     }} />}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='md:grid md:grid-cols-3 gap-4'>
                                <div className=''>
                                    <FormField
                                        control={form.control}
                                        name={`screening_questions.${index}.type`}
                                        rules={{ required: "Required" }}
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Question Type</FormLabel>
                                                <FormControl>
                                                    <Select disabled={disabled} value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger className="w-full px-2 py-0">
                                                            <SelectValue placeholder="Select level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem key={"text"} value={"text"}>
                                                                Text
                                                            </SelectItem>
                                                            <SelectItem key={"multiple-choice"} value={"multiple-choice"}>
                                                                Select
                                                            </SelectItem>
                                                            <SelectItem key={"multi-select"} value={"multi-select"}>
                                                                Multiple Select
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {
                                    (watchedQuestions?.[index]?.type === "multiple-choice" || watchedQuestions?.[index]?.type === "multi-select") && <OptionsInputField
                                        disabled={disabled}
                                        isMultiSelect={watchedQuestions?.[index]?.type === "multi-select"}
                                        form={form}
                                        name={`screening_questions.${index}.options`}
                                    />
                                }
                                {
                                    <div className='space-y-2'>
                                        <FormLabel >
                                            Is Required?
                                        </FormLabel>
                                        <FormField
                                            control={form.control}
                                            name={`screening_questions.${index}.required`}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col justify-start items-start">
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
                                                                disabled={disabled}
                                                                type="checkbox"
                                                                className="sr-only"
                                                                checked={form.getValues(`screening_questions.${index}.required`) ? false : true}
                                                                onChange={(e) => field.onChange(e.target.checked)}
                                                            />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    if (disabled) return
                                                                    return field.onChange(form.getValues(`screening_questions.${index}.required`) ? false : true)
                                                                }}
                                                                className="absolute inset-0 w-full h-full cursor-pointer"
                                                                aria-label={`Switch to ${form.getValues(`screening_questions.${index}.required`) ? "No" : "Yes"}`}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                }
                            </div>
                        </div>))
                }
            </div>
            <div className='flex items-start justify-between gap-2 flex-col'>
                <div className='grid sm:grid-cols-3 grid-cols-1 gap-2 w-full '>
                    <div className='col-span-1'>
                        <FormItem className="w-full">
                            <FormLabel>Question Type *</FormLabel>
                            <FormControl>
                                <Select disabled={disabled} value={emptyQuestion.type} onValueChange={(args) => setEmptyQuestion((prev) => ({
                                    ...prev,
                                    type: args,
                                    question: "",
                                }))}>
                                    <SelectTrigger className="w-full px-2 py-0">
                                        <SelectValue placeholder="Question Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem key={"text"} value={"text"}>
                                            Text
                                        </SelectItem>
                                        <SelectItem key={"multiple-choice"} value={"multiple-choice"}>
                                            Select
                                        </SelectItem>
                                        <SelectItem key={"multi-select"} value={"multi-select"}>
                                            Multiple Select
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </div>
                    <div className='sm:col-span-2 col-span-1'>
                        <FormItem>
                            <FormLabel>
                                Write Your Question *
                            </FormLabel>
                            <FormControl>
                                <Input
                                    disabled={disabled}
                                    value={emptyQuestion.question}
                                    onChange={(e) => setEmptyQuestion((prev) => ({
                                        ...prev,
                                        question: e.target.value
                                    }))} placeholder="Ex. What is your name?" className='h-9' />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </div>
                </div>
                <Button disabled={disabled} type="button" className='rounded-full bg-primary/10 border border-primary text-sm font-normal hover:bg-primary transition-all duration-1000'
                    onClick={() => {
                        const id = crypto.randomUUID();
                        append({
                            type: emptyQuestion.type,
                            question: emptyQuestion.question,
                            required: true,
                            options: emptyQuestion.type === 'text' ? [] : emptyQuestion.options || [],
                            id
                        });
                        setSelectedIds(prev => [...prev, id]); // Add a new unique ID for the new question
                        // Reset the input fields (optional)
                        setEmptyQuestion({
                            type: 'text',
                            question: '',
                            required: true,
                            options: []
                        });
                    }}
                >
                    <Plus className='w-4 h-4' />
                    Add Question
                </Button>
            </div>
            {/* AI SUGGESTION QUESTIONS */}
            <div className=''>
                <div className='flex justify-between items-center'>
                    <p className='md:text-lg text-sm font-normal'>AI Suggest Questions</p>
                    {!disabled && <StarButton>
                        {loading ? <div className='min-w-32 min-h-8 justify-center items-center flex gap-2 bg-black dark:bg-primary/15 rounded-full'>
                            <Loader2 className="w-6 h-6 stroke-white animate-spin" />
                        </div> : <p onClick={(e: React.MouseEvent<HTMLParagraphElement>) => !loading && handelAISuggestedQuestion(e)} className="bg-black min-w-max rounded-full overflow-hidden px-4 py-1 text-white font-light flex justify-center items-center gap-2">
                            <AiIcon className="w-6 h-6" />
                            Suggest
                        </p>}
                    </StarButton>}
                </div>
                {aiQuestions.length > 0 && <div className='w-full md:rounded-lg rounded bg-dashboard md:p-4 p-2 mt-2'>
                    {
                        <div className='space-y-2'>
                            {
                                aiQuestions.map((q, index) => (
                                    <div key={index} className={`p-3 rounded-md shadow-sm bg-dashboard-foreground flex justify-between items-center hover:border-dashboard/20 ${selectedIds.includes(q.id) ? "bg-primary/10" : ""}`}>
                                        <p className='text-sm '>{index + 1}. {q.question}</p>
                                        <CirclePlus onClick={() =>{
                                             append(q);
                                            setSelectedIds(prev => [...prev, q.id]);
                                             }} className='w-4 h-4 cursor-pointer shrink-0' />
                                    </div>
                                ))
                            }
                        </div>

                    }
                </div>}
            </div>

            <div className='sm:grid md:grid-cols-3 grid-cols-1 gap-4'>
                <BlackYellowStyleButton
                    disabled={loading}  // Disable button if loading
                    fullWidth
                    onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                        e.preventDefault();

                        const [screeningQuestions, timer_seconds] = form.getValues(["screening_questions", "timer_seconds"]) || [];
                        const errors: { path: string; message: string }[] = [];

                        if (timer_seconds === undefined || timer_seconds === null || timer_seconds === "" || timer_seconds === 0 || timer_seconds === "0") {
                            errors.push({
                                path: `timer_seconds`,
                                message: "Question is required or not be 0",
                            })

                        }

                        screeningQuestions.forEach((q: {
                            options?: {
                                value: string;
                                isAnswer: boolean; // Optional, only for multiple-choice or multi-multiple-choice
                            }[];
                            question: string;
                            required?: boolean;
                            type: string;
                        }, index: number) => {
                            const pathPrefix = `screening_questions.${index}`;
                            if (!q.question?.trim()) {
                                errors.push({
                                    path: `${pathPrefix}.question`,
                                    message: "Question is required",
                                });
                            }
                            if (q.type === "multiple-choice" || q.type === "multi-select") {
                                const options = Array.isArray(q.options) ? q.options : [];
                                options.forEach((option: {
                                    value: string,
                                    isAnswer: boolean
                                }, optionIndex: number) => {
                                    if (!option.value.trim()) {
                                        errors.push({
                                            path: `${pathPrefix}.options.${optionIndex}.value`,
                                            message: "Option must not be empty",
                                        })
                                    }
                                })
                                if (options.length < 2) {
                                    errors.push({
                                        path: `${pathPrefix}.options`,
                                        message: "At least two options are required for multiple-choice or multi-select questions",
                                    })
                                }
                                // Ensure at least one option is marked as the correct answer
                                const hasAtLeastOneAnswer = options.some(option => option.isAnswer === true);
                                if (!hasAtLeastOneAnswer) {
                                    errors.push({
                                        path: `${pathPrefix}.options`,
                                        message: "At least one option must be marked as the correct answer",
                                    });
                                }
                            }
                        });
                        if (errors.length > 0) {
                            errors.forEach((error) => {
                                form.setError(error.path, {
                                    type: "manual",
                                    message: error.message,
                                });
                            });
                            return;
                        }

                        return nextStep(2);
                    }}


                    title={"Next"}
                />

                <WhiteBlackStyleButton disabled={loading} fullWidth onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    e?.preventDefault();
                    return prevStep(2)
                }
                } title={"Previous"} />

            </div>
        </div>
    )
}
