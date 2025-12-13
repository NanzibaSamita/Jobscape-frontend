"use client"

import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
import { File, X, UploadCloud, CheckCircle2, CloudUpload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
    maxSizeMB?: number
    acceptedFileTypes?: string[]
    onFileUploaded?: (file: File | null) => void
    loading?: boolean
}

export default function UploadFile({ loading, maxSizeMB = 5, acceptedFileTypes = [".pdf"], onFileUploaded }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string>("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const maxSizeBytes = maxSizeMB * 1024 * 1024

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (!isDragging) {
            setIsDragging(true)
        }
    }

    const validateFile = (file: File): string | null => {
        // Check file size
        if (file.size > maxSizeBytes) {
            return `File "${file.name}" exceeds the maximum size of ${maxSizeMB}MB`
        }

        // Check file type if acceptedFileTypes is provided
        if (acceptedFileTypes.length > 0) {
            const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`
            if (
                !acceptedFileTypes.some(
                    (type) =>
                        type.toLowerCase() === fileExtension ||
                        type === file.type ||
                        (type.includes("*") && file.type.startsWith(type.replace("*", ""))),
                )
            ) {
                return `File "${file.name}" is not an accepted file type`
            }
        }

        return null
    }

    const processFile = (selectedFile: File) => {
        const validationError = validateFile(selectedFile)

        if (validationError) {
            setError(validationError)
            setTimeout(() => setError(""), 5000)
            return
        }

        setFile(selectedFile)
        setError("")

        if (onFileUploaded) {
            onFileUploaded(selectedFile)
        }
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0])
        }
    }

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0])
        }
    }

    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const removeFile = () => {
        setFile(null)
        setError("")
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        if (onFileUploaded) {
            onFileUploaded(null)
        }
    }



    const acceptedTypesString = acceptedFileTypes.join(", ")

    return (
        <div className="w-full max-w-md mx-auto">

            <div className="border border-gray-400/20 p-4 rounded-md">
                <p className="text-sm font-bold">Upload Resume</p>
                <p className="text-xs text-muted-foreground">Help us get to know you better by sharing your resume.</p>
                <div
                    className={cn(
                        "border border-dashed p-8 bg-slate-300/10 rounded-lg text-center mt-2 cursor-pointer transition-colors",
                        isDragging ? "border-primary bg-primary/5" : "border-gray-300",
                        file && "border-gray-300/50 bg-transparent",
                    )}
                    onDragEnter={(e) => !loading && handleDragEnter(e)}
                    onDragLeave={(e) => !loading && handleDragLeave(e)}
                    onDragOver={(e) => !loading && handleDragOver(e)}
                    onDrop={(e) => !loading && handleDrop(e)}
                    onClick={() => !loading && handleBrowseClick()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => !loading && handleFileInputChange(e)}
                        accept={acceptedFileTypes.join(",")}
                    />

                    {!file && (
                        <div className="flex flex-col items-center justify-center gap-1">
                            <div className="rounded-full bg-white p-3">
                                <CloudUpload className="h-8 w-8 stroke-1 text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-normal text-gray-700">Browse and choose the file you want</h3>
                                <p className="text-sm font-normal text-gray-700">to upload from your computer</p>
                            </div>
                            <p className="text-xs font-thin text-gray-500 text-muted-foreground">
                                Acceptable file types: {acceptedTypesString} ({maxSizeMB}MB max)
                            </p>
                        </div>
                    )}

                    {file && (
                        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-500/10 p-4 rounded-md">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-gray-100 p-2 hidden lg:block rounded-md">
                                        <File className="h-6 w-6 text-gray-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium max-w-[200px] line-clamp-1">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {<CheckCircle2 className="h-5 w-5 text-green-500" />}
                                    <Button disabled={loading} variant="ghost" size="icon" className="h-8 w-8" onClick={removeFile}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <Button disabled={loading} variant="outline" className="w-full" onClick={handleBrowseClick}>
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Choose Different File
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            {error && (
                <div className="mt-4">
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            )}
        </div>
    )
}
