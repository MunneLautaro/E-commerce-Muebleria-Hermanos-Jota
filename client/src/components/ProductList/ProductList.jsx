import { ProductCard } from "../ProductCard/ProductCard"

// ProductList recibe una lista de productos
// y crea una ProductCard para cada producto.
export const ProductList = ({ products }) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  )
}