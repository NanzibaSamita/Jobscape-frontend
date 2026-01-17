"use client";

import BlackStyleButton from "@/components/custom-UI/Buttons/BlackStyleButton";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios/axios";
import { loginAction } from "@/lib/cookies";
import { useAppDispatch } from "@/lib/store";
import { loginUser } from "@/lib/store/slices/authSlice";
import { getMaxRoleWeight } from "@/lib/utils";
import { REDIRECT_URLS } from "@/local/redirectDatas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as z from "zod";

const LOGIN_URL = "/api/v1/login";
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid work email address.",
  }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;
export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const router = useRouter();
  const dispatch = useAppDispatch();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLogin = async (data: any, token: string) => {
    const userData = data;
    const roleWeight: number | string | null = getMaxRoleWeight(userData); // Default role weight for new users
    dispatch(loginUser({ user: { ...userData }, token, roleWeight }));
    const roleId =
      userData.roles.find(
        (role: {
          name: string;
          role_weight: string;
          pivot: {
            model_type: string;
            model_id: number;
            role_id: number;
          };
        }) => Number(role.role_weight) === Number(roleWeight)
      )?.pivot.role_id || null;
    await loginAction(
      userData.id,
      userData.user_name,
      token,
      roleId,
      roleWeight
    );
    if (redirectTo && redirectTo !== "/") return router.push(redirectTo);
    const props: string = roleWeight?.toString() || "base";
    if (REDIRECT_URLS[props]) router.push(REDIRECT_URLS[props]);
    else router.push(REDIRECT_URLS["base"]);
  };

  const handelContinue = (data: FormValues) => {
    const rawData = {
      email: data.email,
      password: data.password,
    };
    setLoading(true);
    try {
      axiosInstance
        .post(LOGIN_URL, rawData)
        .then((res) => {
          handleLogin(res?.data?.data?.user, res?.data?.data?.token);
        })
        .catch((err) => {
          if (err?.response?.data?.message) {
            toast.error(err?.response?.data?.message);
          } else {
            console.log("An error occurred while logging in.");
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.error(error);
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  return (
    <>
      <div className="w-full">
        {loading && (
          <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center backdrop-blur-sm z-[2]">
            <Loader className="h-6 w-6 text-slate-400 animate-spin duration-1000" />
          </div>
        )}
        <div className="max-w-sm w-full mx-auto translate-x-0 lg:translate-x-16 px-2 py-6 lg:px-0 lg:py-0 max-h-screen flex flex-col lg:mt-16 mt-4">
          {/* <h1 className={`text-4xl text-black dark:text-primary lg:mb-16 `}>
            WANTED<span className="text-primary">.AI</span>
          </h1> */}

          <div className="lg:mt-24 mt-24">
            <div className="">
              <div className="mb-4">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                  Welcome Back <br /> JBscape!
                </h2>
              </div>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handelContinue)}
                className="space-y-2"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        {/* <div className="relative z-[1]"> */}
                        {/* <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                        <Input
                          placeholder="Enter work email address"
                          // className="pl-3 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          // onChange={(e) => setEmail(e.target.value)}
                          // value={email}
                          {...field}
                        />
                        {/* </div> */}
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
                        <div className="relative z-[1]">
                          {/* <Asterisk className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            // className="pl-3 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            // onChange={(e) => setEmail(e.target.value)}
                            // value={email}
                            {...field}
                          />
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
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              id="rememberMe"
                              checked={field.value || false}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="accent-primary w-4 h-4"
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="rememberMe"
                            className="text-xs font-extralight cursor-pointer"
                          >
                            Remember me
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <button
                      type="button"
                      className="text-xs font-extralight hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      onClick={() => router.push("/forgot-password")}
                      tabIndex={0}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <BlackStyleButton
                    fullWidth
                    disabled={loading}
                    title={
                      loading ? <Loader2 className="animate-spin" /> : "Sign in"
                    }
                  />
                </div>
              </form>
            </Form>
            <p className="text-sm font-light text-center py-2">
              Don&apos;t have an account yet?{" "}
              <span
                className="cursor-pointer text-yellow-600"
                onClick={() => router.push("/signup")}
              >
                Sign up
              </span>
            </p>
          </div>
        </div>
      </div>
      {/* <div
        className={`w-full lg:block hidden bg-[url('/images/form-background.png')]`}
      /> */}
    </>
  );
}
