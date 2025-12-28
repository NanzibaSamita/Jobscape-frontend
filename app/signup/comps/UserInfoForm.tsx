"use client"

import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Eye, EyeOff, Loader } from "lucide-react";
import { axiosInstance } from "@/lib/axios/axios"
import uniqueID, { getMaxRoleWeight, splitFullName } from "@/lib/utils"
import BlackStyleButton from "@/components/custom-UI/Buttons/BlackStyleButton"
import { toast } from "react-toastify"
import { loginUser } from "@/lib/store/slices/authSlice"
import { loginAction } from "@/lib/cookies"
// import { REDIRECT_URLS } from "@/local/redirectDatas"
import { useAppDispatch } from "@/lib/store"
import { useRouter } from "next/navigation"
const CREATE_USER_URL = "/api/v1/user-store";
// Form schema with validation
const userInfoSchema = z
    .object({
        user_first_name: z
            .string()
            .min(2, { message: "First name must be at least 2 characters." })
            .max(50, { message: "First name must not exceed 50 characters." }),
        user_last_name: z
            .string()
            .min(2, { message: "Last name must be at least 2 characters." })
            .max(50, { message: "Last name must not exceed 50 characters." }),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters." })
            .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
            .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
            .regex(/[0-9]/, { message: "Password must contain at least one number." })
            .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
        confirmPassword: z.string(),
        email: z.string().email({
            message: "Please enter a valid email address.",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    })

type UserInfoValues = z.infer<typeof userInfoSchema>

interface UserInfoFormProps {
    email: string
    onComplete: () => void
    editableEmail?: boolean
    recruiter?: boolean
    defaultValues?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storeCvJSON: (data: { [key: string]: any }, id: string, email: string) => void,
    cvData: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any,
    } | null
}

export default function UserInfoForm({ email: rawEmail, onComplete, defaultValues, editableEmail = false, recruiter = false, storeCvJSON, cvData }: UserInfoFormProps) {
    const [email, setEmail] = useState<string>(rawEmail);
    const [isLoading, setIsLoading] = useState(false);
    const [cvStoreLoading, setCvStoreLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [verifyEmail, setVerifyEmail] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [tokenState, setTokenState] = useState("");
    const [formData, setFormData] = useState<UserInfoValues | null>(null);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [otpLoading, setOtpLoading] = useState(false);

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const form = useForm<UserInfoValues>({
        resolver: zodResolver(userInfoSchema),
        defaultValues: {
            email: !editableEmail ? email : defaultValues?.email || "",
            user_first_name: defaultValues?.name ? splitFullName(defaultValues?.name)?.firstName : "",
            user_last_name: defaultValues?.name ? splitFullName(defaultValues?.name)?.lastName : "",
            password: "",
            confirmPassword: "",
        },
    })
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
                    email: email,
                    otp: otpString,
                    otp_token: tokenState,
                });

                if (res.status === 200 || res.status === 201) {
                    if (formData) {
                        handelCreate(formData);
                    }
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
                email: email,
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

    function handelCreate(data: UserInfoValues) {
        const rawData = {
            email: data.email,
            user_first_name: data.user_first_name,
            user_last_name: data.user_last_name,
            password: data.password,
            user_name: `${data.user_first_name}-${uniqueID()}`,
        }
        setIsLoading(true);
        setCvStoreLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const params: any = {};
            if (recruiter) {
                params["recruiter"] = recruiter;
            } else {
                params["job_seeker"] = true;
            }
            const query = new URLSearchParams(params).toString();
            axiosInstance.post(`${CREATE_USER_URL}${query ? "?" + query : ""}`, rawData).then(async (res) => {
                const userData = res?.data?.data?.user;
                if (cvData && userData) {
                    const cvDataRaw = JSON.parse(JSON.stringify(cvData));
                    delete cvDataRaw.specificData;
                    await storeCvJSON(cvDataRaw, userData.id, data.email);
                }
                const roleWeight: number | string | null = getMaxRoleWeight(userData); // Default role weight for new users
                dispatch(loginUser({ user: { ...userData }, token: res?.data?.data?.token, roleWeight }));
                const roleId = userData.roles.find((role: {
                    name: string,
                    role_weight: string,
                    pivot: {
                        model_type: string,
                        model_id: number,
                        role_id: number
                    }
                }) => Number(role.role_weight) === Number(roleWeight))?.pivot.role_id || null;
                await loginAction(userData.id, userData.user_name, res?.data?.data?.token, roleId, roleWeight);
                // const props: string = roleWeight?.toString() || "base";
                router.push("/profile-update");
                onComplete()
            })
                .catch((err) => {
                    console.log(err?.response);
                    if (err?.response?.data?.message) {
                        console.log(err?.response?.data?.message);
                    } else {
                        console.log("An error occurred while creating the user account.");
                    }
                    console.log(err);
                })
                .finally(() => {
                    setIsLoading(false)
                    setCvStoreLoading(false);
                });
        } catch (error) {
            console.error("File upload failed:", error);
        } finally {
        }
    }

    async function sendOtpForRegister(
        email: string,
    ) {
        setOtpLoading(true);
        try {
            const res = await axiosInstance.post("/api/v1/send-otp-for-register", {
                email,
            });

            if (res.status === 200 || res.status === 201) {
                setVerifyEmail(true);
                setTokenState(res.data.data);
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            } else {
                console.warn("Unexpected response:", res);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "An error occurred while sending OTP.");
            // Optional: Show error toast here
        }
        finally {
            setOtpLoading(false)
        }
    };

    function onSubmit(data: UserInfoValues) {
        setEmail(data.email);
        setFormData(data);
        setIsLoading(true);
        axiosInstance
            .get("/api/v1/check-email".concat(`?email=${data.email}`))
            .then(() => {
                form.setError("email", {
                    type: "email",
                    message: "This email already exists. Please use a different email.",
                });
            })
            .catch(() => {
                sendOtpForRegister(data.email)
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    const isComplete = otp.every((digit) => digit !== "");
    return (
        <>
            {
                verifyEmail ? <>
                    <div className="relative w-full max-w-full">
                        <div className="lg:space-y-6 space-y-4">
                            {/* Header */}
                            <div className="text-center">
                                <h2 className="text-3xl font-bold">Email Verification</h2>
                                <p className="text-gray-600 text-sm text-muted-foreground">{`Please check your email (including Spam/Junk folder) for the verification code.`}</p>

                                <span className="text-black font-medium text-muted-foreground pr-2">{email || "null"}</span>
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
                                disabled={!isComplete || isLoading || cvStoreLoading}
                                onClick={handleVerify}
                                title={(isLoading || cvStoreLoading) ? "Verifying..." : "Verify Email"}
                            />
                        </div>
                    </div>
                </> : <Form {...form}>
                    {(isLoading || otpLoading) && <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center backdrop-blur-sm z-[2]">
                        <Loader className="h-6 w-6 text-slate-400 animate-spin duration-1000" />
                    </div>}
                    {!editableEmail && <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <p className="text-sm text-blue-700">
                            Signing up with: <span className="font-medium">{email}</span>
                        </p>
                    </div>}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 m-1">
                        {
                            editableEmail && (<FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />)
                        }
                        <FormField
                            control={form.control}
                            name="user_first_name"
                            defaultValue={cvData?.user_first_name || ""}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your first name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="user_last_name"
                            defaultValue={cvData?.user_last_name || ""}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your last name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showPassword ? "text" : "password"} placeholder="Create a password" {...field} />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm your password"
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <BlackStyleButton
                            fullWidth
                            disabled={isLoading || otpLoading}
                            title={(isLoading || otpLoading) ? <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Account
                            </> : "Create Account"}
                        />
                    </form>
                </Form>
            }
        </>

    )
}
