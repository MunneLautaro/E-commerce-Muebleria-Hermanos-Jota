import mongoose from "mongoose"

export const PURCHASE_ORDER_STATES = ["pendiente", "aceptada", "rechazada"]

const orderItemSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "La cantidad debe ser un número entero",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
)

export const SHIPPING_LIMITS = {
  nombreCompleto: 100,
  telefono: 30,
  direccion: 120,
  altura: 10,
  ciudad: 80,
  codigoPostal: 8,
}

export const PHONE_PATTERN = /^[\d\s()+-]{6,30}$/
export const POSTAL_CODE_PATTERN = /^[A-Za-z\d]{4,8}$/

const shippingText = (name, extra = {}) => ({
  type: String,
  required: true,
  trim: true,
  maxlength: SHIPPING_LIMITS[name],
  ...extra,
})

const shippingSchema = new mongoose.Schema(
  {
    nombreCompleto: shippingText("nombreCompleto"),
    telefono: shippingText("telefono", { match: PHONE_PATTERN }),
    direccion: shippingText("direccion"),
    altura: shippingText("altura"),
    ciudad: shippingText("ciudad"),
    codigoPostal: shippingText("codigoPostal", { match: POSTAL_CODE_PATTERN }),
  },
  { _id: false },
)

const purchaseOrderSchema = new mongoose.Schema(
  {
    envio: {
      type: shippingSchema,
      required: true,
    },
    productos: {
      type: [orderItemSchema],
      validate: {
        validator: (productos) => productos.length > 0,
        message: "La compra debe contener al menos un producto",
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    comprador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    estado: {
      type: String,
      enum: PURCHASE_ORDER_STATES,
      default: "aceptada",
    },
  },
  {
    timestamps: true,
    collection: "ordenes",
  },
)

purchaseOrderSchema.index({ createdAt: -1, _id: -1 })
purchaseOrderSchema.index({ estado: 1, createdAt: -1, _id: -1 })

const PurchaseOrder =
  mongoose.models.PurchaseOrder ||
  mongoose.model("PurchaseOrder", purchaseOrderSchema)

export default PurchaseOrder
