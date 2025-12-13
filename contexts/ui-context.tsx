"use client"

import ModalShell from "@/components/ModalShell"
import type React from "react"
import { createContext, useContext, useRef, useState, type ReactNode } from "react"

interface UIContextType {
  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Toast/notificatio
  // Sidebar refs and states
  sidebarRef: React.RefObject<HTMLDivElement>
  isSidebarCollapsed: boolean
  toggleSidebarCollapse: () => void
  // Page title
  pageTitle: string
  setPageTitle: (title: string) => void,
  openModal: (key: string, jsx: ReactNode) => void
  closeModal: (key: string) => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

interface UIProviderProps {
  children: ReactNode
}

export function UIProvider({ children }: UIProviderProps) {
  // Loading state
  const [isLoading, setIsLoading] = useState(false)

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Page title state
  const [pageTitle, setPageTitle] = useState("Dashboard")

  // Refs
  const sidebarRef = useRef<HTMLDivElement>(null)

  const [modals, setModals] = useState<{
    [key: string]: ReactNode
  } | null>(null);


  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev)
  }

  function openModal(key: string, jsx: ReactNode) {
    setModals((prev) => ({ ...prev, [key]: jsx }));
  }

  function closeModal(key: string) {
    setModals((prev) => {
      const clonedPrev = { ...prev };
      delete clonedPrev[key];
      return clonedPrev;
    });
  }

  const value: UIContextType = {
    isLoading,
    setIsLoading,
    sidebarRef,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    pageTitle,
    setPageTitle,
    openModal,
    closeModal,
  }

  return (
    <UIContext.Provider value={value}>
      {modals && Object.keys(modals).map((key) => {
        return <ModalShell key={key} keyIs={key} closeModal={() => closeModal(key)}> {modals[key]} </ModalShell>
      })}
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider")
  }
  return context
}
