/**
 * Format currency value safely for IDR
 * Handles string decimals from API without floating-point arithmetic
 */
export function formatCurrency(value: string | number): string {
  try {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(numValue || 0);
  } catch {
    return 'Rp0';
  }
}

/**
 * Format date to readable format
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format short date (day and month only)
 */
export function formatShortDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Get status badge styling
 */
export function getStatusStyles(status: string): { bg: string; text: string; dot: string } {
  const statusLower = status?.toLowerCase() || '';
  
  if (statusLower === 'success' || statusLower === 'active' || statusLower === 'approved') {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    };
  }
  
  if (statusLower === 'pending') {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
    };
  }
  
  if (statusLower === 'failed' || statusLower === 'rejected' || statusLower === 'cancelled') {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      dot: 'bg-red-500',
    };
  }
  
  return {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    dot: 'bg-slate-500',
  };
}

/**
 * Get transaction direction label and color
 */
export function getTransactionDirectionStyles(direction: string): { label: string; color: string; prefix: string } {
  const directionLower = direction?.toLowerCase() || '';
  
  if (directionLower === 'income' || directionLower === 'in') {
    return {
      label: 'Masuk',
      color: 'text-emerald-600',
      prefix: '+',
    };
  }
  
  return {
    label: 'Keluar',
    color: 'text-red-600',
    prefix: '-',
  };
}
