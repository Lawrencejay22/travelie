export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-PH').format(value);
}

export function formatFee(amount: string | number | null, currency = 'PHP'): string {
  if (amount === null || amount === undefined || amount === '') return 'Free';
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(value) || value === 0) return 'Free';
  const formatted = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 0 }).format(value);
  return currency === 'PHP' ? `₱${formatted}` : `${currency} ${formatted}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}