import { CHECKOUT_ADDRESS_FIELDS } from "../../utils/checkoutAddress"
import { checkoutAddressFormStyles as s } from "./CheckoutAddressFormStyles"

export const CheckoutAddressForm = ({
  address,
  errors,
  saveAddress,
  onChange,
  onToggleSave,
  onBack,
  onSubmit,
}) => {
  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className={s.form} noValidate onSubmit={handleSubmit}>
      <div className={s.grid}>
        {CHECKOUT_ADDRESS_FIELDS.map(({ name, label, type, autoComplete, maxLength }) => {
          const inputId = `checkout-${name}`
          const errorId = `${inputId}-error`
          const error = errors[name]

          return (
            <div className={s.field} key={name}>
              <label className={s.label} htmlFor={inputId}>
                {label}
              </label>
              <input
                id={inputId}
                className={s.input(error)}
                type={type}
                autoComplete={autoComplete}
                maxLength={maxLength}
                value={address[name]}
                onChange={(event) => onChange(name, event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
              />
              {error && (
                <span id={errorId} className={s.error}>
                  {error}
                </span>
              )}
            </div>
          )
        })}
      </div>
      <label className={s.save}>
        <input
          type="checkbox"
          checked={saveAddress}
          onChange={(event) => onToggleSave(event.target.checked)}
        />
        <span>Guardar para futuras compras</span>
      </label>
      <div className={s.actions}>
        <button type="button" className={s.secondaryButton} onClick={onBack}>
          Volver
        </button>
        <button type="submit" className={s.primaryButton}>
          Siguiente
        </button>
      </div>
    </form>
  )
}
