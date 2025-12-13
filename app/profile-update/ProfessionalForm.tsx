'use client'

import React from 'react'
import { useFieldArray } from 'react-hook-form'
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Trash2 } from 'lucide-react'            // ⬅️ tiny trash-can icon
import BlackStyleButton from '@/components/custom-UI/Buttons/BlackStyleButton'

import { z } from 'zod'

export const professionalDetailsSchema = z.object({
    professional_details: z.object({
        certifications: z.array(
            z.object({
                name: z.string().min(1, 'Certification name is required'),
                authority: z.string().min(1, 'Authority is required'),
                dateIssued: z.string().min(1, 'Date issued is required'),
                credentialId: z.string().min(1, 'Credential ID is required'),
            })
        ),
        projects: z.array(
            z.object({
                name: z.string().min(1, 'Project name is required'),
                role: z.string().min(1, 'Role is required'),
                field: z.string().min(1, 'Field is required'),
                duration: z.string().min(1, 'Duration is required'),
                description: z.string().optional(), // ✅ optional
            })
        ),
        skills: z.object({
            general: z.array(z.string().min(1, 'General skill is required')),
            technical: z.array(z.string().min(1, 'Technical skill is required')),
        }),
    }),
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProfessionalDetailsForm({ form, edit = true, updateProfileValue, loading }: { loading: boolean; form: any; edit?: boolean; updateProfileValue: (field: any, tab: any) => void }) {
    /* ──────────────────────────────────────────────────  field arrays  */
    const {
        fields: certifications,
        append: addCert,
        remove: removeCert,            // ⬅️ remove helper
    } = useFieldArray({
        control: form.control,
        name: 'professional_details.certifications',
    })

    const {
        fields: projects,
        append: addProject,
        remove: removeProject,         // ⬅️
    } = useFieldArray({
        control: form.control,
        name: 'professional_details.projects',
    })

    const {
        fields: generalSkills,
        append: addGeneralSkill,
        remove: removeGeneralSkill,    // ⬅️
    } = useFieldArray({
        control: form.control,
        name: 'professional_details.skills.general',
    })

    const {
        fields: technicalSkills,
        append: addTechnicalSkill,
        remove: removeTechnicalSkill,  // ⬅️
    } = useFieldArray({
        control: form.control,
        name: 'professional_details.skills.technical',
    })

    /* ───────────────────────────────────────────────  render */
    return (
        <div className="space-y-6">
            {/* ░░░░░░ Certifications ░░░░░░ */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Certifications</h3>
                {certifications.map((item, index) => (
                    <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 relative"
                        key={item.id}
                    >
                        {/* remove button top-right */}
                        <Button disabled={!edit}
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="absolute -right-2 -top-2"
                            onClick={() => removeCert(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        {/* four inputs … */}
                        <FormField
                            control={form.control}
                            name={`professional_details.certifications.${index}.name`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`professional_details.certifications.${index}.authority`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Authority</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`professional_details.certifications.${index}.dateIssued`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date Issued</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} placeholder="YYYY-MM" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`professional_details.certifications.${index}.credentialId`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Credential ID</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                ))}

                <Button disabled={!edit}
                    type="button"
                    onClick={() =>
                        addCert({ name: '', authority: '', dateIssued: '', credentialId: '' })
                    }
                >
                    + Add Certification
                </Button>
            </div>

            {/* ░░░░░░ Projects ░░░░░░ */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Projects</h3>
                {projects.map((item, index) => (
                    <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 relative"
                        key={item.id}
                    >
                        <Button disabled={!edit}
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="absolute -right-2 -top-2"
                            onClick={() => removeProject(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        {/* five inputs … */}
                        <FormField
                            control={form.control}
                            name={`professional_details.projects.${index}.name`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`professional_details.projects.${index}.role`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`professional_details.projects.${index}.field`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Field</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`professional_details.projects.${index}.duration`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration</FormLabel>
                                    <FormControl>
                                        <Input disabled={!edit} placeholder="YYYY–YYYY" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`professional_details.projects.${index}.description`}
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea disabled={!edit} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                ))}

                <Button disabled={!edit}
                    type="button"
                    onClick={() =>
                        addProject({ name: '', role: '', field: '', description: '', duration: '' })
                    }
                >
                    + Add Project
                </Button>
            </div>

            {/* ░░░░░░ Skills ░░░░░░ */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Skills</h3>

                {/* General skills */}
                <div className="space-y-1">
                    <p className="font-medium text-sm text-muted-foreground">General Skills</p>
                    {generalSkills.map((item, index) => (
                        <div className="flex items-start gap-2" key={item.id}>
                            <FormField
                                control={form.control}
                                name={`professional_details.skills.general.${index}`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input disabled={!edit} placeholder="e.g., Communication" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button disabled={!edit}
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => removeGeneralSkill(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button disabled={!edit} type="button" size="sm" onClick={() => addGeneralSkill('')}>
                        + Add General Skill
                    </Button>
                </div>

                {/* Technical skills */}
                <div className="space-y-1">
                    <p className="font-medium text-sm text-muted-foreground">
                        Technical Skills
                    </p>
                    {technicalSkills.map((item, index) => (
                        <div className="flex items-start gap-2" key={item.id}>
                            <FormField
                                control={form.control}
                                name={`professional_details.skills.technical.${index}`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input disabled={!edit} placeholder="e.g., React.js" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button disabled={!edit}
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => removeTechnicalSkill(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button disabled={!edit} type="button" size="sm" onClick={() => addTechnicalSkill('')}>
                        + Add Technical Skill
                    </Button>
                </div>
            </div>
            <BlackStyleButton fullWidth onClick={() => {
                const data = form.getValues("professional_details");
                const errors: { path: string; message: string }[] = [];
                // ⬛ Check certifications
                data.certifications.forEach((cert: { name: string; authority: string; dateIssued: string; credentialId: string }, i: number) => {
                    if (!cert.name?.trim()) errors.push({ path: `professional_details.certifications.${i}.name`, message: `Certification: name is required` })
                    if (!cert.authority?.trim()) errors.push({ path: `professional_details.certifications.${i}.authority`, message: `Certification: authority is required` })
                    if (!cert.dateIssued?.trim()) errors.push({ path: `professional_details.certifications.${i}.dateIssued`, message: `Certification: date issued is required` })
                    if (!cert.credentialId?.trim()) errors.push({ path: `professional_details.certifications.${i}.credentialId`, message: `Certification: credential ID is required` })
                })

                // ⬛ Check projects
                data.projects.forEach((proj: { name: string; role: string; field: string; duration: string }, i: number) => {
                    if (!proj.name?.trim()) errors.push({ path: `professional_details.projects.${i}.name`, message: `Project: name is required` })
                    if (!proj.role?.trim()) errors.push({ path: `professional_details.projects.${i}.role`, message: `Project: role is required` })
                    if (!proj.field?.trim()) errors.push({ path: `professional_details.projects.${i}.field`, message: `Project: field is required` })
                    if (!proj.duration?.trim()) errors.push({ path: `professional_details.projects.${i}.duration`, message: `Project: duration is required` })
                    // description is optional
                })
                if (errors.length > 0) {
                    console.log("Validation errors:", errors);
                    errors.forEach((error) => {
                        form.setError(error.path, { type: 'manual', message: error.message });
                    });
                    const firstErrorPath = errors[0]?.path;
                    return form.setFocus(firstErrorPath);
                }
                return updateProfileValue({
                    professional_details: data,
                }, "Educational Details")
            }} title={loading ? <Loader2 className="animate-spin" /> : "Save and Continue"} />
        </div>
    )
}
