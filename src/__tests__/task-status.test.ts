import { describe, it, expect } from 'vitest';
import { isOverdue, getTaskUrgency } from '@/lib/utils/task-status';
import type { TaskOccurrence } from '@/types';

describe('Task Status and Overdue Logic', () => {
  const baseTask: TaskOccurrence = {
    id: 't-1',
    userId: 'u-1',
    templateId: null,
    title: 'Test Task',
    courseId: 'c-1',
    description: '',
    dueDate: '2026-10-15',
    dueTime: '12:00',
    status: 'pending',
    completedAt: null,
    reminderOffsets: [],
    notes: '',
    isModified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('identifies overdue task when current time is past deadline', () => {
    const now = new Date('2026-10-15T13:00:00');
    expect(isOverdue(baseTask, now)).toBe(true);
    expect(getTaskUrgency(baseTask, now)).toBe('overdue');
  });

  it('identifies non-overdue task when current time is before deadline', () => {
    const now = new Date('2026-10-15T11:00:00');
    expect(isOverdue(baseTask, now)).toBe(false);
  });

  it('never marks completed tasks as overdue', () => {
    const completedTask: TaskOccurrence = {
      ...baseTask,
      status: 'completed',
    };
    const now = new Date('2026-10-16T13:00:00');
    expect(isOverdue(completedTask, now)).toBe(false);
    expect(getTaskUrgency(completedTask, now)).toBe('completed');
  });

  it('identifies due today correctly', () => {
    const todayTask: TaskOccurrence = {
      ...baseTask,
      dueDate: '2026-10-16',
      dueTime: '23:59',
    };
    const now = new Date('2026-10-16T10:00:00');
    expect(getTaskUrgency(todayTask, now)).toBe('due_today');
  });
});
