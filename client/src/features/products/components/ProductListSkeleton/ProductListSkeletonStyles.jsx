export const productListSkeletonStyles = {
  card: "h-full animate-pulse overflow-hidden rounded-marca border border-linea bg-white shadow-tarjeta",
  image: (compact) => (compact ? "h-64 w-full bg-crema sm:h-52" : "h-64 w-full bg-crema"),
  content: (compact) => (compact ? "space-y-2 px-3 pb-3 pt-2" : "space-y-3 p-5"),
  title: "h-6 w-3/4 rounded bg-linea",
  price: "h-5 w-1/3 rounded bg-linea",
  line: "h-3 w-full rounded bg-linea",
  shortLine: "h-3 w-2/3 rounded bg-linea",
}
