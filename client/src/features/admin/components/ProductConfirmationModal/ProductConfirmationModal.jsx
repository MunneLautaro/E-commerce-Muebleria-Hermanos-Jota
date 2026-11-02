import { X } from "lucide-react"
import { productConfirmationModalStyles as styles } from "./ProductConfirmationModalStyles"

export function ProductConfirmationModal({
  payload,
  isEditing,
  isSubmitting,
  onClose,
  onConfirm,
}) {
  if (!payload) return null

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
        aria-labelledby="confirm-product-title"
      >
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>Confirmación</p>
            <h2 id="confirm-product-title" className={styles.title}>
              {isEditing ? "¿Guardar cambios?" : "¿Crear producto?"}
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
          {isEditing
            ? `Se actualizará “${payload.nombre}” en el catálogo.`
            : `Se agregará “${payload.nombre}” al catálogo.`}
        </p>
        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Revisar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={styles.confirmButton}
          >
            {isSubmitting ? "Guardando..." : "Confirmar"}
          </button>
        </div>
      </section>
    </div>
  )
}
