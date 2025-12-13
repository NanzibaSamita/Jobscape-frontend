"use client"

import type React from "react"

import { Provider } from "react-redux"
import { persistor, store } from "./index"
import { PersistGate } from "redux-persist/integration/react"

interface StoreProviderProps {
  children: React.ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  return (
    <Provider
      store={store}
    >
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}
