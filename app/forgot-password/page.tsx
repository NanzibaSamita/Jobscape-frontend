import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ForgotPasswordForm } from "./forgot-password-form";

function ForgotPasswordContent() {
  return (
    <div className="lg:grid lg:grid-cols-2 min-h-screen relative bg-background text-foreground">
      <div className="w-full content-center">
        <div className="max-w-sm w-full mx-auto translate-x-0 lg:translate-x-16 px-2 py-6 lg:px-0 lg:py-0 max-h-screen flex flex-col">
          <div>
            <h1 className="text-4xl">
              JB<span className="text-primary">scape</span>
            </h1>

            <div className="mb-4">
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">Forgot Password?</h2>
              <p className="text-muted-foreground text-sm">
                Enter your email address and we’ll send you a link to reset your password.
              </p>
            </div>

            <div className="w-full max-w-md space-y-6">
              <Card className="shadow-none bg-transparent border-0">
                <CardContent className="p-0">
                  <ForgotPasswordForm />
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="font-medium text-primary hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="w-full bg-no-repeat bg-cover lg:block hidden bg-[url('/images/form-background.png')]" />
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
