import { X } from "lucide-react"
import { deleteProductModalStyles as styles } from "./DeleteProductModalStyles"

export function DeleteProductModal({
  product,
  isDeleting,
  onClose,
  onConfirm,
}) {
  if (!product) return null

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
      >
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>Acción para el catálogo</p>
            <h2 id="delete-product-title" className={styles.title}>
              ¿Eliminar producto?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Cerrar confirmación"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <p className={styles.description}>
          “{product.nombre}” dejará de mostrarse en el catálogo público. Podrás
          volver a activarlo editándolo.
        </p>
        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={styles.confirmButton}
          >
            {isDeleting ? "Eliminando..." : "Eliminar producto"}
          </button>
        </div>
      </section>
    </div>
  )
}
