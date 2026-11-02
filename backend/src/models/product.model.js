import mongoose from "mongoose"

const productAttributeSchema = new mongoose.Schema(
  {
    clave: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    valor: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
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
      max: 1_000_000_000,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
      max: 100_000,
      validate: {
        validator: Number.isInteger,
        message: "El stock debe ser un entero",
      },
    },
    imagenUrl: {
      type: String,
      required: true,
      default: "",
      trim: true,
      maxlength: 2048,
      validate: {
        validator: (value) =>
          value.startsWith("/") || /^https?:\/\/\S+$/i.test(value),
        message: "La imagen debe ser una URL HTTP/HTTPS o una ruta relativa válida",
      },
    },
    atributos: {
      type: [productAttributeSchema],
      maxlength: 30,
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
