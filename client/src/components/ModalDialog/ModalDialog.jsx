import { useEffect, useRef } from "react"
import { modalDialogStyles as styles } from "./ModalDialogStyles"

export function ModalDialog({ labelledBy, onClose, children }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()

    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  const handleCancel = (event) => {
    event.preventDefault()
    onClose()
  }

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      className={styles.dialog}
      onCancel={handleCancel}
      onMouseDown={handleBackdropMouseDown}
    >
      <div className={styles.content}>{children}</div>
    </dialog>
  )
}
