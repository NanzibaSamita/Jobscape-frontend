"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { addNotification, toggleSidebar } from "@/lib/store/slices/appSlice"
import { useUI } from "@/contexts/ui-context"
import { ProductForm } from "./product-form"
import { ProductList } from "./product-list"
import { ErrorTestComponent } from "./error-test-component"
import { AsyncErrorBoundary } from "./async-error-boundary"
import { Menu, Plus, User } from "lucide-react"
import Link from "next/link"

export function Dashboard() {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => ({ user: state.auth.user, isAuthenticated: state.auth.isAuthenticated }))
  const { sidebarOpen } = useAppSelector((state) => state.app)

  const { openModal, closeModal, setPageTitle, isLoading, } = useUI()

  useEffect(() => {
    setPageTitle("Dashboard")
  }, [setPageTitle])



  const handleAddProduct = () => {
    openModal("openModal",
      <ProductForm
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onSubmit={async () => {
          // await addProduct(data)
          closeModal("openModal")
          dispatch(
            addNotification({
              message: "Product created successfully!",
              type: "success",
            }),
          )
        }}
        onCancel={closeModal}
        isLoading={false}
      />,
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" onClick={() => dispatch(toggleSidebar())}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="ml-auto flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user?.user_first_name} {user?.user_last_name}</span>
                <Button variant="outline" size="sm" >
                  Logout
                </Button>
              </div>
            ) : (
              <Button disabled={isLoading} size="sm">
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 border-r bg-muted/40 min-h-[calc(100vh-4rem)]">
            <div className="p-4">
              <h2 className="text-lg font-semibold">Navigation</h2>
              <nav className="mt-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  Dashboard
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Products
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/error-demo">Error Demo</Link>
                </Button>
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">10</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">User Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isAuthenticated ? "Logged In" : "Guest"}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sidebar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sidebarOpen ? "Open" : "Closed"}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Loading</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? "Yes" : "No"}</div>
                </CardContent>
              </Card>
            </div>

            {/* Error Testing Section */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Error Boundary Testing</CardTitle>
                  <CardDescription>Test error boundaries and error handling mechanisms</CardDescription>
                </CardHeader>
                <CardContent>
                  <AsyncErrorBoundary>
                    <ErrorTestComponent />
                  </AsyncErrorBoundary>
                </CardContent>
              </Card>
            </div>

            {/* Products Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>Manage your product inventory</CardDescription>
                  </div>
                  <Button onClick={handleAddProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ProductList />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
