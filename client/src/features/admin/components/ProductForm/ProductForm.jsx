import { yupResolver } from "@hookform/resolvers/yup"
import { Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { Link } from "react-router-dom"
import { productFormSchema } from "../../schemas/productForm.schema"
import { productFormStyles as styles } from "./ProductFormStyles"

const emptyValues = {
  nombre: "",
  descripcion: "",
  medidas: "",
  precio: "",
  stock: "0",
  imagenUrl: "",
  isActive: true,
  atributos: [],
}

export function ProductForm({
  initialValues,
  isEditing,
  isSubmitting,
  onSubmit,
}) {
  const [imageErrorUrl, setImageErrorUrl] = useState("")
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues || emptyValues,
    resolver: yupResolver(productFormSchema),
    mode: "onBlur",
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: "atributos",
  })
  const imageUrl = useWatch({ control, name: "imagenUrl" })

  useEffect(() => {
    reset(initialValues || emptyValues)
  }, [initialValues, reset])

  const imageError = imageErrorUrl !== "" && imageErrorUrl === imageUrl

  const handleValidSubmit = (values) => {
    onSubmit({
      ...values,
      stock: Number(values.stock),
      atributos: values.atributos.map(({ clave, valor }) => ({
        clave: clave.trim(),
        valor: valor.trim(),
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)} className={styles.form}>
      <section aria-labelledby="product-data-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2 id="product-data-title" className={styles.sectionTitle}>
            Datos del producto
          </h2>
          <p className={styles.sectionDescription}>
            Los campos marcados con * son obligatorios.
          </p>
        </div>

        <div className={styles.fields}>
          <label className={styles.label}>
            Nombre *
            <input
              {...register("nombre")}
              className={styles.input}
              placeholder="Ej. Sillón Nórdico"
              maxLength={120}
              aria-invalid={Boolean(errors.nombre)}
            />
            {errors.nombre && (
              <span className={styles.fieldError}>{errors.nombre.message}</span>
            )}
          </label>

          <label className={styles.wideLabel}>
            Descripción
            <textarea
              {...register("descripcion")}
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Describí el producto, sus materiales y beneficios."
              rows={4}
              maxLength={2000}
            />
            {errors.descripcion && (
              <span className={styles.fieldError}>
                {errors.descripcion.message}
              </span>
            )}
          </label>

          <label className={styles.label}>
            Medidas
            <input
              {...register("medidas")}
              className={styles.input}
              placeholder="Ej. 180 × 45 × 75 cm"
              maxLength={120}
            />
          </label>

          <label className={styles.label}>
            Precio (ARS) *
            <input
              {...register("precio")}
              className={styles.input}
              type="text"
              placeholder="Ej. 500.000"
              inputMode="decimal"
              autoComplete="off"
              aria-invalid={Boolean(errors.precio)}
            />
            <span className={styles.help}>
              Usá puntos para separar miles: 500.000 = quinientos mil. Para
              centavos, usá coma: 500.000,50.
            </span>
            {errors.precio && (
              <span className={styles.fieldError}>{errors.precio.message}</span>
            )}
          </label>

          <label className={styles.label}>
            Stock disponible *
            <input
              {...register("stock")}
              className={styles.input}
              type="number"
              min="0"
              step="1"
              aria-invalid={Boolean(errors.stock)}
            />
            {errors.stock && (
              <span className={styles.fieldError}>{errors.stock.message}</span>
            )}
          </label>

          <label className={styles.wideLabel}>
            URL de la imagen
            <input
              {...register("imagenUrl", {
                onChange: () => setImageErrorUrl(""),
              })}
              className={styles.input}
              type="text"
              placeholder="/images/kit de imágenes/Producto.png"
              maxLength={2048}
              aria-invalid={Boolean(errors.imagenUrl)}
            />
            <span className={styles.help}>
              Pegá una URL pública o una ruta de imagen dentro del sitio.
            </span>
            {errors.imagenUrl && (
              <span className={styles.fieldError}>
                {errors.imagenUrl.message}
              </span>
            )}
          </label>

          {imageUrl && !imageError && (
            <div className="sm:col-span-2">
              <img
                src={imageUrl}
                alt="Vista previa del producto"
                onError={() => setImageErrorUrl(imageUrl)}
                className={styles.imagePreview}
              />
            </div>
          )}

          {imageUrl && imageError && (
            <p className={styles.imageError} role="status">
              No se pudo cargar la vista previa de esta URL.
            </p>
          )}

          <label className={styles.activeToggle}>
            <input
              {...register("isActive")}
              className={styles.checkbox}
              type="checkbox"
            />
            Producto activo y visible en el catálogo
          </label>
        </div>
      </section>

      <section
        aria-labelledby="product-attributes-title"
        className={styles.section}
      >
        <div className={styles.attributesHeader}>
          <div>
            <h2 id="product-attributes-title" className={styles.sectionTitle}>
              Atributos adicionales
            </h2>
            <p className={styles.sectionDescription}>
              Agregá campos propios, por ejemplo material, acabado o garantía.
            </p>
          </div>
          <button
            type="button"
            onClick={() => append({ clave: "", valor: "" })}
            disabled={fields.length >= 30}
            className={styles.addButton}
          >
            <Plus size={16} aria-hidden="true" />
            Agregar campo
          </button>
        </div>

        {fields.length === 0 ? (
          <div className={styles.emptyAttributes}>
            <Plus className={styles.emptyIcon} size={24} aria-hidden="true" />
            <p className="text-sm text-ink-soft">
              Todavía no agregaste campos personalizados.
            </p>
          </div>
        ) : (
          <div className={styles.attributesList}>
            {fields.map((field, index) => (
              <div key={field.id} className={styles.attributeRow}>
                <label className={styles.label}>
                  Nombre del campo
                  <input
                    {...register(`atributos.${index}.clave`)}
                    className={styles.input}
                    placeholder="Ej. Material"
                    maxLength={80}
                    aria-label={`Nombre del campo ${index + 1}`}
                    aria-invalid={Boolean(errors.atributos?.[index]?.clave)}
                  />
                  {errors.atributos?.[index]?.clave && (
                    <span className={styles.fieldError}>
                      {errors.atributos[index].clave.message}
                    </span>
                  )}
                </label>
                <label className={styles.label}>
                  Valor
                  <input
                    {...register(`atributos.${index}.valor`)}
                    className={styles.input}
                    placeholder="Ej. Madera de nogal"
                    maxLength={200}
                    aria-label={`Valor del campo ${index + 1}`}
                    aria-invalid={Boolean(errors.atributos?.[index]?.valor)}
                  />
                  {errors.atributos?.[index]?.valor && (
                    <span className={styles.fieldError}>
                      {errors.atributos[index].valor.message}
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className={styles.removeButton}
                  aria-label={`Eliminar campo ${index + 1}`}
                >
                  <Trash2 size={17} aria-hidden="true" />
                  <span className="sm:hidden">Eliminar campo</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className={styles.footer}>
        <Link to="/admin" className={styles.cancelButton}>
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Guardar producto"}
        </button>
      </div>
    </form>
  )
}
