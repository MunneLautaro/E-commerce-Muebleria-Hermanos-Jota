export const cartPageStyles = {
  section: "mx-auto max-w-6xl",
  eyebrow: "text-xs font-medium uppercase tracking-title text-salvia",
  title: "mt-2 font-display text-3xl text-siena md:text-4xl",
  intro: "mt-3 max-w-2xl text-sm leading-7 text-ink-soft",
  layout: "mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]",
  itemList: "space-y-4",
  itemCard: (isRemoving, hasFeedback) =>
    `grid gap-4 rounded-marca border border-linea bg-white p-4 shadow-tarjeta transition-all duration-200 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-center ${
      isRemoving
        ? "pointer-events-none translate-x-2 scale-[0.98] opacity-0"
        : hasFeedback
          ? "translate-x-0 scale-[1.01] border-salvia opacity-100"
          : "translate-x-0 scale-100 opacity-100"
    }`,
  itemImage: "h-32 w-full rounded-marca bg-crema object-contain sm:h-28",
  detailButton:
    "text-left font-display text-lg text-siena transition-colors hover:text-ink",
  itemDescription: "mt-1 line-clamp-2 text-sm leading-6 text-ink-soft",
  itemPrice: "mt-3 text-sm font-medium text-ink",
  itemSubtotal: "mt-1 text-sm text-ink-soft",
  controls: "flex items-center gap-2 sm:justify-end",
  quantityButton:
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-linea text-siena transition-all duration-150 hover:bg-alabastro active:scale-90 disabled:cursor-not-allowed disabled:opacity-40",
  quantity:
    "min-w-8 text-center text-sm font-medium text-ink transition-colors",
  removeButton:
    "inline-flex h-9 w-9 items-center justify-center rounded-full text-error transition-colors hover:bg-error-bg",
  summary:
    "h-fit rounded-marca border border-linea bg-crema p-5 shadow-tarjeta lg:sticky lg:top-6",
  summaryTitle: "font-display text-xl text-siena",
  shippingProgress:
    "mt-5 rounded-marca border border-linea bg-white p-4",
  shippingMessage: "flex items-start gap-2 text-sm leading-6 text-ink-soft",
  shippingIcon: "mt-0.5 h-4 w-4 shrink-0 text-siena",
  progressTrack: "mt-3 h-2 overflow-hidden rounded-full bg-alabastro",
  progressFill:
    "h-full rounded-full bg-salvia transition-[width] duration-500 ease-out",
  summaryRows: "mt-5 space-y-3",
  summaryRow: "flex justify-between gap-4 text-sm text-ink-soft",
  discountValue: "font-medium text-salvia",
  summaryTotal:
    "mt-4 flex justify-between gap-4 border-t border-linea pt-4 font-medium text-ink",
  couponSection: "mt-5 border-t border-linea pt-5",
  couponTitle: "flex items-center gap-2 text-sm font-medium text-ink",
  couponIcon: "h-4 w-4 text-siena",
  couponForm: "mt-3 flex gap-2",
  couponInput:
    "min-w-0 flex-1 rounded-marca border border-linea bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-siena focus:ring-2 focus:ring-siena/20",
  couponApply:
    "rounded-marca bg-siena px-4 py-2 text-xs font-medium uppercase tracking-cta text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50",
  couponRemove:
    "mt-3 inline-flex items-center gap-1 text-xs font-medium text-error transition-colors hover:text-ink",
  couponCodes: "mt-3 space-y-1 text-xs leading-5 text-ink-soft",
  couponError: "mt-2 text-xs leading-5 text-error",
  couponSuccess: "mt-2 text-xs leading-5 text-salvia",
  localDisclosure: "mt-4 text-xs leading-5 text-ink-soft",
  continueLink:
    "mt-6 inline-flex w-full items-center justify-center rounded-marca border border-siena px-5 py-3 text-sm font-medium uppercase tracking-cta text-siena transition-colors hover:bg-alabastro",
  recommendations: "mt-12",
  recommendationsHeader: "mb-5",
  recommendationsEyebrow:
    "text-xs font-medium uppercase tracking-title text-salvia",
  recommendationsTitle: "mt-2 font-display text-2xl text-siena",
  recommendationList: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
  recommendationCard:
    "overflow-hidden rounded-marca border border-linea bg-white shadow-tarjeta transition-all duration-200 hover:-translate-y-1 hover:shadow-marca",
  recommendationImage:
    "h-40 w-full bg-crema object-contain p-3",
  recommendationContent: "p-4",
  recommendationName:
    "line-clamp-2 min-h-10 font-display text-base text-siena transition-colors hover:text-ink",
  recommendationPrice: "mt-2 text-sm font-medium text-ink",
  recommendationStock: "mt-1 text-xs text-ink-soft",
  recommendationAdd:
    "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-marca border border-siena px-3 py-2 text-xs font-medium uppercase tracking-cta text-siena transition-all hover:bg-alabastro active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
  recommendationNotice:
    "rounded-marca border border-linea bg-crema p-4 text-sm text-ink-soft",
  loading:
    "rounded-marca bg-crema px-5 py-10 text-center text-sm text-ink-soft",
  error:
    "rounded-marca bg-error-bg px-5 py-10 text-center text-sm text-error",
  empty:
    "mt-8 rounded-marca bg-panel-marca px-6 py-12 text-center sm:px-10",
  emptyTitle: "font-display text-2xl text-siena",
  emptyText: "mt-3 text-sm text-ink-soft",
  primaryLink:
    "mt-6 inline-flex items-center justify-center rounded-marca bg-siena px-6 py-3 text-sm font-medium uppercase tracking-cta text-white transition-colors hover:bg-ink",
  modalHeader: "flex items-start justify-between gap-4",
  modalTitle: "font-display text-2xl text-siena",
  modalClose:
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-linea text-siena transition-colors hover:bg-alabastro",
  modalImage:
    "mt-5 max-h-64 w-full rounded-marca bg-crema object-contain",
  modalDescription: "mt-4 text-sm leading-7 text-ink-soft",
  modalFacts: "mt-5 grid gap-3 sm:grid-cols-2",
  modalFact:
    "rounded-marca border border-linea bg-crema px-3 py-2 text-sm text-ink-soft",
  modalOptional: "mt-5 space-y-2 border-t border-linea pt-4",
  modalOptionalItem: "text-sm text-ink-soft",
}
