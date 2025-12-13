"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

import {
    Briefcase,
    Code,
    FileText,
    Download,
    ExternalLink,
    Wrench,
    Package,
} from "lucide-react"
import { CVData } from "./ApplicantModal"





interface BlindCVProps {
    cvData?: CVData | null
}

function BlindCV({ cvData }: BlindCVProps) {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasValidArray = (arr?: any[]) => {
        return Array.isArray(arr) && arr.length > 0
    }

    const hasValidString = (str?: string) => {
        return typeof str === "string" && str.trim().length > 0
    }

    if (!cvData) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
                <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No CV found for this candidate</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <Card>
                <CardHeader className="text-center px-4 sm:px-6">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-600">Anonymous Candidate</CardTitle>
                </CardHeader>
            </Card>

            {/* Professional Roles */}
            {hasValidArray(cvData.roles) && (
                <Card>
                    <CardHeader className="px-4 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                            Professional Roles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                        {cvData.roles?.map((role, index) => (
                            <div key={index} className="space-y-3">
                                {hasValidString(role.title) && (
                                    <h3 className="font-semibold text-sm sm:text-base text-primary">{role.title}</h3>
                                )}
                                {hasValidArray(role.achievements) && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-muted-foreground">Key Achievements:</h4>
                                        <ul className="list-disc list-inside text-xs sm:text-sm text-muted-foreground space-y-1 ml-2">
                                            {role.achievements?.map((achievement, achIndex) => (
                                                <li key={achIndex} className="leading-relaxed">
                                                    {achievement}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {index < (cvData.roles?.length || 0) - 1 && <Separator className="mt-4" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Skills */}
            {cvData.skills && (hasValidArray(cvData.skills.general) || hasValidArray(cvData.skills.technical)) && (
                <Card>
                    <CardHeader className="px-4 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Code className="h-4 w-4 sm:h-5 sm:w-5" />
                            Skills & Expertise
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 sm:px-6">
                        {hasValidArray(cvData.skills?.technical) && (
                            <div>
                                <h3 className="font-medium mb-3 text-sm sm:text-base">Technical Skills</h3>
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                    {cvData.skills?.technical?.map((skill, index) => (
                                        <Badge key={index} variant="default" className="text-xs">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {hasValidArray(cvData.skills?.general) && (
                            <div>
                                <h3 className="font-medium mb-3 text-sm sm:text-base">General Skills</h3>
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                    {cvData.skills?.general?.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tools */}
            {hasValidArray(cvData.tools) && (
                <Card>
                    <CardHeader className="px-4 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
                            Development Tools
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                            {cvData.tools?.map((tool, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {tool}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Products */}
            {hasValidArray(cvData.products) && (
                <Card>
                    <CardHeader className="px-4 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                            Products & Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                            {cvData.products?.map((product, index) => {
                                const productName = typeof product === "string" ? product : product?.name || "Unnamed Product";
                                if (!hasValidString(productName)) return null;
                                return (
                                    <div
                                        key={index}
                                        className="p-3 bg-muted/50 rounded-lg border border-border/50 hover:bg-muted/70 transition-colors"
                                    >
                                        <p className="text-xs sm:text-sm font-medium text-foreground">{productName}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Summary Stats */}
            <Card>
                <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl">Profile Summary</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-primary">{cvData.roles?.length || 0}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Professional Roles</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-primary">
                                {(cvData.skills?.technical?.length || 0) + (cvData.skills?.general?.length || 0)}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Total Skills</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-primary">{cvData.tools?.length || 0}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Development Tools</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-primary">{cvData.products?.length || 0}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Products Built</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function PDFViewer({ cv_pdf_url }: { cv_pdf_url: string }) {

    const handleDownload = () => {
        if (cv_pdf_url) {
            const link = document.createElement("a")
            link.href = cv_pdf_url
            link.download = "cv.pdf"
            link.target = "_blank"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }



    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        PDF CV Viewer
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">


                    {cv_pdf_url && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">PDF loaded successfully</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleDownload}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => window.open(cv_pdf_url, "_blank")}>
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Open in New Tab
                                    </Button>
                                </div>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <iframe src={cv_pdf_url} className="w-full h-[600px] sm:h-[800px]" title="CV PDF" />
                            </div>
                        </div>
                    )}

                    {!cv_pdf_url && (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No CV found for this candidate</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function BlindCVTabs({ cvData, cv_pdf_url }: { cvData?: CVData | null, cv_pdf_url: string }) {
    return (
        <div className="min-h-screen bg-dashboard py-4 sm:py-4 my-4 rounded-lg">
            <div className="text-center mb-3">
                <h1 className="text-xl font-bold">Updated CV</h1>
            </div>
            <div className="container mx-auto px-4 sm:px-6">
                <Tabs defaultValue="blind" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 gap-2 py-0 px-0">
                        <TabsTrigger value="blind" className="text-sm sm:text-base">
                            Blind CV
                        </TabsTrigger>
                        <TabsTrigger value="pdf" className="text-sm sm:text-base">
                            PDF View
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="blind" className="mt-0">
                        <BlindCV cvData={cvData} />
                    </TabsContent>

                    <TabsContent value="pdf" className="mt-0">
                        <PDFViewer cv_pdf_url={cv_pdf_url} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
