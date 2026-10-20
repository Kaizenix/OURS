// ============================================================
// OURS — Date & Relationship Helper Utilities
// ============================================================

export function getGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';

  if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (hour >= 17 && hour < 22) {
    timeGreeting = 'Good evening';
  } else if (hour >= 22 || hour < 5) {
    timeGreeting = 'Good night';
  }

  return name ? `${timeGreeting}, ${name}` : timeGreeting;
}

export interface RelationshipDuration {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  formatted: string;
}

export function calculateRelationshipDuration(startDateStr: string | null | undefined): RelationshipDuration {
  if (!startDateStr) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      formatted: 'Just began our journey',
    };
  }

  const start = new Date(startDateStr);
  const now = new Date();

  if (isNaN(start.getTime()) || start > now) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      formatted: 'Today',
    };
  }

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    // Days in previous month
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const diffTime = Math.abs(now.getTime() - start.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);

  return {
    years,
    months,
    days,
    totalDays,
    formatted: parts.join(', '),
  };
}

export function formatEventCountdown(targetDateStr: string): { label: string; daysLeft: number; isToday: boolean } {
  const target = new Date(targetDateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { label: 'Today', daysLeft: 0, isToday: true };
  } else if (diffDays === 1) {
    return { label: 'Tomorrow', daysLeft: 1, isToday: false };
  } else if (diffDays > 1) {
    return { label: `${diffDays} days left`, daysLeft: diffDays, isToday: false };
  } else {
    return { label: `${Math.abs(diffDays)} days ago`, daysLeft: diffDays, isToday: false };
  }
}

export function formatDatePretty(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimePretty(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
