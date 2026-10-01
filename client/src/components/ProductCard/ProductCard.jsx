// Lista de todos los campos opcionales que puede tener un producto.
// El nombre de la izquierda es el nombre que usamos en el objeto.
// El nombre de la derecha es el que verá el usuario.

const optionalFields = [
  { key: "caracteristicas", label: "Características" },
  { key: "materiales", label: "Materiales" },
  { key: "acabado", label: "Acabado" },
  { key: "peso", label: "Peso" },
  { key: "capacidad", label: "Capacidad" },
  { key: "modulares", label: "Modulares" },
  { key: "carga_maxima", label: "Carga máxima" },
  { key: "estructura", label: "Estructura" },
  { key: "tapizado", label: "Tapizado" },
  { key: "confort", label: "Confort" },
  { key: "rotacion", label: "Rotación" },
  { key: "garantia", label: "Garantía" },
  { key: "relleno", label: "Relleno" },
  { key: "sostenibilidad", label: "Sostenibilidad" },
  { key: "extension", label: "Extensión" },
  { key: "apilables", label: "Apilables" },
  { key: "incluye", label: "Incluye" },
  { key: "almacenamiento", label: "Almacenamiento" },
  { key: "cables", label: "Cables" },
  { key: "regulacion", label: "Regulación" },
  { key: "certificacion", label: "Certificación" },
]

// ProductCard representa un único producto del catálogo.
// Recibe un objeto "product".

export const ProductCard = ({ product }) => {
  return (
    <article className="overflow-hidden rounded-lg bg-[#F5E6D3] shadow-md">

      {/* Imagen del producto */}
      <img
        src={product.image}
        alt={product.nombre}
        className="h-64 w-full object-cover"
      />

      <div className="p-5">

        {/* Nombre: todos los productos lo tienen */}
        <h2 className="font-serif text-2xl font-bold text-[#A0522D]">
          {product.nombre}
        </h2>

        {/* Descripción: todos los productos la tienen */}
        <p className="mt-3 text-sm leading-6 text-gray-700">
          {product.descripcion}
        </p>

        {/* Medidas: todos los productos las tienen */}
        <p className="mt-4 text-sm text-gray-700">
          <strong>Medidas:</strong> {product.medidas}
        </p>

        {/* 
          Campos opcionales.

          Recorremos la lista de campos posibles.
          Si el producto tiene ese campo, lo mostramos.
          Si no lo tiene, no aparece nada.
        */}
        <div className="mt-5 space-y-2 border-t border-[#A0522D]/20 pt-4">

          {optionalFields.map(({ key, label }) => {
            const value = product[key]

            // Si el producto no tiene este dato, no mostramos nada.
            if (!value) {
              return null
            }

            return (
              <p
                key={key}
                className="text-sm leading-5 text-gray-700"
              >
                <strong>{label}:</strong> {value}
              </p>
            )
          })}

        </div>

        {/* Botón para acceder al detalle del producto */}
        <button
          type="button"
          className="mt-6 rounded-md bg-[#A0522D] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Ver producto
        </button>

      </div>
    </article>
  )
}