import { productListContainer } from "../ProductList/ProductListStyles"
import { productListSkeletonStyles as s } from "./ProductListSkeletonStyles"

const ProductCardSkeleton = ({ compact }) => (
  <div className={s.card}>
    <div className={s.image(compact)} />
    <div className={s.content(compact)}>
      <div className={s.title} />
      {!compact && (
        <>
          <div className={s.price} />
          <div className={s.line} />
          <div className={s.shortLine} />
        </>
      )}
    </div>
  </div>
)

export const ProductListSkeleton = ({ count, compact = false, label }) => (
  <output className="block">
    <span className="sr-only">{label}</span>
    <div className={productListContainer(compact)} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => `skeleton-${index}`).map(
        (key) => (
          <ProductCardSkeleton key={key} compact={compact} />
        ),
      )}
    </div>
  </output>
)
