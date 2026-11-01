import mongoose from "mongoose"

const contactSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    telefono: {
      type: String,
      default: "",
      trim: true,
      maxlength: 30,
    },
    motivo: {
      type: String,
      required: true,
      enum: ["pieza", "showroom", "general"],
    },
    mensaje: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
)

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema)

export default Contact
