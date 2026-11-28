export const checkoutAddressFormStyles = {
  form: "mt-8 rounded-marca border border-linea bg-white p-5 shadow-tarjeta sm:p-8",
  grid: "grid gap-5 sm:grid-cols-2",
  field: "flex flex-col",
  label: "mb-2 text-sm font-medium text-ink",
  input: (invalid) =>
    `rounded-marca border px-3 py-3 text-sm outline-none ${invalid ? "border-error bg-error-bg" : "border-linea bg-white focus:border-siena"}`,
  error: "mt-1 text-xs text-error",
  save: "mt-6 flex items-center gap-3 text-sm font-medium text-ink",
  actions: "mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
  primaryButton:
    "inline-flex items-center justify-center rounded-marca bg-siena px-6 py-3 text-sm font-medium uppercase tracking-cta text-white transition-colors hover:bg-ink",
  secondaryButton:
    "inline-flex items-center justify-center rounded-marca border border-siena px-6 py-3 text-sm font-medium uppercase tracking-cta text-siena transition-colors hover:bg-alabastro",
}
