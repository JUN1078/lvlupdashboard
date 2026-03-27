// ─── Currency Formatters (IDR) ────────────────────────────────────────────────

const CURRENCY = 'Rp';

export function formatCurrency(value: number, decimals = 1): string {
  if (!isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) return `${CURRENCY} ${(value / 1_000_000_000_000).toFixed(decimals)}T`;
  if (abs >= 1_000_000_000) return `${CURRENCY} ${(value / 1_000_000_000).toFixed(decimals)}M`;
  if (abs >= 1_000_000) return `${CURRENCY} ${(value / 1_000_000).toFixed(0)}Jt`;
  if (abs >= 1_000) return `${CURRENCY} ${(value / 1_000).toFixed(0)}K`;
  return `${CURRENCY} ${value.toFixed(0)}`;
}

export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

// ─── Ratio & Percent Formatters ───────────────────────────────────────────────

export function formatRatio(value: number): string {
  if (!isFinite(value)) return '∞';
  return `${value.toFixed(2)}x`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// ─── Number Formatters ────────────────────────────────────────────────────────

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(Math.round(value));
}

export function formatCompact(value: number): string {
  if (!isFinite(value)) return '—';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}Jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
}

// ─── Date Formatters ──────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(timestampMs: number): string {
  const diff = Date.now() - timestampMs;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins}m lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}j lalu`;
  return `${Math.floor(hrs / 24)}h lalu`;
}

// ─── IDR Input Helpers ────────────────────────────────────────────────────────

/** Convert a "Juta" display value to full IDR */
export function jutaToIDR(juta: number): number {
  return juta * 1_000_000;
}

/** Convert a full IDR value to Juta for inputs */
export function idrToJuta(idr: number): number {
  return idr / 1_000_000;
}
