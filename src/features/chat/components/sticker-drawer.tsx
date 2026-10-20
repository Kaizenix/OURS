'use client';

interface StickerDrawerProps {
  onSelectSticker: (stickerEmoji: string) => void;
  onClose: () => void;
}

const STICKER_PACKS = [
  {
    name: 'Love & Hugs',
    stickers: ['💖', '❤️‍🔥', '🥰', '🫂', '💋', '🥺', '💍', '💌', '🌹', '✨'],
  },
  {
    name: 'Cute & Mood',
    stickers: ['🐱', '🧸', '🐰', '🐼', '🐥', '😴', '🥳', '😭', '🤭', '🫠'],
  },
  {
    name: 'Daily Moments',
    stickers: ['☕', '🍕', '🍿', '🛵', '🎬', '🛌', '🍦', '🥂', '🌧️', '🌙'],
  },
];

export function StickerDrawer({ onSelectSticker, onClose }: StickerDrawerProps) {
  return (
    <div className="p-3 bg-card border-t border-border/40 select-none">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Stickers & Reaction
        </span>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Tutup
        </button>
      </div>

      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
        {STICKER_PACKS.map((pack) => (
          <div key={pack.name}>
            <p className="text-[10px] text-muted-foreground/70 mb-1">{pack.name}</p>
            <div className="grid grid-cols-5 gap-2">
              {pack.stickers.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    onSelectSticker(`[sticker:${s}]`);
                    onClose();
                  }}
                  className="h-11 rounded-2xl bg-surface/50 hover:bg-primary/10 active:scale-95 transition-all text-2xl flex items-center justify-center border border-border/20"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
