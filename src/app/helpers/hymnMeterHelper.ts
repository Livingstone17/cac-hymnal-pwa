export function normalizeMeter(meter?: string | null) {
  return (meter ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[.,;:]/g, "")
    .trim();
}
