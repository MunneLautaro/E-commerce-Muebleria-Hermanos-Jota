
import mongoose from "mongoose"

const purchaseOrderSchema = new mongoose.Schema(
  {
    products: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
            validate: {
              validator: Number.isInteger,
              message: "La cantidad debe ser un número entero",
            },
          },
          totalPrice: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      required: true,
      validate: {
        validator: (products) => products.length > 0,
        message: "La compra debe contener al menos un producto",
      },
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Accepted", "Rejected", "Pending"],
      required: true,
      default: "Pending",
    },
  },
  {
    timestamps: true,
    collection: "purchaseOrders",
  },
)

const PurchaseOrder =
  mongoose.models.PurchaseOrder ||
  mongoose.model("PurchaseOrder", purchaseOrderSchema)

export default PurchaseOrder
