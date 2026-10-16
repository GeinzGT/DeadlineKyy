import type { TaskOccurrence } from '@/types';

export function isOverdue(task: TaskOccurrence, now?: Date): boolean {
  if (task.status === 'completed') return false;

  const currentTime = now || new Date();
  const deadlineStr = `${task.dueDate}T${task.dueTime}:00`;
  const deadline = new Date(deadlineStr);

  if (isNaN(deadline.getTime())) return false;

  return currentTime > deadline;
}

export function getTaskUrgency(
  task: TaskOccurrence,
  now?: Date
): 'overdue' | 'due_today' | 'due_soon' | 'upcoming' | 'completed' {
  if (task.status === 'completed') return 'completed';

  const currentTime = now || new Date();
  const deadlineStr = `${task.dueDate}T${task.dueTime}:00`;
  const deadline = new Date(deadlineStr);

  if (isNaN(deadline.getTime())) return 'upcoming';

  if (currentTime > deadline) return 'overdue';

  const today = new Date(currentTime);
  today.setHours(0, 0, 0, 0);
  const deadlineDay = new Date(deadline);
  deadlineDay.setHours(0, 0, 0, 0);

  if (deadlineDay.getTime() === today.getTime()) return 'due_today';

  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  if (deadlineDay <= threeDaysFromNow) return 'due_soon';

  return 'upcoming';
}

export function sortByDeadline(tasks: TaskOccurrence[]): TaskOccurrence[] {
  return [...tasks].sort((a, b) => {
    const dateA = `${a.dueDate}T${a.dueTime}`;
    const dateB = `${b.dueDate}T${b.dueTime}`;
    return dateA.localeCompare(dateB);
  });
}
