export function formatCurrency(
  amount?: number | null,
  currencySymbol?: string | null,
  currencyCode?: string | null,
): string {
  const num = Number(amount ?? 0);

  if (Number.isNaN(num)) {
    return `${currencySymbol ?? '$'}0.00`;
  }

  const parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = parts.join('.');

  const symbol = currencySymbol ?? (currencyCode ? currencyCode + ' ' : '$');

  return `${symbol}${formatted}`;
}

export interface StatusColorResult {
  backgroundColor: string;
  textColor: string;
}

export function getStatusColor(status?: string): StatusColorResult {
  const normalized = String(status ?? '')
    .toLowerCase()
    .trim();

  switch (normalized) {
    case 'overdue':
      return { backgroundColor: '#FEE2E2', textColor: '#DC2626' };
    case 'due':
      return { backgroundColor: '#DBEAFE', textColor: '#2563EB' };
    case 'paid':
      return { backgroundColor: '#DCFCE7', textColor: '#16A34A' };
    default:
      return { backgroundColor: '#F3F4F6', textColor: '#6B7280' };
  }
}

export default formatCurrency;
