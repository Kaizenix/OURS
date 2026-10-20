// ============================================================
// OURS — Date & Relationship Helper Utilities (Bahasa Indonesia)
// ============================================================

export function getGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Selamat pagi';

  if (hour >= 11 && hour < 15) {
    timeGreeting = 'Selamat siang';
  } else if (hour >= 15 && hour < 18) {
    timeGreeting = 'Selamat sore';
  } else if (hour >= 18 || hour < 5) {
    timeGreeting = 'Selamat malam';
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
      formatted: 'Awal kisah perjalanan kita',
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
      formatted: 'Hari ini',
    };
  }

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
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
  if (years > 0) parts.push(`${years} tahun`);
  if (months > 0) parts.push(`${months} bulan`);
  if (days > 0 || parts.length === 0) parts.push(`${days} hari`);

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
    return { label: 'Hari ini', daysLeft: 0, isToday: true };
  } else if (diffDays === 1) {
    return { label: 'Besok', daysLeft: 1, isToday: false };
  } else if (diffDays > 1) {
    return { label: `${diffDays} hari lagi`, daysLeft: diffDays, isToday: false };
  } else {
    return { label: `${Math.abs(diffDays)} hari lalu`, daysLeft: diffDays, isToday: false };
  }
}

export function formatDatePretty(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimePretty(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
