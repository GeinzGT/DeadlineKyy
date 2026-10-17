'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Clock,
  AlertTriangle,
  BookOpen,
  CalendarDays,
  ChevronRight,
} from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { getGreeting, getTodayString, formatDate, getCurrentDayOfWeek } from '@/lib/utils/helpers';
import { isOverdue, getTaskUrgency, sortByDeadline } from '@/lib/utils/task-status';
import { formatParsedRoom } from '@/lib/utils/room-parser';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ScheduleForm } from '@/components/schedule/schedule-form';
import { TaskForm } from '@/components/tasks/task-form';
import { EventForm } from '@/components/shared/event-form';
import type { ClassSchedule, TaskOccurrence } from '@/types';
import { DAY_LABELS } from '@/types';

function ScheduleCard({ schedule }: { schedule: ClassSchedule }) {
  const roomDisplay = schedule.parsedRoom?.parsed
    ? formatParsedRoom(schedule.parsedRoom)
    : schedule.roomCode || '-';

  return (
    <div className="group flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:shadow-md hover:border-indigo-200">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
        <BookOpen className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 truncate">
          {schedule.courseName || 'Mata Kuliah'}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
            <Clock className="h-3 w-3" />
            {schedule.startTime} - {schedule.endTime}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 truncate">{roomDisplay}</span>
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onComplete,
}: {
  task: TaskOccurrence;
  onComplete: (id: string) => void;
}) {
  const urgency = getTaskUrgency(task);
  const urgencyColors = {
    overdue: 'border-red-200 bg-red-50/70 shadow-xs',
    due_today: 'border-amber-200 bg-amber-50/70 shadow-xs',
    due_soon: 'border-indigo-100 bg-indigo-50/30',
    upcoming: 'border-slate-200/80 bg-white',
    completed: 'border-slate-200/60 bg-slate-50/50 opacity-75',
  };

  return (
    <div
      className={`group flex items-start gap-3.5 rounded-2xl border p-4 transition-all hover:shadow-md ${urgencyColors[urgency]}`}
    >
      <button
        onClick={() => onComplete(task.id)}
        className={`mt-0.5 h-5 w-5 shrink-0 rounded-lg border-2 transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
          task.status === 'completed'
            ? 'border-indigo-600 bg-indigo-600 text-white scale-105'
            : 'border-slate-300 hover:border-indigo-500 bg-white'
        }`}
        aria-label={
          task.status === 'completed' ? 'Tandai belum selesai' : 'Tandai selesai'
        }
        type="button"
      >
        {task.status === 'completed' && (
          <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 text-white">
            <path
              d="M2 6l3 3 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold truncate ${
            task.status === 'completed'
              ? 'text-slate-400 line-through font-normal'
              : 'text-slate-900'
          }`}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {task.dueDate} • {task.dueTime}
          </span>
          {urgency === 'overdue' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100/80 px-2 py-0.5 rounded-md">
              <AlertTriangle className="h-3 w-3" />
              Terlambat
            </span>
          )}
          {urgency === 'due_today' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
              Hari Ini!
            </span>
          )}
        </div>
        {task.courseName && (
          <p className="text-xs text-slate-400 mt-1 truncate">{task.courseName}</p>
        )}
      </div>
    </div>
  );
}

export function HomePage() {
  const { schedules, taskOccurrences, events, loading, completeTask } = useData();
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

  const today = getTodayString();
  const currentDay = getCurrentDayOfWeek();

  const todaySchedules = useMemo(
    () =>
      schedules
        .filter((s) => s.day === currentDay && !s.isCancelled)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [schedules, currentDay]
  );

  const [currentTimeStr] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  const nextClass = useMemo(
    () => todaySchedules.find((s) => s.startTime > currentTimeStr),
    [todaySchedules, currentTimeStr]
  );

  const activeTasks = useMemo(
    () => sortByDeadline(taskOccurrences.filter((t) => t.status !== 'completed')),
    [taskOccurrences]
  );

  const overdueTasks = useMemo(
    () => activeTasks.filter((t) => isOverdue(t)),
    [activeTasks]
  );

  const upcomingTasks = useMemo(
    () => activeTasks.filter((t) => !isOverdue(t)).slice(0, 5),
    [activeTasks]
  );

  const upcomingEvents = useMemo(
    () => events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3),
    [events, today]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {getGreeting()}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {formatDate(today)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setShowEventForm(true)}>
            <CalendarDays className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => setShowTaskForm(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tugas</span>
          </Button>
        </div>
      </div>

      {nextClass && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-medium text-slate-700">Kelas Berikutnya</h3>
          </div>
          <ScheduleCard schedule={nextClass} />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-700">
            Jadwal Hari Ini — {DAY_LABELS[currentDay]}
          </h3>
          <button
            onClick={() => setShowScheduleForm(true)}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-0.5"
            type="button"
          >
            Tambah <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        {todaySchedules.length === 0 ? (
          <EmptyState
            title="Tidak ada kelas hari ini"
            description="Tambahkan jadwal kuliah untuk melihatnya di sini."
            className="py-6"
          />
        ) : (
          <div className="space-y-2">
            {todaySchedules.map((s) => (
              <ScheduleCard key={s.id} schedule={s} />
            ))}
          </div>
        )}
      </div>

      {overdueTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Terlambat ({overdueTasks.length})
          </h3>
          <div className="space-y-2">
            {overdueTasks.map((t) => (
              <TaskCard key={t.id} task={t} onComplete={completeTask} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-slate-700 mb-2">
          Tugas Mendatang
        </h3>
        {upcomingTasks.length === 0 ? (
          <EmptyState
            title="Tidak ada tugas mendatang"
            description="Tambahkan tugas untuk memantau deadline."
            action={
              <Button size="sm" onClick={() => setShowTaskForm(true)}>
                <Plus className="h-4 w-4" />
                Tambah Tugas
              </Button>
            }
            className="py-6"
          />
        ) : (
          <div className="space-y-2">
            {upcomingTasks.map((t) => (
              <TaskCard key={t.id} task={t} onComplete={completeTask} />
            ))}
          </div>
        )}
      </div>

      {upcomingEvents.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            Agenda Mendatang
          </h3>
          <div className="space-y-2">
            {upcomingEvents.map((e) => (
              <div
                key={e.id}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {e.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {e.date} {e.startTime} - {e.endTime}
                  </p>
                  {e.courseName && (
                    <p className="text-xs text-slate-400 mt-0.5">{e.courseName}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ScheduleForm
        open={showScheduleForm}
        onClose={() => setShowScheduleForm(false)}
      />
      <TaskForm open={showTaskForm} onClose={() => setShowTaskForm(false)} />
      <EventForm open={showEventForm} onClose={() => setShowEventForm(false)} />
    </div>
  );
}
