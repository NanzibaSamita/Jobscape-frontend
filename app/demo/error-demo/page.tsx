"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Bug, FileX, Server } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ErrorDemoPage() {
  const router = useRouter()
  const [shouldThrow, setShouldThrow] = useState(false)

  if (shouldThrow) {
    throw new Error("Demo error for testing error boundaries")
  }

  const trigger404 = () => {
    router.push("/non-existent-page")
  }

  const trigger500 = () => {
    router.push("/500")
  }

  const triggerError = () => {
    setShouldThrow(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Error Page Demo</h1>
          <p className="text-muted-foreground">Test different error scenarios and see how they are handled</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileX className="w-5 h-5" />
                404 Error
              </CardTitle>
              <CardDescription>Test the branded 404 page for non-existent routes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={trigger404} variant="outline" className="w-full">
                Trigger 404 Error
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                500 Error
              </CardTitle>
              <CardDescription>Test the branded 500 internal server error page</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={trigger500} variant="outline" className="w-full">
                Trigger 500 Error
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Runtime Error
              </CardTitle>
              <CardDescription>Test error boundary handling for runtime errors</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={triggerError} variant="destructive" className="w-full">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Trigger Runtime Error
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Navigation</CardTitle>
              <CardDescription>Return to the main application</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/")} className="w-full">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Error Handling Features</CardTitle>
            <CardDescription>Overview of the error handling system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <div>
                  <strong>Branded Error Pages:</strong> Consistent design with your application theme
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <div>
                  <strong>Helpful Navigation:</strong> Multiple ways to get back to working parts of the app
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <div>
                  <strong>Error Tracking:</strong> Unique error IDs and timestamps for debugging
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <div>
                  <strong>User-Friendly Messages:</strong> Clear explanations without technical jargon
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <div>
                  <strong>Support Integration:</strong> Easy access to help and contact options
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
