"use client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, EyeOff, Eye, Globe, Slack } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { api, axiosInstance } from "@/lib/axios/axios"
import uniqueID, { getMaxRoleWeight } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { countryCodes } from "@/local/countries"
import BlackStyleButton from "@/components/custom-UI/Buttons/BlackStyleButton"
import { toast } from "react-toastify"
import { useAppDispatch } from "@/lib/store"
import { loginUser } from "@/lib/store/slices/authSlice"
import { loginAction } from "@/lib/cookies"
import { REDIRECT_URLS } from "@/local/redirectDatas"
import { useRouter } from "next/navigation"
import VerifyEmail from "./VerifyEmail"
import { useUI } from "@/contexts/ui-context"

const CREATE_USER_URL = "/api/v1/user-store";
const COMPANY_API_ENDPOINT = "/api/v1/companies";
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
        email: z.string().email({
            message: "Please enter a valid email address.",
        }),
        company_name: z
            .string()
            .min(2, { message: "Company name must be at least 2 characters." })
            .max(100, { message: "Company name must not exceed 100 characters." }),
        country_id: z
            .string()
            .min(1, { message: "Please select a country." }),
        sector_id: z
            .string()
            .min(1, { message: "Please select a sector." }),
        user_mobile: z
            .string()
            .min(10, { message: "Phone number must be at least 10 digits." })
            .max(15, { message: "Phone number must not exceed 15 digits." }),
        user_mobile_code: z
            .string()
            .min(1, { message: "Please select a country code." }),
    })

type UserInfoValues = z.infer<typeof userInfoSchema>
interface FormData {
    name: string
    country_id: string
    sector_id: string
    user_id?: number | string
}
export function Inputs({ countries, sectors, isLoading, setIsLoading }: {
    countries: {
        id: string
        name: string
    }[],
    sectors: {
        id: string
        name: string
    }[],
    isLoading: boolean,
    setIsLoading: (loading: boolean) => void
}) {
    const [showPassword, setShowPassword] = useState(false)
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { openModal, closeModal } = useUI();


    function createCompany(data: FormData) {
        api
            .post(COMPANY_API_ENDPOINT, data)
            .then(() => {
                console.log("Company created successfully!");
            })
            .catch(() => {
                console.log("An error occurred while creating the company.");
            })
            .finally(() => {
            });
    }


    async function sendOtpForRegister(
        email: string,
        onSuccess: (token: string) => void
    ) {
        try {
            const res = await axiosInstance.post("/api/v1/send-otp-for-register", {
                email,
            });

            if (res.status === 200 || res.status === 201) {
                onSuccess(res.data.data);
            } else {
                console.warn("Unexpected response:", res);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "An error occurred while sending OTP.");
            // Optional: Show error toast here
        }
    };

    function onSubmit(data: UserInfoValues) {
        const rawData = {
            email: data.email,
            user_first_name: data.user_first_name,
            user_last_name: data.user_last_name,
            password: data.password,
            user_name: `${data.user_first_name}-${uniqueID()}`,
            user_mobile: data.user_mobile,
            user_mobile_code: data.user_mobile_code.replace("-", ""),
        }
        const companyData = {
            company_name: data.company_name,
            country_id: data.country_id,
            sector_id: data.sector_id,
        }
        setIsLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const params: any = {};
            params["recruiter"] = true;
            const query = new URLSearchParams(params).toString();
            axiosInstance.post(`${CREATE_USER_URL}${query ? "?" + query : ""}`, rawData).then(async (res) => {
                const userData = res?.data?.data?.user;
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
                const props: string = roleWeight?.toString() || "base";
                createCompany({ name: companyData.company_name, country_id: companyData.country_id, sector_id: companyData.sector_id, user_id: userData.id });
                closeModal("openEmailVerifyModal");
                router.push(REDIRECT_URLS[props]);
            })
                .catch((err) => {
                    if (err?.response?.data?.message) {
                        toast.error(err?.response?.data?.message);
                    } else {
                        toast.error("An error occurred while creating the user account.");
                    }
                    console.log(err);
                })
                .finally(() => {
                    setIsLoading(false)
                });
        } catch (error) {
            console.error("File upload failed:", error);
        } finally {
        }
    }

    const form = useForm<UserInfoValues>({
        resolver: zodResolver(userInfoSchema),
        defaultValues: {
            user_mobile_code: "+880",
            email: "",
            user_first_name: "",
            user_last_name: "",
            password: "",
            // confirmPassword: "",
            company_name: "",
            country_id: "",
            sector_id: "",
            user_mobile: "",
        },
    })


    function verifyEmail(data: UserInfoValues) {
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
                sendOtpForRegister(data?.email, (token: string) => openModal("openEmailVerifyModal", <VerifyEmail token={token} closeModal={closeModal} keyIs={"openEmailVerifyModal"} onSubmit={onSubmit} data={data} />));
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    const selectedCountry = countryCodes.find((c) => c.code === form.watch("user_mobile_code"))
    return (
        <div className="flex-grow overflow-scroll">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(verifyEmail)} className="space-y-1 m-1">

                    <div className="flex justify-between items-center gap-4 lg:flex-nowrap flex-wrap">
                        <FormField
                            control={form.control}
                            name="user_first_name"
                            render={({ field }) => (
                                <FormItem className="w-full">
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
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your last name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="company_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your company name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="country_id"
                        rules={{ required: "Please select a country" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Location</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <div className="flex items-center justify-start gap-2 min-w-0 flex-1">
                                                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <div className="truncate">
                                                    <SelectValue placeholder="Select sector" />
                                                </div>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries.map((country) => (
                                                <SelectItem key={`${country.id}-country`} value={country.id.toString()}>
                                                    {country.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sector_id"
                        rules={{ required: "Please select a sector" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Sector</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <div className="flex items-center justify-start gap-2 min-w-0 flex-1">
                                                <Slack className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <div className="truncate">
                                                    <SelectValue placeholder="Select sector" />
                                                </div>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sectors.map((sector) => (
                                                <SelectItem key={`${sector.id}-sector`} value={sector.id.toString()}>
                                                    {sector.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Work e-mail</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="user_mobile_code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-600">Phone number</FormLabel>
                                <FormControl>
                                    <div className="flex items-center border border-input rounded-lg bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
                                        {/* Country Code Section */}
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="border-0 shadow-none focus:ring-0 w-auto px-3 rounded-r-none">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{selectedCountry?.flag}</span>
                                                    <span className="font-medium">{field.value.replace("-", "")}</span>
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countryCodes.map((country) => (
                                                    <SelectItem key={`${country.code}-${country.name}`} value={country.code}>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg">{country.flag}</span>
                                                            <span className="font-medium">{country.code}</span>
                                                            <span className="text-sm text-muted-foreground">{country.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {/* Separator */}
                                        <div className="w-px h-6 bg-border"></div>

                                        {/* Phone Number Input */}
                                        <FormField
                                            control={form.control}
                                            name="user_mobile"
                                            render={({ field: phoneField }) => (
                                                <FormControl>
                                                    <Input
                                                        placeholder="01856459865"
                                                        value={phoneField.value}
                                                        onChange={(e) => {
                                                            const digits = e.target.value.replace(/\D/g, "")
                                                            phoneField.onChange(digits)
                                                        }}
                                                        className="border-0 shadow-none focus-visible:ring-0 flex-1 px-3 rounded-l-none"
                                                    />
                                                </FormControl>
                                            )}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                                {/* Add phone number specific error message */}
                                <FormField control={form.control} name="user_mobile" render={() => <FormMessage />} />
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
                    <div className="pt-3">
                        <BlackStyleButton fullWidth disabled={isLoading} title={isLoading ? <Loader2 className="animate-spin" /> : "Creating Account"} />
                    </div>
                </form>
            </Form>
        </div>
    )
}