import { describe, it, expect } from 'vitest';
import { generateWeeklyOccurrences, modifySingleOccurrence } from '@/lib/utils/recurrence';
import type { TaskTemplate, TaskOccurrence } from '@/types';

describe('Task Recurrence Utilities', () => {
  const sampleTemplate: TaskTemplate = {
    id: 'tmpl-1',
    userId: 'user-1',
    title: 'Tugas Pemrograman',
    courseId: 'course-1',
    courseName: 'Pemrograman Web',
    description: 'Kerjakan praktikum',
    deadlineTime: '23:59',
    deadlineDay: 'jumat',
    recurrenceRule: 'weekly',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    reminderOffsets: ['one_day'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('generates weekly occurrences between start and end date on the correct day', () => {
    const occurrences = generateWeeklyOccurrences(sampleTemplate, [], 'user-1');
    expect(occurrences.length).toBeGreaterThan(0);
    occurrences.forEach((occ) => {
      expect(occ.title).toBe('Tugas Pemrograman');
      expect(occ.templateId).toBe('tmpl-1');
      expect(occ.dueTime).toBe('23:59');
      const d = new Date(occ.dueDate + 'T00:00:00');
      expect(d.getDay()).toBe(5);
    });
  });

  it('is idempotent: running twice with existing occurrences adds zero duplicates', () => {
    const firstRun = generateWeeklyOccurrences(sampleTemplate, [], 'user-1');
    const secondRun = generateWeeklyOccurrences(sampleTemplate, firstRun, 'user-1');
    expect(secondRun.length).toBe(0);
  });

  it('does not generate occurrences if template is inactive', () => {
    const inactive: TaskTemplate = { ...sampleTemplate, isActive: false };
    const occurrences = generateWeeklyOccurrences(inactive, [], 'user-1');
    expect(occurrences.length).toBe(0);
  });

  it('modifies a single occurrence without affecting others', () => {
    const occurrences: TaskOccurrence[] = [
      {
        id: 'occ-1',
        userId: 'user-1',
        templateId: 'tmpl-1',
        title: 'Tugas Pemrograman',
        courseId: 'course-1',
        description: '',
        dueDate: '2026-10-02',
        dueTime: '23:59',
        status: 'pending',
        completedAt: null,
        reminderOffsets: [],
        notes: '',
        isModified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'occ-2',
        userId: 'user-1',
        templateId: 'tmpl-1',
        title: 'Tugas Pemrograman',
        courseId: 'course-1',
        description: '',
        dueDate: '2026-10-09',
        dueTime: '23:59',
        status: 'pending',
        completedAt: null,
        reminderOffsets: [],
        notes: '',
        isModified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const modified = modifySingleOccurrence(occurrences[0], { title: 'Tugas Revisi' });
    expect(modified.title).toBe('Tugas Revisi');
    expect(modified.isModified).toBe(true);
    expect(occurrences[1].title).toBe('Tugas Pemrograman');
    expect(occurrences[1].isModified).toBe(false);
  });
});
