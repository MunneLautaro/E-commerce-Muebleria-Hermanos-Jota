export const cartPageStyles = {
  section: "mx-auto max-w-6xl",
  eyebrow: "text-xs font-medium uppercase tracking-title text-salvia",
  title: "mt-2 font-display text-3xl text-siena md:text-4xl",
  intro: "mt-3 max-w-2xl text-sm leading-7 text-ink-soft",
  layout: "mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]",
  mobileSummary:
    "mb-4 flex items-center justify-between gap-4 rounded-marca border border-linea bg-crema px-4 py-3 shadow-tarjeta lg:hidden",
  mobileSummaryLabel: "text-xs text-ink-soft",
  mobileSummaryValue: "text-lg font-medium text-siena",
  itemList: "space-y-4",
  loading:
    "rounded-marca bg-crema px-5 py-10 text-center text-sm text-ink-soft",
  error:
    "rounded-marca bg-error-bg px-5 py-10 text-center text-sm text-error",
  empty:
    "mt-8 rounded-marca bg-panel-marca px-6 py-12 text-center sm:px-10",
  emptyIcon: "mx-auto h-9 w-9 text-siena",
  emptyTitle: "mt-4 font-display text-2xl text-siena",
  emptyText: "mt-3 text-sm text-ink-soft",
  primaryLink:
    "mt-6 inline-flex items-center justify-center rounded-marca bg-siena px-6 py-3 text-sm font-medium uppercase tracking-cta text-white transition-colors hover:bg-ink",
  progress:
    "mb-4 grid grid-cols-3 rounded-marca border border-linea bg-crema p-2",
  progressStep:
    "flex items-center justify-center gap-2 px-2 py-2 text-ink-soft",
  progressStepActive: "rounded-marca bg-alabastro text-siena",
  progressNumber:
    "flex h-7 w-7 items-center justify-center rounded-full border border-linea bg-white text-xs font-medium",
  progressLabel: "hidden text-xs font-medium sm:inline",
  stepText: "mb-6 text-xs font-medium uppercase tracking-caption text-salvia",
  actions: "mt-6 flex justify-end",
  checkoutButton:
    "inline-flex items-center justify-center rounded-marca bg-siena px-6 py-3 text-sm font-medium uppercase tracking-cta text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50",
  secondaryButton:
    "inline-flex items-center justify-center rounded-marca border border-siena px-6 py-3 text-sm font-medium uppercase tracking-cta text-siena transition-colors hover:bg-alabastro",
  addressForm:
    "mt-8 rounded-marca border border-linea bg-white p-5 shadow-tarjeta sm:p-8",
  addressGrid:
    "grid gap-5 sm:grid-cols-2",
  addressField: "flex flex-col",
  addressLabel: "mb-2 text-sm font-medium text-ink",
  addressInput: (invalid) =>
    `rounded-marca border px-3 py-3 text-sm outline-none ${invalid ? "border-error bg-error-bg" : "border-linea bg-white focus:border-siena"}`,
  addressError: "mt-1 text-xs text-error",
  saveAddress:
    "mt-6 flex items-center gap-3 text-sm font-medium text-ink",
  addressActions:
    "mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
  paymentLayout:
    "mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]",
  paymentList:
    "space-y-3 rounded-marca border border-linea bg-white p-5 shadow-tarjeta",
  paymentItem:
    "flex items-center justify-between gap-4 border-b border-linea py-3 text-sm text-ink last:border-b-0",
  paymentSummary:
    "rounded-marca bg-crema p-5 shadow-tarjeta",
  paymentTotal:
    "mt-3 flex items-center justify-between border-t border-linea pt-3 font-medium text-siena",
  modalContent: "min-w-[18rem] sm:min-w-[26rem]",
  modalEyebrow: "text-xs font-medium uppercase tracking-title text-salvia",
  modalTitle: "mt-2",
  modalDescription: "mt-4 text-sm leading-7 text-ink-soft",
  modalActions: "mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
}
