export const APP_NAME = 'OURS';
export const APP_DESCRIPTION = 'A place that\'s only ours.';

export const MOOD_OPTIONS = [
  { value: 'great', label: 'Great', emoji: '✨' },
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'okay', label: 'Okay', emoji: '🙂' },
  { value: 'tired', label: 'Tired', emoji: '😴' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'overwhelmed', label: 'Overwhelmed', emoji: '😰' },
  { value: 'angry', label: 'Angry', emoji: '😤' },
] as const;

export const NEED_OPTIONS = [
  { value: 'attention', label: 'Attention' },
  { value: 'space', label: 'Space' },
  { value: 'reassurance', label: 'Reassurance' },
  { value: 'affection', label: 'Affection' },
  { value: 'quality_time', label: 'Quality time' },
  { value: 'help', label: 'Help' },
  { value: 'just_listen', label: 'Just listen' },
  { value: 'nothing_specific', label: 'Nothing specific' },
] as const;

export const MEMORY_TAGS = [
  'First', 'Date', 'Travel', 'Random', 'Achievement', 
  'Favorite', 'Food', 'Special Day'
] as const;

export const GOAL_CATEGORIES = [
  { value: 'travel', label: 'Travel', icon: 'Plane' },
  { value: 'food', label: 'Food', icon: 'UtensilsCrossed' },
  { value: 'relationship', label: 'Relationship', icon: 'Heart' },
  { value: 'finance', label: 'Finance', icon: 'Wallet' },
  { value: 'personal', label: 'Personal', icon: 'User' },
  { value: 'adventure', label: 'Adventure', icon: 'Mountain' },
  { value: 'home', label: 'Home', icon: 'Home' },
  { value: 'random', label: 'Random', icon: 'Sparkles' },
] as const;

export const QUESTION_CATEGORIES = [
  'getting_to_know', 'love', 'communication', 'future',
  'memory', 'intimacy', 'fun', 'values', 'relationship',
  'conflict', 'goals', 'personal_growth'
] as const;
