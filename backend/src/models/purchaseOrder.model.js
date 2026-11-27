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

const purchaseOrderSchema = new mongoose.Schema(
  {
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

const PurchaseOrder =
  mongoose.models.PurchaseOrder ||
  mongoose.model("PurchaseOrder", purchaseOrderSchema)

export default PurchaseOrder
