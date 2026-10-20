export const APP_NAME = 'OURS';
export const APP_DESCRIPTION = 'Ruang digital privat berdua.';

export const MOOD_OPTIONS = [
  { value: 'great', label: 'Luar Biasa', emoji: '✨' },
  { value: 'happy', label: 'Bahagia', emoji: '😊' },
  { value: 'okay', label: 'Biasa Saja', emoji: '🙂' },
  { value: 'tired', label: 'Lelah', emoji: '😴' },
  { value: 'sad', label: 'Sedih', emoji: '😢' },
  { value: 'overwhelmed', label: 'Kewalahan', emoji: '😰' },
  { value: 'angry', label: 'Kesal', emoji: '😤' },
] as const;

export const NEED_OPTIONS = [
  { value: 'attention', label: 'Perhatian' },
  { value: 'space', label: 'Ruang Sendiri' },
  { value: 'reassurance', label: 'Menenangkan Hati' },
  { value: 'affection', label: 'Pelukan & Kasih Sayang' },
  { value: 'quality_time', label: 'Waktu Bersama' },
  { value: 'help', label: 'Bantuan' },
  { value: 'just_listen', label: 'Cukup Dengarkan' },
  { value: 'nothing_specific', label: 'Tidak ada yang khusus' },
] as const;

export const MEMORY_TAGS = [
  'Pertama Kali', 'Kencan', 'Liburan', 'Spontan', 'Pencapaian', 
  'Favorit', 'Kuliner', 'Hari Spesial'
] as const;

export const GOAL_CATEGORIES = [
  { value: 'travel', label: 'Liburan', icon: 'Plane' },
  { value: 'food', label: 'Kuliner', icon: 'UtensilsCrossed' },
  { value: 'relationship', label: 'Hubungan', icon: 'Heart' },
  { value: 'finance', label: 'Keuangan', icon: 'Wallet' },
  { value: 'personal', label: 'Pribadi', icon: 'User' },
  { value: 'adventure', label: 'Petualangan', icon: 'Mountain' },
  { value: 'home', label: 'Rumah Impian', icon: 'Home' },
  { value: 'random', label: 'Acak', icon: 'Sparkles' },
] as const;

export const QUESTION_CATEGORIES = [
  'getting_to_know', 'love', 'communication', 'future',
  'memory', 'intimacy', 'fun', 'values', 'relationship',
  'conflict', 'goals', 'personal_growth'
] as const;
