import Link from 'next/link';
import {
  Heart,
  History,
  Target,
  Calendar,
  UtensilsCrossed,
  Mail,
  BookOpen,
  MessageSquareHeart,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const US_SECTIONS = [
  {
    title: 'Our Story',
    subtitle: 'Two people, relationship duration, quote, and love languages',
    href: '/us/profile',
    icon: Heart,
    highlight: true,
  },
  {
    title: 'Relationship Timeline',
    subtitle: 'Milestones: first met, first date, trip, anniversary',
    href: '/us/timeline',
    icon: History,
  },
  {
    title: 'Goals Together',
    subtitle: 'Shared bucket list, travel plans, and adventures with checklists',
    href: '/us/goals',
    icon: Target,
  },
  {
    title: 'Couple Calendar',
    subtitle: 'Anniversaries, birthdays, dates, and countdowns',
    href: '/us/calendar',
    icon: Calendar,
  },
  {
    title: 'Date Planner',
    subtitle: 'Plan date ideas with location, budget, notes, and voting',
    href: '/us/dates',
    icon: UtensilsCrossed,
  },
  {
    title: 'Little Notes',
    subtitle: 'Sealed notes: "Open when you wake up", "Read when you are sad"',
    href: '/us/notes',
    icon: Mail,
  },
  {
    title: 'Relationship Journal',
    subtitle: 'Shared memories and private personal reflections',
    href: '/us/journal',
    icon: BookOpen,
  },
  {
    title: 'Talk Space',
    subtitle: 'A neutral, loving space to share perspectives without conflict',
    href: '/us/talk',
    icon: MessageSquareHeart,
  },
  {
    title: 'Relationship Growth',
    subtitle: 'Meaningful milestones you have built together, not a score',
    href: '/us/growth',
    icon: TrendingUp,
  },
];

export default async function UsHubPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let coupleName = 'Us';
  if (user) {
    const { data: member } = await supabase
      .from('couple_members')
      .select('couples(name)')
      .eq('user_id', user.id)
      .single();

    if (member?.couples && (member.couples as unknown as { name?: string }).name) {
      coupleName = (member.couples as unknown as { name: string }).name;
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-primary" />
          The Sanctuary
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif text-foreground mt-1">
          {coupleName}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md">
          Everything that belongs to just the two of you — your memories, plans, notes, and honest talks.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {US_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className={`group p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                section.highlight
                  ? 'bg-primary/10 border-primary/30 hover:border-primary/60'
                  : 'bg-surface/70 border-border/40 hover:border-primary/40'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-card border border-border/40 flex items-center justify-center text-primary mb-3.5 group-hover:scale-105 transition-transform shadow-2xs">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-medium text-foreground tracking-tight group-hover:text-primary transition-colors">
                  {section.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {section.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground group-hover:text-primary transition-colors">
                <span>Enter</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
