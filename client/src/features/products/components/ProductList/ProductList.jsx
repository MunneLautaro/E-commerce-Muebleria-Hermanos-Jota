import { ProductCard } from "../ProductCard/ProductCard"
import { productListContainer } from "./ProductListStyles"

export const ProductList = ({ products, compact = false }) => {
  return (
    <div className={productListContainer(compact)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} compact={compact} />
      ))}
    </div>
  )
}
