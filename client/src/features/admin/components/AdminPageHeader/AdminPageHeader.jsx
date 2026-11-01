import { Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { adminPageHeaderStyles as styles } from "./AdminPageHeaderStyles"

export function AdminPageHeader() {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>Administración</p>
        <h1 className={styles.title}>Gestionar productos</h1>
        <p className={styles.description}>
          Consultá el catálogo y actualizá rápidamente la información de cada
          producto.
        </p>
      </div>
      <Link to="/admin/crear-producto" className={styles.createLink}>
        <Plus size={18} aria-hidden="true" />
        Nuevo producto
      </Link>
    </header>
  )
}
