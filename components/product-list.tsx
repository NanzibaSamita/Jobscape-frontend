"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search } from "lucide-react"
import { AsyncErrorBoundary } from "./async-error-boundary"

function ProductListContent() {
  const {
    filteredProducts,
    categories,
    categoryFilter,
    setCategoryFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    deleteProduct,
    selectProduct,
    isDeletingProduct,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filteredProducts: any[],
    categories: string[],
    categoryFilter: string,
    setCategoryFilter: (value: string) => void,
    currentPage: number,
    setCurrentPage: (page: number) => void,
    itemsPerPage: number,
    totalPages: number,
    deleteProduct: (id: string) => Promise<void>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectProduct: (product: any) => void,
    isDeletingProduct: boolean,
  } = {
    // Replace with your actual data fetching logic
    filteredProducts: [], // Example: fetched products
    categories: ["electronics", "furniture", "clothing"], // Example categories
    categoryFilter: "all",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setCategoryFilter: (value: string) => { },
    currentPage: 1,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setCurrentPage: (page: number) => { },
    itemsPerPage: 10,
    totalPages: 1,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteProduct: async (id: string) => { },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    selectProduct: (product: any) => { },
    isDeletingProduct: false,
  }

  const [searchTerm, setSearchTerm] = useState("")

  const searchedProducts = filteredProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const paginatedProducts = searchedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (product: any) => {
    selectProduct(product)
    // You would open edit modal here
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.description.length > 50
                          ? `${product.description.substring(0, 50)}...`
                          : product.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}>
                      {product.stock} in stock
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        disabled={isDeletingProduct}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, searchedProducts.length)} of {searchedProducts.length} products
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function ProductList() {
  return (
    <AsyncErrorBoundary
      fallback={(error, retry) => (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Failed to load products</p>
          <Button onClick={retry} size="sm">
            Try Again
          </Button>
        </div>
      )}
    >
      <ProductListContent />
    </AsyncErrorBoundary>
  )
}
