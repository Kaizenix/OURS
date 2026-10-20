'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import type { DatePlanStatus } from '@/types/database';
import type { DatePlanWithVotes } from '@/features/dates/actions';
import { formatDatePretty } from '@/lib/date-utils';
import {
  updateDatePlanStatusAction,
  voteDatePlanAction,
  deleteDatePlanAction,
} from '@/features/dates/actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DatePlanCardProps {
  plan: DatePlanWithVotes;
}

const STATUS_CONFIG: Record<DatePlanStatus, { label: string; color: string }> = {
  idea: { label: 'Idea', color: 'bg-muted/40 text-muted-foreground' },
  planned: { label: 'Planned', color: 'bg-primary/10 text-primary border-primary/20' },
  done: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

export function DatePlanCard({ plan }: DatePlanCardProps) {
  const [currentStatus, setCurrentStatus] = useState<DatePlanStatus>(plan.status);
  const [userVote, setUserVote] = useState<boolean | null | undefined>(plan.userVote);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (newStatus: DatePlanStatus) => {
    setCurrentStatus(newStatus);
    try {
      await updateDatePlanStatusAction(plan.id, newStatus);
    } catch {
      setCurrentStatus(currentStatus);
    }
  };

  const handleVote = async (vote: boolean) => {
    const nextVote = userVote === vote ? null : vote;
    setUserVote(nextVote);
    try {
      if (nextVote !== null) {
        await voteDatePlanAction(plan.id, nextVote);
      }
    } catch {
      setUserVote(userVote);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this date idea?')) return;
    setIsDeleting(true);
    try {
      await deleteDatePlanAction(plan.id);
    } catch {
      setIsDeleting(false);
    }
  };

  if (isDeleting) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-surface/70 border border-border/40 p-5 sm:p-6 backdrop-blur-sm shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
    >
      <div>
        {/* Status + Delete */}
        <div className="flex items-center justify-between mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border/40 transition-colors">
              <span className={`w-1.5 h-1.5 rounded-full ${currentStatus === 'done' ? 'bg-emerald-400' : 'bg-primary'}`} />
              <span>{STATUS_CONFIG[currentStatus]?.label || currentStatus}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-2xl text-xs">
              {(['idea', 'planned', 'done'] as DatePlanStatus[]).map((st) => (
                <DropdownMenuItem
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className="capitalize text-xs cursor-pointer"
                >
                  {STATUS_CONFIG[st].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={handleDelete}
            className="p-1 rounded-full text-muted-foreground/30 hover:text-destructive transition-colors"
            title="Delete date idea"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-serif font-medium text-foreground tracking-tight">
          {plan.title}
        </h3>

        {/* Date / Location / Budget Details */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
          {plan.planned_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-primary/70" />
              {formatDatePretty(plan.planned_date)}
              {plan.planned_time && ` at ${plan.planned_time}`}
            </span>
          )}

          {plan.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary/70" />
              {plan.location}
            </span>
          )}

          {plan.budget && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-primary/70" />
              {plan.budget}
            </span>
          )}
        </div>

        {/* Notes */}
        {plan.notes && (
          <p className="text-xs sm:text-sm text-secondary-foreground/80 mt-2.5 font-serif leading-relaxed italic">
            &ldquo;{plan.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Voting Section */}
      <div className="pt-3 border-t border-border/20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-medium">Your vote:</span>
          <button
            onClick={() => handleVote(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors ${
              userVote === true
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-card/40 border-border/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            <span>I&apos;m in!</span>
          </button>

          <button
            onClick={() => handleVote(false)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors ${
              userVote === false
                ? 'bg-destructive/15 border-destructive/40 text-destructive'
                : 'bg-card/40 border-border/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            <ThumbsDown className="w-3 h-3" />
            <span>Pass</span>
          </button>
        </div>

        {/* Partner Vote Status Indicator */}
        <div className="text-[11px] text-muted-foreground">
          {plan.partnerVote === true ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              Partner voted Yes
            </span>
          ) : plan.partnerVote === false ? (
            <span className="text-muted-foreground flex items-center gap-1">
              <ThumbsDown className="w-3 h-3" />
              Partner passed
            </span>
          ) : (
            <span className="italic opacity-60">Awaiting partner&apos;s vote</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
