export const checkoutPaymentStyles = {
  layout: "mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]",
  list: "space-y-3 rounded-marca border border-linea bg-white p-5 shadow-tarjeta",
  item: "flex items-center justify-between gap-4 border-b border-linea py-3 text-sm text-ink last:border-b-0",
  summary: "space-y-2 rounded-marca bg-crema p-5 text-sm shadow-tarjeta",
  row: "flex items-center justify-between gap-4",
  total:
    "mt-3 flex items-center justify-between border-t border-linea pt-3 font-medium text-siena",
  address:
    "mt-6 rounded-marca border border-linea bg-white p-5 text-sm text-ink-soft shadow-tarjeta",
  addressTitle: "mb-2 text-xs font-medium uppercase tracking-caption text-salvia",
  actions: "mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
  primaryButton:
    "inline-flex items-center justify-center rounded-marca bg-siena px-6 py-3 text-sm font-medium uppercase tracking-cta text-white transition-colors hover:bg-ink",
  secondaryButton:
    "inline-flex items-center justify-center rounded-marca border border-siena px-6 py-3 text-sm font-medium uppercase tracking-cta text-siena transition-colors hover:bg-alabastro",
}
