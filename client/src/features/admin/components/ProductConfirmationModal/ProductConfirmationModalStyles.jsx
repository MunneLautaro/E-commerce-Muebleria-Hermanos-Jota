export const productConfirmationModalStyles = {
  overlay:
    "fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4",
  dialog: "w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl",
  heading: "flex items-start justify-between gap-4",
  eyebrow:
    "text-xs font-semibold uppercase tracking-[0.18em] text-salvia",
  title: "mt-2 text-2xl",
  closeButton:
    "rounded-full p-2 text-ink-soft transition hover:bg-crema hover:text-ink",
  description: "mt-4 text-sm leading-6 text-ink-soft",
  actions: "mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
  cancelButton:
    "min-h-11 rounded-lg border border-siena/30 px-5 text-sm font-semibold text-siena transition hover:bg-crema",
  confirmButton:
    "min-h-11 rounded-lg bg-siena px-5 text-sm font-semibold text-white transition hover:bg-[#7f4222] disabled:cursor-not-allowed disabled:opacity-60",
}
