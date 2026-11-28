import * as yup from "yup"
import { validateCartCoupon } from "../utils/cartCalculations"

export const couponSchema = yup.object({
  code: yup
    .string()
    .trim()
    .max(32, "El código no puede superar los 32 caracteres.")
    .required("Ingresá un código promocional.")
    .test("valid-coupon", function validateCoupon(value) {
      const { error } = validateCartCoupon(value, this.options.context?.subtotal)
      return error ? this.createError({ message: error }) : true
    }),
})
