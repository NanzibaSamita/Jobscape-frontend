import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

function ResetPasswordContent() {
  return (
    <div className="lg:grid lg:grid-cols-2 min-h-screen relative bg-background text-foreground">
      <div className="w-full content-center">
        <div className="max-w-sm w-full mx-auto translate-x-0 lg:translate-x-16 px-2 py-6 lg:px-0 lg:py-0 max-h-screen flex flex-col">
          <div>
            <h1 className="text-4xl">
              WANTED<span className="text-primary">.AI</span>
            </h1>

            <div className="mb-4">
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">Reset Password</h2>
              <p className="text-muted-foreground text-sm">
                Please enter your new password below to reset your account.
              </p>
            </div>

            <div className="w-full max-w-md space-y-6">
              <Card className="shadow-none bg-transparent border-0">
                <CardContent className="p-0">
                  <ResetPasswordForm />
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
