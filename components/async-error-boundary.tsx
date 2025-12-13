"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"
import { AnimatedErrorBoundary } from "./animations/animated-error-boundary"
import { AnimatedLoadingError } from "./animations/animated-loading-error"

interface AsyncErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface AsyncErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  variant?: "default" | "loading" | "network"
}

export class AsyncErrorBoundary extends Component<AsyncErrorBoundaryProps, AsyncErrorBoundaryState> {
  constructor(props: AsyncErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): AsyncErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AsyncErrorBoundary caught an error:", error, errorInfo)

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry)
      }

      const AnimationComponent = this.props.variant === "loading" ? AnimatedLoadingError : AnimatedErrorBoundary

      return (
        <Card className="w-full max-w-sm mx-auto">
          <CardHeader className="text-center pb-2">
            <div className="mb-4">
              <AnimationComponent />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <CardTitle className="text-lg">Component Error</CardTitle>
            </div>
            <CardDescription className="text-sm">
              {this.props.variant === "loading"
                ? "Failed to load this component."
                : "This component encountered an error."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {process.env.NODE_ENV === "development" && (
              <div className="rounded-md bg-muted p-2">
                <p className="text-xs text-muted-foreground break-all">{this.state.error.message}</p>
              </div>
            )}
            <Button onClick={this.handleRetry} size="sm" className="w-full">
              <RefreshCw className="h-3 w-3 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
