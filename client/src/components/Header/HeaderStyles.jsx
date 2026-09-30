export const headerStyles = {
  root: "sticky top-0 z-50 w-full border-b border-linea bg-crema/85 backdrop-blur-md transition-shadow duration-300",
  rootScrolled: "shadow-marca",
  inner:
    "mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-6 px-6",

  brand: "flex items-center gap-3",
  logoMark:
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-siena bg-crema font-display text-lg font-bold text-siena",
  brandName:
    "hidden font-display text-base font-normal uppercase tracking-[0.25em] text-ink sm:block",

  nav: "hidden items-center gap-9 lg:flex",
  link: {
    base: "relative py-2 text-sm font-medium uppercase tracking-cta transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-siena after:transition-transform after:duration-300 hover:text-siena hover:after:scale-x-100",
    active: "text-siena after:scale-x-100",
    inactive: "text-ink-soft",
  },

  actions: "hidden items-center gap-3 lg:flex",
  buttonPrimary:
    "inline-flex items-center justify-center rounded-marca bg-siena px-6 py-2.5 text-sm font-medium uppercase tracking-cta text-white transition-colors hover:bg-ink",
  buttonSecondary:
    "inline-flex items-center justify-center rounded-marca border border-siena px-6 py-2.5 text-sm font-medium uppercase tracking-cta text-siena transition-colors hover:bg-alabastro",

  menuButton:
    "inline-flex h-11 w-11 items-center justify-center rounded-marca border border-linea text-siena transition-colors hover:bg-alabastro lg:hidden",
  menuIcon: "h-6 w-6",

  mobilePanel: "border-t border-linea bg-crema lg:hidden",
  mobileInner: "mx-auto flex w-full max-w-6xl flex-col px-6 pb-8 pt-2",
  mobileLink: {
    base: "border-b border-linea py-4 text-sm font-medium uppercase tracking-cta transition-colors hover:text-siena",
    active: "text-siena",
    inactive: "text-ink-soft",
  },
  mobileActions: "mt-6 flex flex-col gap-3",
}
