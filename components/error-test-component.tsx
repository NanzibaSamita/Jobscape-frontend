"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Bug, Wifi, WifiOff } from "lucide-react"
import { AsyncErrorBoundary } from "./async-error-boundary"
import { AnimatedNetworkError } from "./animations/animated-network-error"

export function ErrorTestComponent() {
  const [shouldThrow, setShouldThrow] = useState(false)
  const [showNetworkError, setShowNetworkError] = useState(false)

  if (shouldThrow) {
    throw new Error("This is a test error thrown by ErrorTestComponent")
  }

  const throwAsyncError = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    throw new Error("This is a test async error")
  }

  const triggerRuntimeError = () => {
    // Intentionally cause a runtime error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Intentional error for testing
    const nonExistentFunction = () => {
      throw new Error("Intentional runtime error")
    }
    nonExistentFunction()
  }

  if (showNetworkError) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <AnimatedNetworkError />
          </div>
          <CardTitle className="flex items-center gap-2 justify-center">
            <WifiOff className="h-5 w-5" />
            Network Error
          </CardTitle>
          <CardDescription>Connection failed - this is a demo</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowNetworkError(false)} className="w-full">
            Reset Demo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5" />
          Error Testing
        </CardTitle>
        <CardDescription>Test error boundaries and error handling with animations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <AsyncErrorBoundary variant="default">
          <Button onClick={() => setShouldThrow(true)} variant="destructive" className="w-full">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Throw Sync Error
          </Button>
        </AsyncErrorBoundary>

        <AsyncErrorBoundary variant="loading">
          <Button onClick={throwAsyncError} variant="outline" className="w-full">
            Throw Async Error
          </Button>
        </AsyncErrorBoundary>

        <Button onClick={() => setShowNetworkError(true)} variant="secondary" className="w-full">
          <Wifi className="w-4 h-4 mr-2" />
          Show Network Error
        </Button>

        <Button onClick={triggerRuntimeError} variant="ghost" className="w-full">
          Trigger Runtime Error
        </Button>
      </CardContent>
    </Card>
  )
}
