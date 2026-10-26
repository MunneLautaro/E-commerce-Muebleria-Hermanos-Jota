import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    orders: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
  },
)

export default mongoose.models.User || mongoose.model("User", userSchema)
