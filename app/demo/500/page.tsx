"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, RefreshCw, AlertTriangle, Mail } from "lucide-react"
import { BrandedErrorLayout } from "@/components/branded-error-layout"

export default function InternalServerError() {
  return (
    <BrandedErrorLayout>
      <div className="text-center space-y-6">
        {/* 500 Illustration */}
        <div className="relative">
          <div className="text-8xl md:text-9xl font-bold text-muted-foreground/20 select-none">500</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-destructive" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Internal Server Error</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Oops! Something went wrong on our end. Our team has been notified and is working to fix this issue.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button size="lg" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Status Information */}
        <Card className="max-w-md mx-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">What happened?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-left">
            <div className="space-y-2">
              <p className="text-muted-foreground">• Our servers encountered an unexpected error</p>
              <p className="text-muted-foreground">• The issue has been automatically reported to our team</p>
              <p className="text-muted-foreground">• We are working to resolve this as quickly as possible</p>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Error ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground">Time: {new Date().toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="max-w-md mx-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Still Need Help?
            </CardTitle>
            <CardDescription>If this problem persists, please contact our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </BrandedErrorLayout>
  )
}
