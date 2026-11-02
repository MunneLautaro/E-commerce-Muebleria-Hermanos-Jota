import mongoose from "mongoose"
import Contact from "../models/contact.model.js"

const unavailableDatabaseError = () => {
  const error = new Error("La base de datos no está disponible")
  error.status = 503
  error.expose = true
  return error
}

const mapContactCreationError = (error) => {
  if (error?.name === "ValidationError") {
    const validationError = new Error(
      Object.values(error.errors)
        .map((item) => item.message)
        .join(", "),
    )
    validationError.status = 400
    validationError.expose = true
    return validationError
  }

  if (
    error?.name === "MongoServerSelectionError" ||
    error?.name === "MongooseServerSelectionError" ||
    (error?.name === "MongooseError" &&
      /buffering timed out|Cannot call/i.test(error.message))
  ) {
    return unavailableDatabaseError()
  }

  return error
}

export const createContactService = async (contactData) => {
  if (mongoose.connection.readyState !== 1) {
    throw unavailableDatabaseError()
  }

  try {
    await Contact.create(contactData)
  } catch (error) {
    throw mapContactCreationError(error)
  }
}
