"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Settings, Plus, Trash2, Edit, Loader2, Save } from "lucide-react"
import { Certificate, ProfessionalDetails, Project } from "./page"

interface ProfessionalSectionProps {
    professionalDetails: ProfessionalDetails
    onUpdate: (professional: ProfessionalDetails) => void
    handlePropSubmit: (prp: string, string: boolean) => void
    loading: boolean
}

export function ProfessionalSection({ professionalDetails, onUpdate, handlePropSubmit, loading }: ProfessionalSectionProps) {
    console.log(professionalDetails)
    const [isAddingProject, setIsAddingProject] = useState(false)
    const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null)
    const [newProject, setNewProject] = useState<Project>({
        name: "",
        role: "",
        field: "",
        description: null,
        duration: "",
    })
    const [newGeneralSkill, setNewGeneralSkill] = useState("")
    const [newTechnicalSkill, setNewTechnicalSkill] = useState("")
    const [newCertification, setNewCertification] = useState<Certificate>({
        name: "",
        authority: null,
        dateIssued: null,
        credentialId: null,
    })

    const handleProjectAdd = () => {
        if (newProject.name && newProject.role) {
            onUpdate({
                ...professionalDetails,
                projects: [...professionalDetails?.projects ?? [], newProject],
            })
            resetProjectForm()
            setIsAddingProject(false)
        }
    }

    const handleProjectEdit = (index: number) => {
        setEditingProjectIndex(index)
        setNewProject(professionalDetails?.projects?.[index])
    }

    const handleProjectUpdate = () => {
        if (editingProjectIndex !== null) {
            const updatedProjects = [...professionalDetails?.projects ?? []]
            updatedProjects[editingProjectIndex] = newProject
            onUpdate({
                ...professionalDetails,
                projects: updatedProjects,
            })
            setEditingProjectIndex(null)
            resetProjectForm()
        }
    }

    const handleProjectDelete = (index: number) => {
        const updatedProjects = professionalDetails?.projects?.filter((_, i) => i !== index)
        onUpdate({
            ...professionalDetails,
            projects: updatedProjects ?? [],
        })
    }

    const resetProjectForm = () => {
        setNewProject({
            name: "",
            role: "",
            field: "",
            description: null,
            duration: "",
        })
    }

    const addGeneralSkill = () => {
        if (newGeneralSkill.trim() && !professionalDetails?.skills?.general?.includes(newGeneralSkill?.trim())) {
            onUpdate({
                ...professionalDetails,
                skills: {
                    ...professionalDetails?.skills,
                    general: [...professionalDetails?.skills?.general ?? [], newGeneralSkill?.trim()],
                },
            })
            setNewGeneralSkill("")
        }
    }

    const removeGeneralSkill = (skillToRemove: string) => {
        onUpdate({
            ...professionalDetails,
            skills: {
                ...professionalDetails?.skills,
                general: professionalDetails?.skills?.general?.filter((skill) => skill !== skillToRemove) ?? [],
            },
        })
    }

    const addTechnicalSkill = () => {
        if (newTechnicalSkill.trim() && !professionalDetails?.skills?.technical?.includes(newTechnicalSkill.trim())) {
            onUpdate({
                ...professionalDetails,
                skills: {
                    ...professionalDetails?.skills,
                    technical: [...professionalDetails?.skills?.technical ?? [], newTechnicalSkill.trim()],
                },
            })
            setNewTechnicalSkill("")
        }
    }

    const removeTechnicalSkill = (skillToRemove: string) => {
        onUpdate({
            ...professionalDetails,
            skills: {
                ...professionalDetails?.skills,
                technical: professionalDetails?.skills?.technical?.filter((skill) => skill !== skillToRemove) ?? [],
            },
        })
    }

    const addCertification = () => {
        if (newCertification.name.trim() && !professionalDetails?.certifications?.includes(newCertification.name.trim())) {
            onUpdate({
                ...professionalDetails,
                certifications: [...professionalDetails?.certifications ?? [], newCertification],
            })
            setNewCertification({
                name: "",
                authority: null,
                dateIssued: null,
                credentialId: null,
            })
        }
    }

    const removeCertification = (certToRemove: string) => {
        onUpdate({
            ...professionalDetails,
            certifications: professionalDetails?.certifications?.filter((cert) => typeof cert === "string" ? cert !== certToRemove : cert.name !== certToRemove) ?? [],
        })
    }

    return (
        <Card className="border-2 border-muted bg-transparent shadow-sm">
            <CardHeader className="bg-gradient-to-r from-primary/40 to-primary/10 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-6 w-6" />
                    <span>Professional Details</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="md:p-6 p-0 space-y-8">
                {/* Skills Section */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold   border-b border-yellow-200 pb-2">Skills</h3>

                    {/* General Skills */}
                    <div className="space-y-3">
                        <Label className="  font-medium">General Skills</Label>
                        <div className="flex space-x-2">
                            <Input
                                value={newGeneralSkill}
                                onChange={(e) => setNewGeneralSkill(e.target.value)}
                                placeholder="Add a general skill..."
                                className="border-yellow-200 focus:border-yellow-500"
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addGeneralSkill())}
                            />
                            <Button onClick={addGeneralSkill} className="bg-primary hover:bg-yellow-600  ">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {professionalDetails?.skills?.general?.map((skill) => (
                                <Badge key={skill} className="bg-blue-100 text-blue-800 border border-blue-300">
                                    {skill}
                                    <button type="button" onClick={() => removeGeneralSkill(skill)} className="ml-2 hover:text-red-600">
                                        ×
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Technical Skills */}
                    <div className="space-y-3">
                        <Label className="  font-medium">Technical Skills</Label>
                        <div className="flex space-x-2">
                            <Input
                                value={newTechnicalSkill}
                                onChange={(e) => setNewTechnicalSkill(e.target.value)}
                                placeholder="Add a technical skill..."
                                className="border-yellow-200 focus:border-yellow-500"
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTechnicalSkill())}
                            />
                            <Button onClick={addTechnicalSkill} className="bg-primary hover:bg-yellow-600  ">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {professionalDetails?.skills?.technical?.map((skill) => (
                                <Badge key={skill} className="bg-green-100 text-green-800 border border-green-300">
                                    {skill}
                                    <button type="button" onClick={() => removeTechnicalSkill(skill)} className="ml-2 hover:text-red-600">
                                        ×
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Certifications Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold   border-b border-yellow-200 pb-2">Certifications</h3>
                    <div className="flex flex-wrap gap-3">
                        <Input
                            value={newCertification.name}
                            onChange={(e) => setNewCertification((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Add a certification..."
                            className="border-yellow-200 focus:border-yellow-500"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                        />
                        <div className="flex  justify-between w-full gap-4 items-center flex-wrap">
                            <Input
                                value={newCertification.authority || ""}
                                onChange={(e) => setNewCertification((prev) => ({ ...prev, authority: e.target.value }))}
                                placeholder="Authority (optional)"
                                className="border-yellow-200 focus:border-yellow-500 flex-1 basis-auto md:basis-0"
                            />
                            <Input
                                value={newCertification.dateIssued || ""}
                                onChange={(e) => setNewCertification((prev) => ({ ...prev, dateIssued: e.target.value }))}
                                placeholder="Date Issued (YYYY-MM)"
                                className="border-yellow-200 focus:border-yellow-500 flex-1 basis-auto md:basis-0"
                            />
                            <Input
                                value={newCertification.credentialId || ""}
                                onChange={(e) => setNewCertification((prev) => ({ ...prev, credentialId: e.target.value }))}
                                placeholder="Authority (optional)"
                                className="border-yellow-200 focus:border-yellow-500 flex-1 basis-auto md:basis-0"
                            />
                            <Button onClick={addCertification} className="bg-primary hover:bg-yellow-600  ">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {professionalDetails?.certifications?.map((cert) => {
                            const cartName = typeof cert === "string" ? cert : cert.name;
                            if (!cartName) return null; // Skip if certification name is empty
                            return (
                                <Badge key={cartName} className="bg-purple-100 text-purple-800 border border-purple-300">
                                    {cartName}
                                    <button type="button" onClick={() => removeCertification(cartName)} className="ml-2 hover:text-red-600">
                                        ×
                                    </button>
                                </Badge>
                            )
                        })}
                    </div>
                </div>

                {/* Projects Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold   border-b border-yellow-200 pb-2">Projects</h3>
                        <Button
                            onClick={() => setIsAddingProject(true)}
                            className="bg-primary hover:bg-yellow-600  "
                            size="sm"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Project
                        </Button>
                    </div>

                    {/* Existing Projects */}
                    <div className="space-y-4">
                        {professionalDetails?.projects?.map((project, index) => (
                            <div key={index} className="border border-yellow-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold  ">{project.name}</h4>
                                        <p className="text-muted-foreground">{project.role}</p>
                                        <Badge className="bg-yellow-200 text-yellow-800 mt-1">{project.field}</Badge>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button onClick={() => handleProjectEdit(index)} size="sm" variant="outline">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={() => handleProjectDelete(index)} size="sm" variant="destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground mb-2">Duration: {project.duration}</div>
                                {project.description && <p className="text-muted-foreground">{project.description}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Add/Edit Project Form */}
                    {(isAddingProject || editingProjectIndex !== null) && (
                        <div className="border-2 border-yellow-300 rounded-lg p-4">
                            <h4 className="font-semibold   mb-4">
                                {editingProjectIndex !== null ? "Edit Project" : "Add New Project"}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="  font-medium">Project Name *</Label>
                                    <Input
                                        value={newProject.name}
                                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                        className="border-yellow-200"
                                        placeholder="e.g., E-commerce Website"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="  font-medium">Your Role *</Label>
                                    <Input
                                        value={newProject.role}
                                        onChange={(e) => setNewProject({ ...newProject, role: e.target.value })}
                                        className="border-yellow-200"
                                        placeholder="e.g., Lead Developer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="  font-medium">Field</Label>
                                    <Input
                                        value={newProject.field}
                                        onChange={(e) => setNewProject({ ...newProject, field: e.target.value })}
                                        className="border-yellow-200"
                                        placeholder="e.g., Web Development"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="  font-medium">Duration</Label>
                                    <Input
                                        value={newProject.duration}
                                        onChange={(e) => setNewProject({ ...newProject, duration: e.target.value })}
                                        className="border-yellow-200"
                                        placeholder="e.g., 3 months"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="  font-medium">Description</Label>
                                    <Textarea
                                        value={newProject.description || ""}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value || null })}
                                        className="border-yellow-200"
                                        placeholder="Describe the project..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <Button
                                    onClick={() => {
                                        setIsAddingProject(false)
                                        setEditingProjectIndex(null)
                                        resetProjectForm()
                                    }}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={editingProjectIndex !== null ? handleProjectUpdate : handleProjectAdd}
                                    className="bg-primary hover:bg-yellow-600  "
                                >
                                    {editingProjectIndex !== null ? "Update" : "Add"} Project
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex md:justify-end justify-center py-6">
                    <Button
                        type="button"
                        onClick={() => handlePropSubmit("professional_details", true)}
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
                                <Save className="h-4 w-4 mr-2 hidden md:block" />
                                Update professional details
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
