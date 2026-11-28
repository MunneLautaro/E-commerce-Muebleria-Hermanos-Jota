import { ModalDialog } from "../../../../components/ModalDialog/ModalDialog"
import { formatCartCurrency } from "../../utils/cartCalculations"
import { confirmPurchaseModalStyles as s } from "./ConfirmPurchaseModalStyles"

const ignoreClose = () => {}

export const ConfirmPurchaseModal = ({ total, submitting, onCancel, onConfirm }) => (
  <ModalDialog
    labelledBy="confirm-purchase-title"
    onClose={submitting ? ignoreClose : onCancel}
  >
    <div className={s.content}>
      <p className={s.eyebrow}>Confirmación</p>
      <h2 id="confirm-purchase-title" className={s.title}>
        Confirmar compra
      </h2>
      <p className={s.description}>
        Estás a punto de confirmar un pago por {formatCartCurrency.format(total)}.
      </p>
      <p className={s.note}>
        El total no incluye envío ni descuentos: esos montos son demostrativos
        y todavía no se cobran.
      </p>
      <div className={s.actions}>
        <button
          type="button"
          className={s.secondaryButton}
          onClick={onCancel}
          disabled={submitting}
        >
          Rechazar
        </button>
        <button
          type="button"
          className={s.primaryButton}
          onClick={onConfirm}
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? "Procesando..." : "Confirmar"}
        </button>
      </div>
    </div>
  </ModalDialog>
)
