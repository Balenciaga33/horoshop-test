/** Formats integer UAH amounts like Horoshop UI: `199 грн`, `1 499 грн`. */
export function formatUah(amount: number): string {
  return `${amount.toLocaleString('uk-UA').replace(/[\u00A0\u202F]/g, ' ')} грн`;
}
