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
      minlength: 8,
      select: false,
      required: function () {
        return !this.googleId
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    picture: {
      type: String,
      default: "",
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
