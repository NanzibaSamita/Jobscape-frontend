/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Plus, Trash2, Edit, Loader2, Save } from "lucide-react"
import { EducationDetail } from "./page"

interface EducationSectionProps {
    educationDetails: EducationDetail[]
    onUpdate: (education: EducationDetail[]) => void
    handlePropSubmit: (prp: string, string: boolean) => void
    loading: boolean
}

export function EducationSection({ educationDetails, onUpdate, handlePropSubmit, loading }: EducationSectionProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [newEducation, setNewEducation] = useState<EducationDetail>({
        level: "",
        degree: "",
        field: "",
        institution: "",
        startDate: "",
        endDate: null,
        location: { city: "", country: "" },
        grade: "",
        certifications: "",
    })

    const educationLevels = [
        "High School",
        "Associate Degree",
        "Bachelor's Degree",
        "Master's Degree",
        "Doctoral Degree",
        "Professional Certificate",
        "Other",
    ]

    const handleAdd = () => {
        if (newEducation.level && newEducation.degree && newEducation.institution) {
            onUpdate([...educationDetails, newEducation])
            setNewEducation({
                level: "",
                degree: "",
                field: "",
                institution: "",
                startDate: "",
                endDate: null,
                location: { city: "", country: "" },
                grade: "",
                certifications: "",
            })
            setIsAdding(false)
        }
    }

    const handleEdit = (index: number) => {
        setEditingIndex(index)
        setNewEducation(educationDetails[index])
    }

    const handleUpdate = () => {
        if (editingIndex !== null) {
            const updated = [...educationDetails ?? []]
            updated[editingIndex] = newEducation
            onUpdate(updated)
            setEditingIndex(null)
            setNewEducation({
                level: "",
                degree: "",
                field: "",
                institution: "",
                startDate: "",
                endDate: null,
                location: { city: "", country: "" },
                grade: "",
                certifications: "",
            })
        }
    }

    const handleDelete = (index: number) => {
        const updated = educationDetails.filter((_, i) => i !== index)
        onUpdate(updated)
    }

    const handleInputChange = (field: keyof EducationDetail, value: any) => {
        setNewEducation((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleLocationChange = (field: "city" | "country", value: string) => {
        setNewEducation((prev) => ({
            ...prev,
            location: {
                ...prev.location,
                [field]: value,
            },
        }))
    }

    return (
        <Card className="border-2 border-muted bg-transparent shadow-sm">
            <CardHeader className="bg-gradient-to-r from-primary/40 to-primary/10 rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <GraduationCap className="h-6 w-6" />
                        <span>Education Details</span>
                    </div>
                    <Button onClick={() => setIsAdding(true)} className="bg-primary hover:bg-yellow-50" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Education
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="md:p-6 p-0 space-y-8">
                {/* Existing Education Items */}
                <div className="space-y-4 mb-6">
                    {educationDetails.map((education, index) => (
                        <div key={index} className="border   rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-semibold ">{education.degree}</h4>
                                    <p className="text-muted-foreground">{education.institution}</p>
                                    <Badge className="bg-primary mt-1">{education.level}</Badge>
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
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>Field: {education.field}</div>
                                <div>
                                    Duration: {education.startDate} - {education.endDate || "Present"}
                                </div>
                                <div>
                                    Location: {education.location.city}, {education.location.country}
                                </div>
                                {education.grade && <div>Grade: {education.grade}</div>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add/Edit Form */}
                {(isAdding || editingIndex !== null) && (
                    <div className="border-2 border-yellow-300 rounded-lg p-4">
                        <h4 className="font-semibold  mb-4">
                            {editingIndex !== null ? "Edit Education" : "Add New Education"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className=" font-medium">Education Level *</Label>
                                <Select value={newEducation.level} onValueChange={(value) => handleInputChange("level", value)}>
                                    <SelectTrigger className=" ">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {educationLevels.map((level) => (
                                            <SelectItem key={level} value={level}>
                                                {level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className=" font-medium">Degree *</Label>
                                <Input
                                    value={newEducation.degree}
                                    onChange={(e) => handleInputChange("degree", e.target.value)}
                                    className=" "
                                    placeholder="e.g., Bachelor of Science"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className=" font-medium">Field of Study</Label>
                                <Input
                                    value={newEducation.field}
                                    onChange={(e) => handleInputChange("field", e.target.value)}
                                    className=" "
                                    placeholder="e.g., Computer Science"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className=" font-medium">Institution *</Label>
                                <Input
                                    value={newEducation.institution}
                                    onChange={(e) => handleInputChange("institution", e.target.value)}
                                    className=" "
                                    placeholder="e.g., University of Example"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className=" font-medium">Start Date</Label>
                                <Input
                                    type="date"
                                    value={newEducation.startDate}
                                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                                    className=" "
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className=" font-medium">End Date</Label>
                                <Input
                                    type="date"
                                    value={newEducation.endDate || ""}
                                    onChange={(e) => handleInputChange("endDate", e.target.value || null)}
                                    className=" "
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className=" font-medium">City</Label>
                                <Input
                                    value={newEducation.location.city}
                                    onChange={(e) => handleLocationChange("city", e.target.value)}
                                    className=" "
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className=" font-medium">Country</Label>
                                <Input
                                    value={newEducation.location.country}
                                    onChange={(e) => handleLocationChange("country", e.target.value)}
                                    className=" "
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className=" font-medium">Grade/GPA</Label>
                                <Input
                                    value={newEducation.grade || ""}
                                    onChange={(e) => handleInputChange("grade", e.target.value)}
                                    className=" "
                                    placeholder="e.g., 3.8/4.0"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className=" font-medium">Certifications</Label>
                                <Textarea
                                    value={newEducation.certifications || ""}
                                    onChange={(e) => handleInputChange("certifications", e.target.value)}
                                    className=" "
                                    placeholder="Any relevant certifications..."
                                    rows={2}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <Button
                                onClick={() => {
                                    setIsAdding(false)
                                    setEditingIndex(null)
                                    setNewEducation({
                                        level: "",
                                        degree: "",
                                        field: "",
                                        institution: "",
                                        startDate: "",
                                        endDate: null,
                                        location: { city: "", country: "" },
                                        grade: "",
                                        certifications: "",
                                    })
                                }}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={editingIndex !== null ? handleUpdate : handleAdd}
                                className="bg-primary hover:bg-primary text-black"
                            >
                                {editingIndex !== null ? "Update" : "Add"} Education
                            </Button>
                        </div>
                    </div>
                )}
                <div className="flex md:justify-end justify-center py-6 ">
                    <Button
                        type="button"
                        onClick={() => handlePropSubmit("education_details", true)}
                        disabled={loading}
                        className="bg-primary hover:bg-secondary   font-semibold px-8 py-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2 md:block hidden" />
                                Update Educational Info
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
