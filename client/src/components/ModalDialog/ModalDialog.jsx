import { useEffect, useRef } from "react"
import { modalDialogStyles as styles } from "./ModalDialogStyles"

export function ModalDialog({ labelledBy, onClose, children }) {
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()

    const handleBackdropMouseDown = (event) => {
      if (event.target === dialog) onCloseRef.current()
    }
    dialog.addEventListener("mousedown", handleBackdropMouseDown)

    return () => {
      dialog.removeEventListener("mousedown", handleBackdropMouseDown)
      if (dialog.open) dialog.close()
    }
  }, [])

  const handleCancel = (event) => {
    event.preventDefault()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      className={styles.dialog}
      onCancel={handleCancel}
    >
      <div className={styles.content}>{children}</div>
    </dialog>
  )
}
