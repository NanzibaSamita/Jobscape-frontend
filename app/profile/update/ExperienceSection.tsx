/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Plus, Trash2, Edit, Loader2, Save } from "lucide-react"
import { ExperienceDetail } from "./page"

interface ExperienceSectionProps {
    experienceDetails: ExperienceDetail[]
    onUpdate: (experience: ExperienceDetail[]) => void
    handlePropSubmit: (prp: string, string: boolean) => void
    loading: boolean
}

export function ExperienceSection({ experienceDetails, onUpdate, handlePropSubmit, loading }: ExperienceSectionProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [newExperience, setNewExperience] = useState<ExperienceDetail>({
        type: "",
        title: "",
        organization: "",
        startDate: "",
        endDate: "",
        location: { city: null, country: null },
        description: "",
        achievements: [],
    })
    const [newAchievement, setNewAchievement] = useState("")

    const handleAdd = () => {
        if (newExperience.title && newExperience.organization) {
            onUpdate([...experienceDetails ?? [], newExperience])
            resetForm()
            setIsAdding(false)
        }
    }

    const handleEdit = (index: number) => {
        setEditingIndex(index)
        setNewExperience(experienceDetails[index])
    }

    const handleUpdate = () => {
        if (editingIndex !== null) {
            const updated = [...experienceDetails ?? []]
            updated[editingIndex] = newExperience
            onUpdate(updated)
            setEditingIndex(null)
            resetForm()
        }
    }

    const handleDelete = (index: number) => {
        const updated = experienceDetails.filter((_, i) => i !== index)
        onUpdate(updated)
    }

    const resetForm = () => {
        setNewExperience({
            type: "",
            title: "",
            organization: "",
            startDate: "",
            endDate: "",
            location: { city: null, country: null },
            description: "",
            achievements: [],
        })
        setNewAchievement("")
    }

    const handleInputChange = (field: keyof ExperienceDetail, value: any) => {
        setNewExperience((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleLocationChange = (field: "city" | "country", value: string) => {
        setNewExperience((prev) => ({
            ...prev,
            location: {
                ...prev.location,
                [field]: value || null,
            },
        }))
    }

    const addAchievement = () => {
        if (newAchievement.trim()) {
            setNewExperience((prev) => ({
                ...prev,
                achievements: [...prev.achievements ?? [], newAchievement.trim()],
            }))
            setNewAchievement("")
        }
    }

    const removeAchievement = (index: number) => {
        setNewExperience((prev) => ({
            ...prev,
            achievements: prev.achievements.filter((_, i) => i !== index),
        }))
    }

    return (
        <Card className="border-2 border-muted bg-transparent shadow-sm">
            <CardHeader className="bg-gradient-to-r from-primary/40 to-primary/10 rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Briefcase className="h-6 w-6" />
                        <span>Work Experience</span>
                    </div>
                    <Button onClick={() => setIsAdding(true)} className=" hover:bg-yellow-50" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Experience
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="md:p-6 p-0 space-y-8">
                {/* Existing Experience Items */}
                <div className="space-y-4 mb-6">
                    {experienceDetails.map((experience, index) => (
                        <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-semibold  ">{experience.title}</h4>
                                    <p className=" text-muted-foreground">{experience.organization}</p>
                                    {experience.type && <Badge className="bg-primary mt-1">{experience.type}</Badge>}
                                </div>
                                <div className="flex space-x-2">
                                    <Button onClick={() => handleEdit(index)} size="sm" variant="outline">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={() => handleDelete(index)} size="sm" variant="destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                                {experience.startDate} - {experience.endDate}
                                {experience.location.city && experience.location.country && (
                                    <span className="ml-4">
                                        📍 {experience.location.city}, {experience.location.country}
                                    </span>
                                )}
                            </div>
                            {experience.description && <p className=" text-muted-foreground mb-2">{experience.description}</p>}
                            {experience.achievements.length > 0 && (
                                <div>
                                    <p className="font-medium   mb-1">Key Achievements:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-600">
                                        {experience.achievements.map((achievement, i) => (
                                            <li key={i}>{achievement}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add/Edit Form */}
                {(isAdding || editingIndex !== null) && (
                    <div className="border-2 border-yellow-300 rounded-lg p-4">
                        <h4 className="font-semibold   mb-4">
                            {editingIndex !== null ? "Edit Experience" : "Add New Experience"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="  font-medium">Job Title *</Label>
                                <Input
                                    value={newExperience.title}
                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                    className="border-yellow-200"
                                    placeholder="e.g., Software Engineer"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="  font-medium">Organization *</Label>
                                <Input
                                    value={newExperience.organization}
                                    onChange={(e) => handleInputChange("organization", e.target.value)}
                                    className="border-yellow-200"
                                    placeholder="e.g., Tech Company Inc."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="  font-medium">Employment Type</Label>
                                <Input
                                    value={newExperience.type}
                                    onChange={(e) => handleInputChange("type", e.target.value)}
                                    className="border-yellow-200"
                                    placeholder="e.g., Full-time, Part-time, Contract"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="  font-medium">Start Date</Label>
                                <Input
                                    type="date"
                                    value={newExperience.startDate}
                                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                                    className="border-yellow-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="  font-medium">End Date</Label>
                                <Input
                                    type="date"
                                    value={newExperience.endDate}
                                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                                    className="border-yellow-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="  font-medium">City</Label>
                                <Input
                                    value={newExperience.location.city || ""}
                                    onChange={(e) => handleLocationChange("city", e.target.value)}
                                    className="border-yellow-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="  font-medium">Country</Label>
                                <Input
                                    value={newExperience.location.country || ""}
                                    onChange={(e) => handleLocationChange("country", e.target.value)}
                                    className="border-yellow-200"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="  font-medium">Job Description</Label>
                                <Textarea
                                    value={newExperience.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    className="border-yellow-200"
                                    placeholder="Describe your role and responsibilities..."
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="  font-medium">Achievements</Label>
                                <div className="flex space-x-2 mb-2">
                                    <Input
                                        value={newAchievement}
                                        onChange={(e) => setNewAchievement(e.target.value)}
                                        className="border-yellow-200"
                                        placeholder="Add an achievement..."
                                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAchievement())}
                                    />
                                    <Button
                                        onClick={addAchievement}
                                        type="button"
                                        className="bg-yellow-500 hover:bg-yellow-600  "
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {newExperience.achievements.map((achievement, i) => (
                                        <Badge key={i} className="bg-yellow-100   border border-yellow-300">
                                            {achievement}
                                            <button type="button" onClick={() => removeAchievement(i)} className="ml-2 hover:text-red-600">
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <Button
                                onClick={() => {
                                    setIsAdding(false)
                                    setEditingIndex(null)
                                    resetForm()
                                }}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={editingIndex !== null ? handleUpdate : handleAdd}
                                className="bg-yellow-500 hover:bg-yellow-600  "
                            >
                                {editingIndex !== null ? "Update" : "Add"} Experience
                            </Button>
                        </div>
                    </div>
                )}
                <div className="flex md:justify-end justify-center py-6">
                    <Button
                        type="button"
                        onClick={() => handlePropSubmit("experience_details", true)}
                        disabled={loading}
                        className="bg-primary hover:bg-secondary   font-semibold px-8 py-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <p className="flex items-center text-ellipsis overflow-hidden">
                                <Save className="h-4 w-4 mr-2 md:block hidden" />
                                Update Work Experience
                            </p>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
