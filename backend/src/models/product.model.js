import mongoose from "mongoose"

const productAttributeSchema = new mongoose.Schema(
  {
    clave: {
      type: String,
      required: true,
      trim: true,
    },
    valor: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
)

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      default: "",
      trim: true,
    },
    medidas: {
      type: String,
      default: "",
      trim: true,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    imagenUrl: {
      type: String,
      default: "",
      trim: true,
    },
    atributos: {
      type: [productAttributeSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema)

export default Product
