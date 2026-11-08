export function formatFee(amount: number | string | null, currency = 'PHP'): string {
  if (amount === null || amount === undefined || amount === '') return 'Free entry';
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(value) || value === 0) return 'Free entry';

  const formatted = new Intl.NumberFormat('en-PH', {
    maximumFractionDigits: 0,
  }).format(value);
  return currency === 'PHP' ? `₱${formatted}` : `${currency} ${formatted}`;
}

export function firstName(displayName: string): string {
  return displayName.trim().split(/\s+/)[0] ?? displayName;
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function memberSince(value: string): string {
  return new Date(value).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
}

export function initials(displayName: string): string {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}