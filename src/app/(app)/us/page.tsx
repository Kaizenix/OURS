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
    title: 'Kisah Kita',
    subtitle: 'Profil berdua, durasi hubungan, kutipan cinta, dan bahasa kasih',
    href: '/us/profile',
    icon: Heart,
    highlight: true,
  },
  {
    title: 'Garis Waktu Perjalanan',
    subtitle: 'Milestone penting: pertama jumpa, jadian, liburan pertama, dll',
    href: '/us/timeline',
    icon: History,
  },
  {
    title: 'Mimpi & Bucket List',
    subtitle: 'Rencana masa depan, impian bersama, dan petualangan berdua',
    href: '/us/goals',
    icon: Target,
  },
  {
    title: 'Kalender Pasangan',
    subtitle: 'Hari jadi, ulang tahun, kencan, dan hitung mundur momen penting',
    href: '/us/calendar',
    icon: Calendar,
  },
  {
    title: 'Perencana Kencan',
    subtitle: 'Ide kencan, lokasi, perkiraan budget, dan voting bersama',
    href: '/us/dates',
    icon: UtensilsCrossed,
  },
  {
    title: 'Surat Kecil Tersegel',
    subtitle: 'Pesan manis: "Buka saat rindu", "Buka besok pagi"',
    href: '/us/notes',
    icon: Mail,
  },
  {
    title: 'Catatan Hati',
    subtitle: 'Jurnal bersama dan ruang renungan pribadi yang aman',
    href: '/us/journal',
    icon: BookOpen,
  },
  {
    title: 'Ruang Bicara',
    subtitle: 'Sampaikan isi hati secara sehat dan terbuka tanpa saling menyalahkan',
    href: '/us/talk',
    icon: MessageSquareHeart,
  },
  {
    title: 'Tumbuh Bersama',
    subtitle: 'Jejak bermakna yang telah kalian bangun dan lewati berdua',
    href: '/us/growth',
    icon: TrendingUp,
  },
];

export default async function UsHubPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let coupleName = 'Ruang Privat Kita';
  if (user) {
    const { data: membership } = await supabase
      .from('couple_members')
      .select('couples(name)')
      .eq('user_id', user.id)
      .maybeSingle();

    if (membership?.couples) {
      const c = membership.couples as unknown as { name?: string };
      if (c.name) coupleName = c.name;
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
          Tentang Kita
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {coupleName} — ruang intim untuk mengenang, merencanakan, dan bertumbuh bersama.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {US_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className={`group flex flex-col justify-between p-4 rounded-3xl border transition-all active:scale-[0.98] ${
                section.highlight
                  ? 'bg-primary/5 border-primary/25 hover:border-primary/50'
                  : 'bg-card/70 border-border/40 hover:border-primary/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors ${
                      section.highlight
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted/40 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-serif text-sm font-medium text-foreground mb-1">
                  {section.title}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {section.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
