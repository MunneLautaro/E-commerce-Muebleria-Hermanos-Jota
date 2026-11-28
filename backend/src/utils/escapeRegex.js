export const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
