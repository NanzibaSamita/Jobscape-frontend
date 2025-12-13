"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, CheckCircle, AlertCircle, KeyRound } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateEmail } from "../reset-password/validation"
import { axiosInstance } from "@/lib/axios/axios"
import { AxiosError } from "axios"
import { useRouter } from "next/navigation"

type FormStep = "email" | "otp" | "success"
type FormState = "idle" | "loading" | "error"

interface VerifyOtpResponse {
    success: boolean
    resetToken: string
    message: string
}

const OTP_SEND = "/api/v1/send-reset-password-otp";
const VERIFY_OTP = "/api/v1/verify-reset-password-otp";
const OTP_RESEND = "/api/v1/resend-reset-password-otp";
export function ForgotPasswordForm() {
    const [step, setStep] = useState<FormStep>("email")
    const [formState, setFormState] = useState<FormState>("idle")
    const router = useRouter();

    // Email step states
    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState("")

    // OTP step states
    const [otp, setOtp] = useState("")
    const [otpToken, setOtpToken] = useState("")
    const [otpError, setOtpError] = useState("")
    const [resendCooldown, setResendCooldown] = useState(0)

    // General states
    const [errorMessage, setErrorMessage] = useState("");

    // Email validation
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setEmail(value)
        setEmailError("")
        setErrorMessage("")
        setFormState("idle");
        if (value && !validateEmail(value)) {
            setEmailError("Please enter a valid email address")
        }
    }

    // OTP validation
    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 6) // Only digits, max 6
        setOtp(value)
        setOtpError("")
        setErrorMessage("")
        setFormState("idle")
        if (value && value.length !== 6) {
            setOtpError("OTP must be 6 digits")
        }
    }

    // Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()

        setErrorMessage("")
        setEmailError("")

        if (!email) {
            setEmailError("Email is required")
            return
        }

        if (!validateEmail(email)) {
            setEmailError("Please enter a valid email address")
            return
        }

        setFormState("loading")

        try {
            const response = await axiosInstance.post(OTP_SEND, { email }); // Adjust the endpoint as needed
            // Use axiosInstance (already imported) to send the request and get data directly
            const { data }: { data: string } = response.data;
            console.log(data);
            setOtpToken(data)
            setStep("otp")
            setFormState("idle")
            startResendCooldown()
        } catch (error) {
            setFormState("error");
            setErrorMessage(error instanceof AxiosError ? error?.response?.data?.message : "Failed to send OTP. Please try again.")
        }
    }

    // Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()

        setErrorMessage("")
        setOtpError("")

        if (!otp) {
            setOtpError("OTP is required")
            return
        }

        if (otp.length !== 6) {
            setOtpError("OTP must be 6 digits")
            return
        }

        setFormState("loading")

        try {
            const response = await axiosInstance.post(VERIFY_OTP, {
                email,
                otp,
                otp_token: otpToken,
            });
            const data: VerifyOtpResponse = response.data;
            console.log(data);
            setStep("success");
            setFormState("idle");
        } catch (error) {
            setFormState("error")
            setErrorMessage(error instanceof AxiosError ? error?.response?.data?.message : "Invalid OTP. Please try again.")
        }
    }

    // Resend OTP
    const handleResendOtp = async () => {
        if (resendCooldown > 0) return

        setFormState("loading")
        setErrorMessage("")

        try {
            const response = await axiosInstance.post(OTP_RESEND, { email });
            const { data }: { data: string } = response.data;
            setOtpToken(data);
            setFormState("idle");
            startResendCooldown();
        } catch (error) {
            setFormState("error")
            setErrorMessage(error instanceof Error ? error.message : "Failed to resend OTP. Please try again.")
        }
    }

    // Cooldown timer for resend
    const startResendCooldown = () => {
        setResendCooldown(60)
        const timer = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    // Go back to email step
    const handleBackToEmail = () => {
        setStep("email")
        setOtp("")
        setOtpToken("")
        setErrorMessage("")
        setOtpError("")
        setFormState("idle")
    }

    // Success step - redirect to reset password
    if (step === "success") {
        return (
            <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                        <strong>OTP verified successfully!</strong>
                        <br />
                        You can now reset your password.
                    </AlertDescription>
                </Alert>

                <Button onClick={() => (router.push(`/reset-password?token=${otpToken}&email=${email}&otp=${otp}`))} className="w-full">
                    Continue to Reset Password
                </Button>
            </div>
        )
    }

    // OTP verification step
    if (step === "otp") {
        return (
            <div className="space-y-4">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <KeyRound className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Enter Verification Code</h3>
                    <p className="text-sm text-muted-foreground">
                        We&apos;ve sent a 6-digit code to <strong>{email}</strong>
                    </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {formState === "error" && (
                        <Alert variant="destructive" >
                            <AlertDescription className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {errorMessage}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="otp" className="text-sm font-medium">
                            Verification Code
                        </Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="000000"
                            value={otp}
                            onChange={handleOtpChange}
                            className={`text-center text-2xl font-mono tracking-widest ${otpError ? "border-red-500 focus-visible:ring-red-500" : ""
                                }`}
                            disabled={formState === "loading"}
                            maxLength={6}
                            autoComplete="one-time-code"
                            autoFocus
                        />
                        {otpError && <p className="text-sm text-red-600 dark:text-red-400">{otpError}</p>}
                    </div>

                    <Button type="submit" className="w-full" disabled={formState === "loading" || !!otpError || otp.length !== 6}>
                        {formState === "loading" ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify Code"
                        )}
                    </Button>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBackToEmail}
                            className="flex-1 bg-transparent"
                            disabled={formState === "loading"}
                        >
                            Change Email
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleResendOtp}
                            disabled={formState === "loading" || resendCooldown > 0}
                            className="flex-1"
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                        </Button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                        The code will expire in 10 minutes. Check your spam folder if you don&apos;t see it.
                    </p>
                </div>
            </div>
        )
    }

    // Email input step
    return (
        <form onSubmit={handleSendOtp} className="space-y-4">
            {formState === "error" && (
                <Alert variant="destructive" className="">
                    <AlertDescription className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {errorMessage}
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-[14px] h-4 w-4 text-muted-foreground" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={handleEmailChange}
                        className={`pl-10 ${emailError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        disabled={formState === "loading"}
                        autoComplete="email"
                        autoFocus
                    />
                </div>
                {emailError && <p className="text-sm text-red-600 dark:text-red-400">{emailError}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={formState === "loading" || !!emailError || !email}>
                {formState === "loading" ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Code...
                    </>
                ) : (
                    <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Verification Code
                    </>
                )}
            </Button>

            <div className="text-center">
                <p className="text-xs text-muted-foreground">
                    We&apos;ll send you a 6-digit verification code to reset your password.
                </p>
            </div>
        </form>
    )
}
