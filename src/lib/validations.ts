import { z } from 'zod';

const dayValues = [
  'senin',
  'selasa',
  'rabu',
  'kamis',
  'jumat',
  'sabtu',
  'minggu',
] as const;

const reminderValues = [
  'ten_minutes',
  'thirty_minutes',
  'one_hour',
  'one_day',
] as const;

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const courseSchema = z.object({
  name: z.string().min(1, 'Nama mata kuliah wajib diisi').max(100),
  code: z.string().min(1, 'Kode mata kuliah wajib diisi').max(20),
  lecturer: z.string().max(100).default(''),
});

export const classScheduleSchema = z
  .object({
    courseId: z.string(),
    day: z.enum(dayValues),
    startTime: z.string(),
    endTime: z.string(),
    roomCode: z.string(),
    semesterStart: z.string(),
    semesterEnd: z.string(),
    reminderOffsets: z.array(z.enum(reminderValues)),
    notes: z.string(),
  });

export const taskOccurrenceSchema = z.object({
  title: z.string(),
  courseId: z.string(),
  description: z.string(),
  dueDate: z.string(),
  dueTime: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  reminderOffsets: z.array(z.enum(reminderValues)),
  notes: z.string(),
});

export const taskTemplateSchema = z.object({
  title: z.string(),
  courseId: z.string(),
  description: z.string(),
  deadlineTime: z.string(),
  deadlineDay: z.enum(dayValues),
  recurrenceRule: z.literal('weekly'),
  startDate: z.string(),
  endDate: z.string(),
  reminderOffsets: z.array(z.enum(reminderValues)),
});

export const noteSchema = z.object({
  title: z.string(),
  content: z.string(),
  type: z.enum(['course', 'task', 'general']),
  courseId: z.string(),
  taskId: z.string(),
});

export const specialEventSchema = z.object({
  title: z.string(),
  eventType: z.enum(['exam', 'quiz', 'presentation', 'other']),
  courseId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string(),
  description: z.string(),
  reminderOffsets: z.array(z.enum(reminderValues)),
});

export type CourseFormData = z.infer<typeof courseSchema>;
export type ClassScheduleFormData = {
  courseId: string;
  day: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';
  startTime: string;
  endTime: string;
  roomCode: string;
  semesterStart: string;
  semesterEnd: string;
  reminderOffsets: ('ten_minutes' | 'thirty_minutes' | 'one_hour' | 'one_day')[];
  notes: string;
};
export type TaskOccurrenceFormData = {
  title: string;
  courseId: string;
  description: string;
  dueDate: string;
  dueTime: string;
  status: 'pending' | 'in_progress' | 'completed';
  reminderOffsets: ('ten_minutes' | 'thirty_minutes' | 'one_hour' | 'one_day')[];
  notes: string;
};
export type TaskTemplateFormData = {
  title: string;
  courseId: string;
  description: string;
  deadlineTime: string;
  deadlineDay: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';
  recurrenceRule: 'weekly';
  startDate: string;
  endDate: string;
  reminderOffsets: ('ten_minutes' | 'thirty_minutes' | 'one_hour' | 'one_day')[];
};
export type NoteFormData = {
  title: string;
  content: string;
  type: 'course' | 'task' | 'general';
  courseId: string;
  taskId: string;
};
export type SpecialEventFormData = {
  title: string;
  eventType: 'exam' | 'quiz' | 'presentation' | 'other';
  courseId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  reminderOffsets: ('ten_minutes' | 'thirty_minutes' | 'one_hour' | 'one_day')[];
};
