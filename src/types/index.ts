export type DayOfWeek =
  | 'senin'
  | 'selasa'
  | 'rabu'
  | 'kamis'
  | 'jumat'
  | 'sabtu'
  | 'minggu';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type RecurrenceRule = 'weekly';

export type ReminderOffset =
  | 'ten_minutes'
  | 'thirty_minutes'
  | 'one_hour'
  | 'one_day';

export type EventType = 'exam' | 'quiz' | 'presentation' | 'other';

export type NoteType = 'course' | 'task' | 'general';

export interface ParsedRoom {
  building: string;
  buildingAlias: string | null;
  floor: number;
  room: number;
  raw: string;
  parsed: boolean;
}

export interface Course {
  id: string;
  userId: string;
  name: string;
  code: string;
  lecturer: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSchedule {
  id: string;
  userId: string;
  courseId: string;
  courseName?: string;
  courseCode?: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  roomCode: string;
  parsedRoom: ParsedRoom | null;
  semesterStart: string;
  semesterEnd: string;
  reminderOffsets: ReminderOffset[];
  notes: string;
  isCancelled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleException {
  id: string;
  scheduleId: string;
  date: string;
  type: 'cancelled' | 'replacement' | 'modified';
  newStartTime?: string;
  newEndTime?: string;
  newRoomCode?: string;
  newParsedRoom?: ParsedRoom | null;
  notes?: string;
}

export interface TaskTemplate {
  id: string;
  userId: string;
  title: string;
  courseId: string;
  courseName?: string;
  description: string;
  deadlineTime: string;
  deadlineDay: DayOfWeek;
  recurrenceRule: RecurrenceRule;
  startDate: string;
  endDate: string;
  reminderOffsets: ReminderOffset[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskOccurrence {
  id: string;
  userId: string;
  templateId: string | null;
  title: string;
  courseId: string;
  courseName?: string;
  description: string;
  dueDate: string;
  dueTime: string;
  status: TaskStatus;
  completedAt: string | null;
  reminderOffsets: ReminderOffset[];
  notes: string;
  isModified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: NoteType;
  courseId: string;
  courseName?: string;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialEvent {
  id: string;
  userId: string;
  title: string;
  eventType: EventType;
  courseId: string;
  courseName?: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  reminderOffsets: ReminderOffset[];
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  referenceType: 'schedule' | 'task' | 'event';
  referenceId: string;
  reminderTime: string;
  isSent: boolean;
  createdAt: string;
}

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: string;
}

export const DAY_LABELS: Record<DayOfWeek, string> = {
  senin: 'Senin',
  selasa: 'Selasa',
  rabu: 'Rabu',
  kamis: 'Kamis',
  jumat: 'Jumat',
  sabtu: 'Sabtu',
  minggu: 'Minggu',
};

export const DAY_ORDER: DayOfWeek[] = [
  'senin',
  'selasa',
  'rabu',
  'kamis',
  'jumat',
  'sabtu',
  'minggu',
];

export const REMINDER_LABELS: Record<ReminderOffset, string> = {
  ten_minutes: '10 menit sebelumnya',
  thirty_minutes: '30 menit sebelumnya',
  one_hour: '1 jam sebelumnya',
  one_day: '1 hari sebelumnya',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  exam: 'Ujian',
  quiz: 'Kuis',
  presentation: 'Presentasi',
  other: 'Lainnya',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Belum Dikerjakan',
  in_progress: 'Sedang Dikerjakan',
  completed: 'Selesai',
};
