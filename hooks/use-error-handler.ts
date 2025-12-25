"use client"

import { useCallback } from "react"
import { useAppDispatch } from "@/lib/store"
import { addNotification } from "@/lib/store/slices/appSlice"

interface ErrorHandlerOptions {
  showNotification?: boolean
  logError?: boolean
  fallbackMessage?: string
}

export function useErrorHandler() {
  const dispatch = useAppDispatch()

  const handleError = useCallback(
    (error: Error | unknown, options: ErrorHandlerOptions = {}) => {
      const { showNotification = true, logError = true, fallbackMessage = "An unexpected error occurred" } = options

      // Log the error
      if (logError) {
        console.error("Error handled by useErrorHandler:", error)
      }

      // Extract error message
      const errorMessage = error instanceof Error ? error.message : fallbackMessage

      // Show notification
      if (showNotification) {
        dispatch(
          addNotification({
            message: errorMessage,
            type: "error",
          }),
        )
      }

      // Here you can integrate with error reporting services
      // Example: Sentry, LogRocket, etc.
      // reportError(error)

      return errorMessage
    },
    [dispatch],
  )

  const handleAsyncError = useCallback(
    async (asyncFn: () => Promise<any>, options: ErrorHandlerOptions = {}) => {
      try {
        return await asyncFn()
      } catch (error) {
        handleError(error, options)
        throw error // Re-throw to allow caller to handle if needed
      }
    },
    [handleError],
  )

  return {
    handleError,
    handleAsyncError,
  }
}
