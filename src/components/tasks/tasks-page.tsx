'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  Download,
  Repeat,
  Filter,
} from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { isOverdue, getTaskUrgency, sortByDeadline } from '@/lib/utils/task-status';
import { generateICS, downloadICS } from '@/lib/utils/ics-export';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { RecurringTaskForm } from '@/components/tasks/recurring-task-form';
import type { TaskOccurrence } from '@/types';
import { STATUS_LABELS } from '@/types';

type TaskFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

const FILTER_LABELS: Record<TaskFilter, string> = {
  all: 'Semua',
  today: 'Hari Ini',
  upcoming: 'Mendatang',
  overdue: 'Terlambat',
  completed: 'Selesai',
};

export function TasksPage() {
  const {
    taskOccurrences,
    completeTask,
    updateTaskOccurrence,
    deleteTaskOccurrence,
    loading,
  } = useData();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskOccurrence | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');

  const today = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const filteredTasks = useMemo(() => {
    let tasks = [...taskOccurrences];

    switch (activeFilter) {
      case 'today':
        tasks = tasks.filter((t) => t.dueDate === today && t.status !== 'completed');
        break;
      case 'upcoming':
        tasks = tasks.filter((t) => t.dueDate >= today && t.status !== 'completed' && !isOverdue(t));
        break;
      case 'overdue':
        tasks = tasks.filter((t) => isOverdue(t));
        break;
      case 'completed':
        tasks = tasks.filter((t) => t.status === 'completed');
        break;
    }

    return sortByDeadline(tasks);
  }, [taskOccurrences, activeFilter, today]);

  const overdueCounts = useMemo(
    () => taskOccurrences.filter((t) => isOverdue(t)).length,
    [taskOccurrences]
  );

  const handleEdit = (task: TaskOccurrence) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteTaskOccurrence(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handleToggleComplete = useCallback(
    (task: TaskOccurrence) => {
      if (task.status === 'completed') {
        updateTaskOccurrence(task.id, { status: 'pending', completedAt: null });
      } else {
        completeTask(task.id);
      }
    },
    [completeTask, updateTaskOccurrence]
  );

  const handleExportICS = (task: TaskOccurrence) => {
    const ics = generateICS({
      title: task.title,
      description: task.description || task.notes || undefined,
      startDate: task.dueDate,
      startTime: task.dueTime,
      endTime: task.dueTime,
    });
    downloadICS(ics, `${task.title}.ics`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Tugas</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowRecurringForm(true)}>
            <Repeat className="h-4 w-4" />
            <span className="hidden sm:inline">Berulang</span>
          </Button>
          <Button size="sm" onClick={() => { setEditingTask(null); setShowTaskForm(true); }}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah</span>
          </Button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {(Object.keys(FILTER_LABELS) as TaskFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors relative ${
              activeFilter === filter
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            type="button"
          >
            {FILTER_LABELS[filter]}
            {filter === 'overdue' && overdueCounts > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {overdueCounts}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<Filter className="h-8 w-8" />}
          title={
            activeFilter === 'all'
              ? 'Belum ada tugas'
              : `Tidak ada tugas ${FILTER_LABELS[activeFilter].toLowerCase()}`
          }
          description={
            activeFilter === 'all'
              ? 'Tambahkan tugas pertamamu untuk memulai.'
              : undefined
          }
          action={
            activeFilter === 'all' ? (
              <Button size="sm" onClick={() => { setEditingTask(null); setShowTaskForm(true); }}>
                <Plus className="h-4 w-4" />
                Tambah Tugas
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const urgency = getTaskUrgency(task);
            const urgencyColors = {
              overdue: 'border-red-200',
              due_today: 'border-amber-200',
              due_soon: 'border-blue-200',
              upcoming: 'border-slate-200',
              completed: 'border-slate-200',
            };

            return (
              <div
                key={task.id}
                className={`group flex items-start gap-3 rounded-lg border bg-white p-3 hover:border-slate-300 transition-colors ${urgencyColors[urgency]}`}
              >
                <button
                  onClick={() => handleToggleComplete(task)}
                  className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                    task.status === 'completed'
                      ? 'border-slate-400 bg-slate-400'
                      : 'border-slate-300 hover:border-slate-500'
                  }`}
                  aria-label={
                    task.status === 'completed'
                      ? 'Tandai belum selesai'
                      : 'Tandai selesai'
                  }
                  type="button"
                >
                  {task.status === 'completed' && (
                    <svg
                      viewBox="0 0 12 12"
                      className="h-full w-full text-white p-0.5"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium truncate ${
                      task.status === 'completed'
                        ? 'text-slate-400 line-through'
                        : 'text-slate-900'
                    }`}
                  >
                    {task.title}
                    {task.templateId && (
                      <Repeat className="inline h-3 w-3 ml-1 text-slate-400" />
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                    <span className="text-xs text-slate-500">
                      {task.dueDate} {task.dueTime}
                    </span>
                    {urgency === 'overdue' && (
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        Terlambat
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {STATUS_LABELS[task.status]}
                    </span>
                  </div>
                  {task.courseName && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {task.courseName}
                    </p>
                  )}
                  {task.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => handleExportICS(task)}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Ekspor ke kalender"
                    type="button"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(task)}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Edit tugas"
                    type="button"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(task.id)}
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Hapus tugas"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskForm
        open={showTaskForm}
        onClose={() => { setShowTaskForm(false); setEditingTask(null); }}
        editingTask={editingTask}
      />
      <RecurringTaskForm
        open={showRecurringForm}
        onClose={() => setShowRecurringForm(false)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Tugas"
        message="Apakah kamu yakin ingin menghapus tugas ini?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
