import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { toast } from "react-toastify"
import { couponSchema } from "../schemas/coupon.schema"
import {
  formatCartCurrency,
  validateCartCoupon,
} from "../utils/cartCalculations"

export const useCouponForm = ({ subtotal, onApply, onRemove }) => {
  const [message, setMessage] = useState("")
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(couponSchema),
    context: { subtotal },
    defaultValues: { code: "" },
  })

  const onValid = ({ code }) => {
    const { coupon } = validateCartCoupon(code, subtotal)
    const discount = Math.round(subtotal * coupon.discountRate)
    const successMessage = `Cupón demostrativo ${coupon.code} aplicado localmente. Ahorrás ${formatCartCurrency.format(discount)}.`

    onApply(coupon.code)
    reset()
    setMessage(successMessage)
    toast.success(successMessage)
  }

  const onInvalid = (formErrors) => {
    setMessage("")
    toast.error(formErrors.code?.message)
  }

  const removeCoupon = () => {
    onRemove()
    reset()
    setMessage("Se quitó el cupón de esta compra.")
    toast.info("Se quitó el cupón de esta compra.")
  }

  const codeField = register("code", {
    onChange: () => setMessage(""),
  })

  return {
    codeField,
    handleSubmit: handleSubmit(onValid, onInvalid),
    error: errors.code?.message,
    message,
    removeCoupon,
  }
}
