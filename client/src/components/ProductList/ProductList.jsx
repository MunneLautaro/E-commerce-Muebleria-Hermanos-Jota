import { ProductCard } from "../ProductCard/ProductCard"

// ProductList recibe una lista de productos
// y crea una ProductCard para cada producto.
export const ProductList = ({ products, compact = false }) => {
  return (
    <div
      className={
        compact
          ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          compact={compact}
        />
      ))}
    </div>
  )
}