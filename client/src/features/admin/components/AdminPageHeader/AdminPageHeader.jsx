import { NavLink } from "react-router-dom"
import { adminPageHeaderStyles as styles } from "./AdminPageHeaderStyles"

const adminTabs = [
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/ordenes", label: "Órdenes" },
]

const tabClassName = ({ isActive }) =>
  `${styles.tab} ${isActive ? styles.tabActive : styles.tabInactive}`

export function AdminPageHeader({ title, description, action }) {
  return (
    <header className={styles.wrapper}>
      <nav className={styles.tabs} aria-label="Secciones del panel">
        {adminTabs.map(({ to, label }) => (
          <NavLink key={to} to={to} className={tabClassName}>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Administración</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>
        {action}
      </div>
    </header>
  )
}
