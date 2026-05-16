export const BALANCE_STORAGE_KEY = "nebulance_balance";
export const CURRENCY_SYMBOL = "N$";

/** Starting balance for a new expedition. */
export const startingBalance = 50;

/** Cost per refuel at a space station. */
export const REFUEL_COST = 10;

export function loadBalance(): number {
  const saved = localStorage.getItem(BALANCE_STORAGE_KEY);
  if (saved === null) return startingBalance;
  const n = parseFloat(saved);
  return Number.isFinite(n) ? Math.max(0, n) : startingBalance;
}

export function saveBalance(amount: number) {
  localStorage.setItem(BALANCE_STORAGE_KEY, String(Math.max(0, amount)));
}

export function formatPrice(amount: number): string {
  return `${amount}${CURRENCY_SYMBOL}`;
}
