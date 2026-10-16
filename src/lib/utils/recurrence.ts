import type { TaskTemplate, TaskOccurrence, DayOfWeek } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const DAY_TO_JS: Record<DayOfWeek, number> = {
  minggu: 0,
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
  sabtu: 6,
};

function getNextDayOfWeek(
  from: Date,
  targetDay: number,
  inclusive: boolean
): Date {
  const d = new Date(from);
  const currentDay = d.getDay();
  let diff = targetDay - currentDay;
  if (diff < 0 || (diff === 0 && !inclusive)) diff += 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function generateWeeklyOccurrences(
  template: TaskTemplate,
  existingOccurrences: TaskOccurrence[],
  userId: string
): TaskOccurrence[] {
  if (!template.isActive) return [];

  const targetDay = DAY_TO_JS[template.deadlineDay];
  const startDate = new Date(template.startDate + 'T00:00:00');
  const endDate = new Date(template.endDate + 'T23:59:59');

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return [];
  if (startDate > endDate) return [];

  const existingDates = new Set(
    existingOccurrences
      .filter((o) => o.templateId === template.id)
      .map((o) => o.dueDate)
  );

  const newOccurrences: TaskOccurrence[] = [];
  let current = getNextDayOfWeek(startDate, targetDay, true);

  while (current <= endDate) {
    const dateStr = toDateString(current);

    if (!existingDates.has(dateStr)) {
      newOccurrences.push({
        id: uuidv4(),
        userId,
        templateId: template.id,
        title: template.title,
        courseId: template.courseId,
        courseName: template.courseName,
        description: template.description,
        dueDate: dateStr,
        dueTime: template.deadlineTime,
        status: 'pending',
        completedAt: null,
        reminderOffsets: [...template.reminderOffsets],
        notes: '',
        isModified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    current.setDate(current.getDate() + 7);
  }

  return newOccurrences;
}

export function stopRecurrence(
  template: TaskTemplate,
  stopDate: string
): TaskTemplate {
  return {
    ...template,
    endDate: stopDate,
    isActive: false,
    updatedAt: new Date().toISOString(),
  };
}

export function modifySingleOccurrence(
  occurrence: TaskOccurrence,
  changes: Partial<Pick<TaskOccurrence, 'title' | 'description' | 'dueTime' | 'notes' | 'reminderOffsets'>>
): TaskOccurrence {
  return {
    ...occurrence,
    ...changes,
    isModified: true,
    updatedAt: new Date().toISOString(),
  };
}

export function modifyFutureOccurrences(
  occurrences: TaskOccurrence[],
  fromDate: string,
  templateId: string,
  changes: Partial<Pick<TaskOccurrence, 'title' | 'description' | 'dueTime' | 'notes' | 'reminderOffsets'>>
): TaskOccurrence[] {
  return occurrences.map((o) => {
    if (o.templateId === templateId && o.dueDate >= fromDate && o.status !== 'completed') {
      return {
        ...o,
        ...changes,
        isModified: true,
        updatedAt: new Date().toISOString(),
      };
    }
    return o;
  });
}
