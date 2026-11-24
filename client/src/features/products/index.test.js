import * as products from "./index"
import { productService } from "./services/productService"
import { productOptionalFields } from "./constants/productFields"
import { ProductCard } from "./components/ProductCard/ProductCard"
import { ProductList } from "./components/ProductList/ProductList"
import { ProductListSkeleton } from "./components/ProductListSkeleton/ProductListSkeleton"

describe("features/products index", () => {
  test("expone la API pública de la feature", () => {
    expect({ ...products }).toEqual({
      productService,
      productOptionalFields,
      ProductCard,
      ProductList,
      ProductListSkeleton,
    })
  })
})
