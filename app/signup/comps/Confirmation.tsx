"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface ConfirmationPageProps {
    email: string
}

export default function Confirmation({ email }: ConfirmationPageProps) {
    return (
        <div className="w-full h-full my-auto flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />

                <div>
                    <h2 className="text-3xl font-bold">Account Created!</h2>
                    <p className="text-gray-500 mt-4">
                        Your account has been successfully created with <span className="font-medium">{email}</span>
                    </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                        We have sent a verification email to your inbox. Please verify your email to access all features.
                    </p>
                </div>

                <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => (window.location.href = "/dashboard")}
                >
                    Go to Dashboard
                </Button>
            </div>
        </div>
    )
}
