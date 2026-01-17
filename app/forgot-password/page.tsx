import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="lg:grid lg:grid-cols-2 h-screen relative">
      <div className="w-full content-center">
        <div className="max-w-sm w-full mx-auto translate-x-0 lg:translate-x-16 px-2 py-6 lg:px-0 lg:py-0 max-h-screen flex flex-col">
          <div className="">
            <h1 className="text-5xl leading-none flex items-center">
              {/* Purple JB */}
              <span className="font-extrabold tracking-tight text-[#7C3AED]">
                JB
              </span>

              {/* Black scape */}
              <span className="font tracking-tight text-black">scape</span>
            </h1>

            <div className="mb-4">
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                Forgot Password?
              </h2>
              <p className="text-muted-foreground text-sm">
                {" "}
                No worries! Enter your email address and we&apos;ll send you a
                link to reset your password.
              </p>
            </div>
            <div className="w-full max-w-md space-y-6">
              {/* Main Card */}
              <Card className="shadow-none border-0 bg-transparent">
                <CardContent className="p-0">
                  <ForgotPasswordForm />
                </CardContent>
              </Card>

              {/* Additional Help */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`w-full bg-no-repeat bg-cover lg:block hidden bg-[url('/images/form-background.png')]`}
      />
    </div>
  );
}
