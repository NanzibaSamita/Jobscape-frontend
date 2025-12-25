import BlackStyleButton from '@/components/custom-UI/Buttons/BlackStyleButton'
import { axiosInstance } from '@/lib/axios/axios'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

interface userFormData {
    user_first_name: string,
    user_last_name: string,
    password: string,
    email: string,
    company_name: string,
    country_id: string,
    sector_id: string,
    user_mobile: string,
    user_mobile_code: string,
}
export default function VerifyEmail({
    closeModal,
    keyIs,
    onSubmit,
    token,
    data, }: {
        closeModal: (key: string) => void,
        token: string,
        keyIs: string,
        onSubmit: (data: userFormData) => void,
        data: userFormData,
    }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [isLoading, setIsLoading] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const [tokenState, setTokenState] = useState(token)

    // Focus first input when modal opens
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [])

    const handleInputChange = (index: number, value: string) => {
        // Only allow single digit
        if (value.length > 1) return

        const newOtp = [...otp]
        newOtp[index] = value

        setOtp(newOtp)

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text").slice(0, 6)
        const newOtp = [...otp]

        for (let i = 0; i < pastedData.length && i < 6; i++) {
            if (/^\d$/.test(pastedData[i])) {
                newOtp[i] = pastedData[i]
            }
        }

        setOtp(newOtp)

        // Focus the next empty input or last input
        const nextEmptyIndex = newOtp.findIndex((digit) => !digit)
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
        inputRefs.current[focusIndex]?.focus()
    }

    const handleVerify = async () => {
        const otpString = otp.join("")
        if (otpString.length === 6) {
            setIsLoading(true);
            try {
                const res = await axiosInstance.post("/api/v1/email-verify", {
                    email: data?.email,
                    otp: otpString,
                    otp_token: tokenState,
                });

                if (res.status === 200 || res.status === 201) {
                    onSubmit(data);
                } else {
                    console.warn("Unexpected response:", res);
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                console.error("verifyEmail error:", err?.response || err);
                toast.error(err?.response?.data?.message || "An error occurred while verifying email.");
            }
            finally {
                setIsLoading(false);
            }
        } else {
            toast.error("Please enter a valid 6-digit OTP.");
        }
    }

    async function handleResendOTP() {
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        try {
            const res = await axiosInstance.post("/api/v1/send-otp-for-register", {
                email: data?.email,
            });

            if (res.status === 200 || res.status === 201) {
                setTokenState(res.data.data);
            } else {
                console.warn("Unexpected response:", res);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "An error occurred while sending OTP.");
            // Optional: Show error toast here
        }
    }

    const isComplete = otp.every((digit) => digit !== "");
    return (

        <div className="relative bg-background rounded-[2rem] shadow-xl lg:p-8 py-6 px-4 w-full lg:max-w-md max-w-full">
            <div className="lg:space-y-6 space-y-4">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold">Email Verification</h2>
                    <p className="text-gray-600 text-sm text-muted-foreground">Please check your email to see The verification code.</p>

                    <span className="text-black font-medium text-muted-foreground pr-2">{data?.email || "null"}</span>
                    <button onClick={() => closeModal(keyIs)} className="text-muted-foreground hover:text-muted-foreground/40 font-medium transition-colors">
                        Change Email
                    </button>
                </div>

                {/* OTP Input */}
                <div className="flex justify-center lg:gap-3 gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className="lg:w-14 lg:h-14 w-10 h-10 text-center text-xl font-medium border-2 border-primary-foreground/10 focus:border-primary dark:border-muted rounded-xl dark:focus:border-muted-foreground focus:outline-none transition-colors"
                        />
                    ))}
                </div>

                {/* Resend Section */}
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Didnt receive OTP ?</span>
                    <button
                        onClick={handleResendOTP}
                        className="text-muted-foreground hover:text-muted-foreground/40 font-medium transition-colors"
                    >
                        Resend OTP
                    </button>
                </div>

                {/* Verify Button */}
                <BlackStyleButton
                    fullWidth
                    disabled={!isComplete || isLoading}
                    onClick={handleVerify}
                    title={isLoading ? "Verifying..." : "Verify Email"}
                />
            </div>
        </div>
    )
}
