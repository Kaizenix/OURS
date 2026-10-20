'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  ChevronDown,
  Plane,
  UtensilsCrossed,
  Heart,
  Wallet,
  User,
  Mountain,
  Home,
  Sparkles,
} from 'lucide-react';
import type { GoalWithTasks, GoalStatus, GoalCategory } from '@/types/database';
import { formatDatePretty } from '@/lib/date-utils';
import {
  updateGoalStatusAction,
  toggleGoalTaskAction,
  addGoalTaskAction,
  deleteGoalAction,
} from '@/features/goals/actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface GoalCardProps {
  goal: GoalWithTasks;
}

const CATEGORY_ICONS: Record<GoalCategory, React.ElementType> = {
  travel: Plane,
  food: UtensilsCrossed,
  relationship: Heart,
  finance: Wallet,
  personal: User,
  adventure: Mountain,
  home: Home,
  random: Sparkles,
};

const STATUS_LABELS: Record<GoalStatus, { label: string; color: string }> = {
  someday: { label: 'Someday', color: 'bg-muted/50 text-muted-foreground' },
  planning: { label: 'Planning', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

export function GoalCard({ goal }: GoalCardProps) {
  const [tasks, setTasks] = useState(goal.tasks || []);
  const [currentStatus, setCurrentStatus] = useState<GoalStatus>(goal.status);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const Icon = CATEGORY_ICONS[goal.category] || Sparkles;

  const handleToggleTask = async (taskId: string, isDone: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_completed: !isDone } : t))
    );
    try {
      await toggleGoalTaskAction(taskId, isDone);
    } catch {
      // revert
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, is_completed: isDone } : t))
      );
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const tempTitle = newTaskTitle.trim();
    setNewTaskTitle('');
    setShowAddTask(false);

    try {
      await addGoalTaskAction(goal.id, tempTitle);
      // reload tasks or optimistic
      setTasks((prev) => [
        ...prev,
        {
          id: 'temp-' + Date.now(),
          goal_id: goal.id,
          title: tempTitle,
          is_completed: false,
          completed_by: null,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleStatusChange = async (newStatus: GoalStatus) => {
    setCurrentStatus(newStatus);
    try {
      await updateGoalStatusAction(goal.id, newStatus);
    } catch {
      setCurrentStatus(currentStatus);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this shared goal?')) return;
    setIsDeleting(true);
    try {
      await deleteGoalAction(goal.id);
    } catch {
      setIsDeleting(false);
    }
  };

  if (isDeleting) return null;

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-surface/70 border border-border/40 p-5 sm:p-6 backdrop-blur-sm shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
    >
      <div>
        {/* Top: Category Icon + Status Dropdown */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium capitalize">
              {goal.category}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border/40 transition-colors">
                <span className={`w-1.5 h-1.5 rounded-full ${currentStatus === 'completed' ? 'bg-emerald-400' : 'bg-primary'}`} />
                <span>{STATUS_LABELS[currentStatus]?.label || currentStatus}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl text-xs">
                {(['someday', 'planning', 'in_progress', 'completed'] as GoalStatus[]).map((st) => (
                  <DropdownMenuItem
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className="capitalize text-xs cursor-pointer"
                  >
                    {STATUS_LABELS[st].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={handleDelete}
              className="p-1 rounded-full text-muted-foreground/30 hover:text-destructive transition-colors ml-1"
              title="Delete goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Goal Title */}
        <h3 className="text-lg font-serif font-medium text-foreground tracking-tight">
          {goal.title}
        </h3>

        {/* Description */}
        {goal.description && (
          <p className="text-xs sm:text-sm text-secondary-foreground/80 mt-1.5 leading-relaxed font-serif">
            {goal.description}
          </p>
        )}

        {/* Target Date */}
        {goal.target_date && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
            <Calendar className="w-3.5 h-3.5 text-primary/70" />
            <span>Target: {formatDatePretty(goal.target_date)}</span>
          </div>
        )}

        {/* Progress Bar if tasks exist */}
        {tasks.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Checklist</span>
              <span className="font-mono">{completedCount}/{tasks.length} done</span>
            </div>
            <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Checklist items */}
        <div className="mt-4 space-y-2">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => handleToggleTask(task.id, task.is_completed)}
              className="flex items-center gap-2.5 text-left w-full text-xs group cursor-pointer"
            >
              {task.is_completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary shrink-0" />
              )}
              <span
                className={`transition-colors ${
                  task.is_completed
                    ? 'line-through text-muted-foreground/60'
                    : 'text-foreground/90'
                }`}
              >
                {task.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Task input/button */}
      <div className="pt-2 border-t border-border/20">
        {showAddTask ? (
          <form onSubmit={handleAddTask} className="flex gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add step (e.g. Book train)..."
              className="h-8 rounded-xl text-xs bg-background/50 border-border/40"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddTask(false)}
              className="px-1 text-xs text-muted-foreground"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add step to checklist</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
