import { useState } from "react"
import { MOCK_PRODUCTS } from "@/data/mock-products"
import type { Product } from "@/types/product"
import { ProductsPage } from "@/components/products/products-page"
import { Toaster } from "@/components/ui/sonner"

function App() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)

  function handleAddProduct(product: Product) {
    setProducts((prev) => [...prev, product])
  }

  return (
    <div className="min-h-svh bg-background">
      <ProductsPage products={products} onAddProduct={handleAddProduct} />
      <Toaster position="bottom-right" />
    </div>
  )
}

export default App
