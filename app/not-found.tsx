"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search, ArrowLeft, HelpCircle } from "lucide-react"
import { BrandedErrorLayout } from "@/components/branded-error-layout"

export default function NotFound() {
  return (
    <BrandedErrorLayout>
      <div className="text-center space-y-6">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-8xl md:text-9xl font-bold text-muted-foreground/20 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Page Not Found</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or you entered the
            wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Help Section */}
        <Card className="max-w-md mx-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link href="/dashboard">Visit Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link href="/products">Browse Products</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Suggestion */}
        <div className="text-sm text-muted-foreground">
          <p>
            Looking for something specific?{" "}
            <Link href="/search" className="text-primary hover:underline">
              Try our search
            </Link>
          </p>
        </div>
      </div>
    </BrandedErrorLayout>
  )
}
