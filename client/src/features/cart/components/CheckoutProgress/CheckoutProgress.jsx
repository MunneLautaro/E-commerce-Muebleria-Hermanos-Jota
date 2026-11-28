import { checkoutProgressStyles as s } from "./CheckoutProgressStyles"

const CHECKOUT_STEPS = ["Carrito", "Ubicación", "Pago"]

export const CheckoutProgress = ({ step }) => (
  <>
    <ol className={s.list} aria-label="Progreso de la compra">
      {CHECKOUT_STEPS.map((label, index) => {
        const number = index + 1
        return (
          <li
            key={label}
            className={s.step(number <= step)}
            aria-current={number === step ? "step" : undefined}
          >
            <span className={s.number}>{number}</span>
            <span className={s.label}>{label}</span>
          </li>
        )
      })}
    </ol>
    <p className={s.stepText}>
      Paso {step} de {CHECKOUT_STEPS.length}
    </p>
  </>
)
