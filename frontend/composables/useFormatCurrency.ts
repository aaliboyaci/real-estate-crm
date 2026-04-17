export function useFormatCurrency() {
  function formatCents(cents: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(cents / 100);
  }

  function formatCentsShort(cents: number): string {
    const value = cents / 100;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return formatCents(cents);
  }

  return { formatCents, formatCentsShort };
}
