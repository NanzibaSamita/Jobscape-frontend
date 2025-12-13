import React from 'react'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import BlackYellowStyleButton from '@/components/custom-UI/Buttons/BlackYellowStyleButton'
import { RangeSlider } from '@/components/ui/Range'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Label } from '@radix-ui/react-label'

export default function BasicInformation({
    // formData,
    nextStep,
    // setFormData,
    form,
    sectors,
    countries,
    companies
}: {
    nextStep: (currentIndex: number) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any, // Replace with actual form type if available
    sectors: {
        id: string;
        name: string;
    }[],
    countries: {
        id: string;
        name: string;
    }[],
    companies: {
        id: string;
        name: string;
    }[]
}) {
    function handleSalaryRangeChange([min, max]: [number, number]) {
        form.setValue("salary_range", `${min}-${max}`);
        // Optional: trigger validation/touched/dirty
        form.trigger(["salary_range"])
    }
    return (
        <div className='space-y-4'>
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Title *</FormLabel>
                        <FormControl>
                            <Input placeholder="123 Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className='md:grid md:grid-cols-2 grid-cols-1 gap-4'>
                <FormField
                    control={form.control}
                    name="sector_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Department *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select sector" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="z-[102]">
                                    {
                                        sectors.length === 0 ? (
                                            <SelectItem value="-" disabled>
                                                No sectors available
                                            </SelectItem>
                                        ) : (
                                            sectors.map((sector) => (
                                                <SelectItem key={sector.id} value={sector.id.toString()}>
                                                    {sector.name}
                                                </SelectItem>
                                            ))
                                        )
                                    }
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="company_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select company" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="z-[102]">
                                    {
                                        sectors.length === 0 ? (
                                            <SelectItem value="-" disabled>
                                                No company available
                                            </SelectItem>
                                        ) : (
                                            companies.map((company) => (
                                                <SelectItem key={company.id} value={company.id.toString()}>
                                                    {company.name}
                                                </SelectItem>
                                            ))
                                        )
                                    }
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className='md:grid md:grid-cols-2 grid-cols-1 gap-4'>
                <FormField
                    control={form.control}
                    name="vacancies"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>No of Opening *</FormLabel>
                            <FormControl>
                                <Input type='number' min={1} placeholder="Ex. 10" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="job_type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Employment type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="z-[102]">
                                    <SelectItem key={"Full-time"} value={"Full-time"}>
                                        Full-time
                                    </SelectItem>
                                    <SelectItem key={"Part-time"} value={"Part-time"}>
                                        Part-time
                                    </SelectItem>
                                    <SelectItem key={"Internship"} value={"Internship"}>
                                        Internship
                                    </SelectItem>
                                    <SelectItem key={"Contractual"} value={"Contractual"}>
                                        Contractual
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
                control={form.control}
                name="salary_range"
                render={({ field }) => {
                    const [min, max] = field.value?.split("-").map(Number) ?? [7000, 50000]

                    const handleInputChange = (index: number, newValue: number) => {
                        const values = [min, max];
                        values[index] = newValue;
                        field.onChange(`${values[0]}-${values[1]}`);
                    };
                    return (
                        <FormItem>
                            <FormLabel>Salary Range</FormLabel>
                            <FormControl>
                                <div className='px-3 py-2 space-y-2'>
                                    <RangeSlider hideRange min={0} max={150000} value={[form?.getValues("salary_range")?.split('-')[0] ?? "7000", form?.getValues("salary_range")?.split('-')[1] ?? "50000"]} onValueChange={handleSalaryRangeChange} />
                                    <div className='flex justify-between items-center gap-4'>
                                        <div className='flex items-center border border-gray-300 flex-1 px-2 rounded-md gap-1'>
                                            <Input
                                                type="number"
                                                value={min}
                                                step={1000}
                                                onChange={(e) => handleInputChange(0, Number(e.target.value))}
                                                placeholder="min"
                                                min={0}
                                                max={Number(form?.getValues("salary_range")?.split('-')[1]) || 150000}
                                                className='border-0 p-0 max-w-max text-xs font-light text-right outline-none focus:outline-none right-0 focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:border-0 rounded-md shadow-none'
                                            />
                                            <Label className='text-xs font-light'>BDT</Label>
                                        </div>
                                        <div className='flex items-center border border-gray-300 flex-1 px-2 rounded-md gap-1'>
                                            <Input
                                                type="number"
                                                value={max}
                                                step={1000}
                                                min={Number(form?.getValues("salary_range")?.split('-')[0])}
                                                max={150000}
                                                onChange={(e) => handleInputChange(1, Number(e.target.value))}
                                                placeholder="max"
                                                className='border-0 p-0 text-xs font-light text-right outline-none focus:outline-none right-0 focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:border-0 rounded-md shadow-none'
                                            />
                                            <Label className='text-xs font-light'>BDT</Label>
                                        </div>

                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )
                }}
            />
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
            <div className='grid md:grid-cols-2 gap-4 grid-cols-1'>
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="z-[102]">
                                    {
                                        countries.length === 0 ? (
                                            <SelectItem value="-" disabled>
                                                No sectors available
                                            </SelectItem>
                                        ) : (
                                            countries.map((country) => (
                                                <SelectItem key={country.name} value={country.name.toString()}>
                                                    {country.name}
                                                </SelectItem>
                                            ))
                                        )
                                    }
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Application Deadline</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <button
                                            type="button"
                                            className={`w-full text-left px-3 py-2 border rounded-md shadow-sm bg-white ${!field.value ? "text-muted-foreground" : ""
                                                }`}
                                        >
                                            {field.value
                                                ? new Date(field.value).toLocaleDateString(undefined, {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })
                                                : "Select a date"}
                                            <CalendarIcon className="ml-2 inline-block w-4 h-4 text-gray-400 float-right" />
                                        </button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[102] bg-white">
                                    <Calendar
                                        mode="single"
                                        selected={field.value ? new Date(field.value) : undefined}
                                        onSelect={(date) => field.onChange(date)}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="job_mode"
                    render={({ field }) => (
                        <FormItem className="">
                            <FormLabel>Work Place *</FormLabel>
                            <FormControl>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: "Onsite", label: "Onsite" },
                                        { value: "Remote", label: "Remote" },
                                        { value: "Hybrid", label: "Hybrid" },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => field.onChange(option.value)}
                                            className={`md:col-span-1 px-3 py-3 rounded-lg border text-sm font-medium transition-colors line-clamp-1 text-ellipsis ${field.value === option.value
                                                ? "bg-primary text-white"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className='sm:grid md:grid-cols-3 grid-cols-1 gap-4'>
                <BlackYellowStyleButton fullWidth onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    e?.preventDefault();
                    const [title,
                        sector_id,
                        vacancies,
                        job_type,
                        salary_range,
                        location,
                        job_mode, company_id] = form.getValues(["title", "sector_id", "vacancies", "job_type", "salary_range", "location", "job_mode", "company_id", "deadline"]);
                    const errors: { path: string; message: string }[] = [];
                    const data = {
                        title: title,
                        sector_id: sector_id,
                        vacancies: vacancies,
                        job_type: job_type,
                        salary_range: salary_range,
                        location: location,
                        job_mode: job_mode,
                        company_id: company_id,
                        // deadline: deadline ? new Date(deadline).toISOString() : null
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

                    return nextStep(0)
                }
                } title={"Next"} />

            </div>
        </div>
    )
}
