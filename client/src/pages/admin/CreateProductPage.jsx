import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Link, Navigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from "../../features/auth"
import {
  ProductConfirmationModal,
  ProductForm,
} from "../../features/admin"
import { productService } from "../../features/products"
import { productEditorPageStyles as styles } from "../../features/admin/styles/ProductEditorPageStyles"

const initialProduct = {
  nombre: "",
  descripcion: "",
  medidas: "",
  precio: "",
  stock: "0",
  imagenUrl: "",
  isActive: true,
  atributos: [],
}

export default function CreateProductPage() {
  const { user, loading } = useAuth()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const [initialValues, setInitialValues] = useState(initialProduct)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditing)
  const [pendingPayload, setPendingPayload] = useState(null)

  useEffect(() => {
    if (!id) return undefined

    let ignore = false
    const loadProduct = async () => {
      try {
        const data = await productService.getAdminProductById(id)
        if (ignore) return

        setInitialValues({
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          medidas: data.medidas || "",
          precio: data.precio ?? "",
          stock: String(data.stock ?? 0),
          imagenUrl: data.imagenUrl || "",
          isActive: data.isActive ?? true,
          atributos: data.atributos || [],
        })
      } catch (error) {
        if (!ignore) toast.error(error.message || "No se pudo cargar el producto.")
      } finally {
        if (!ignore) setIsLoadingProduct(false)
      }
    }

    loadProduct()
    return () => {
      ignore = true
    }
  }, [id])

  const handleSubmit = (payload) => {
    if (isSubmitting) return

    setPendingPayload(payload)
  }

  const confirmSubmit = async () => {
    if (!pendingPayload || isSubmitting) return

    setIsSubmitting(true)
    try {
      if (isEditing) {
        await productService.updateProduct(id, pendingPayload)
        toast.success("Producto actualizado correctamente.")
      } else {
        await productService.createProduct(pendingPayload)
        toast.success("Producto creado correctamente.")
        setInitialValues(initialProduct)
      }
      setPendingPayload(null)
    } catch (error) {
      toast.error(
        error.message ||
          `No se pudo ${isEditing ? "actualizar" : "crear"} el producto.`,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || isLoadingProduct) {
    return (
      <section className={styles.loadingSection} aria-busy="true">
        <p className={styles.loadingText}>
          {loading ? "Verificando permisos..." : "Cargando producto..."}
        </p>
      </section>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== "admin") return <Navigate to="/" replace />

  return (
    <section className={styles.container}>
      <Link to="/admin" className={styles.backLink}>
        <ArrowLeft size={17} aria-hidden="true" />
        Volver al panel
      </Link>

      <header className={styles.header}>
        <p className={styles.eyebrow}>Panel de administración</p>
        <h1 className={styles.title}>
          {isEditing ? "Editar producto" : "Crear producto"}
        </h1>
        <p className={styles.description}>
          {isEditing
            ? "Actualizá la información y confirmá los cambios antes de guardarlos."
            : "Completá la información del producto. Podés sumar todos los atributos personalizados que necesites."}
        </p>
      </header>

      <ProductForm
        initialValues={initialValues}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <ProductConfirmationModal
        payload={pendingPayload}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onClose={() => setPendingPayload(null)}
        onConfirm={confirmSubmit}
      />
    </section>
  )
}
