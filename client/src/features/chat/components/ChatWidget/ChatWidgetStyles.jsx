export const chatWidgetStyles = {
  launcher:
    "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-siena text-white shadow-lg transition-transform hover:scale-105 hover:bg-ink",
  panel:
    "fixed bottom-6 right-6 z-50 flex h-[min(620px,calc(100vh-3rem))] w-[min(380px,calc(100vw-3rem))] flex-col overflow-hidden rounded-marca border border-linea bg-crema shadow-2xl",
  header:
    "flex items-center justify-between bg-siena px-5 py-4 text-white",
  title: "font-display text-lg",
  close:
    "rounded-full p-1 text-white transition-colors hover:bg-white/15",
  messages: "flex-1 space-y-4 overflow-y-auto p-4",
  message: "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
  userMessage: "ml-auto rounded-br-sm bg-siena text-white",
  assistantMessage: "rounded-bl-sm bg-white text-ink shadow-sm",
  form: "border-t border-linea bg-white p-3",
  input:
    "min-h-11 w-full resize-none rounded-marca border border-linea bg-crema px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-siena focus:outline-none",
  submit:
    "mt-2 w-full rounded-marca bg-siena px-4 py-2.5 text-xs font-medium uppercase tracking-cta text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50",
  error: "px-4 text-xs text-error",
  typing: "text-xs italic text-ink-soft",
}
