import type {
  Course,
  ClassSchedule,
  TaskTemplate,
  TaskOccurrence,
  Note,
  SpecialEvent,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

const KEYS = {
  courses: 'deadline_courses',
  schedules: 'deadline_schedules',
  taskTemplates: 'deadline_task_templates',
  taskOccurrences: 'deadline_task_occurrences',
  notes: 'deadline_notes',
  events: 'deadline_events',
} as const;

const DEMO_USER_ID = 'demo-user';

function getItem<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setItem<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

export const storage = {
  courses: {
    getAll(): Course[] {
      return getItem<Course>(KEYS.courses);
    },
    getById(id: string): Course | undefined {
      return this.getAll().find((c) => c.id === id);
    },
    create(data: Omit<Course, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Course {
      const course: Course = {
        ...data,
        id: uuidv4(),
        userId: DEMO_USER_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const all = this.getAll();
      all.push(course);
      setItem(KEYS.courses, all);
      return course;
    },
    update(id: string, data: Partial<Course>): Course | null {
      const all = this.getAll();
      const idx = all.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
      setItem(KEYS.courses, all);
      return all[idx];
    },
    delete(id: string): boolean {
      const all = this.getAll();
      const filtered = all.filter((c) => c.id !== id);
      if (filtered.length === all.length) return false;
      setItem(KEYS.courses, filtered);
      return true;
    },
  },

  schedules: {
    getAll(): ClassSchedule[] {
      return getItem<ClassSchedule>(KEYS.schedules);
    },
    getById(id: string): ClassSchedule | undefined {
      return this.getAll().find((s) => s.id === id);
    },
    create(data: Omit<ClassSchedule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): ClassSchedule {
      const schedule: ClassSchedule = {
        ...data,
        id: uuidv4(),
        userId: DEMO_USER_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const all = this.getAll();
      all.push(schedule);
      setItem(KEYS.schedules, all);
      return schedule;
    },
    update(id: string, data: Partial<ClassSchedule>): ClassSchedule | null {
      const all = this.getAll();
      const idx = all.findIndex((s) => s.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
      setItem(KEYS.schedules, all);
      return all[idx];
    },
    delete(id: string): boolean {
      const all = this.getAll();
      const filtered = all.filter((s) => s.id !== id);
      if (filtered.length === all.length) return false;
      setItem(KEYS.schedules, filtered);
      return true;
    },
  },

  taskTemplates: {
    getAll(): TaskTemplate[] {
      return getItem<TaskTemplate>(KEYS.taskTemplates);
    },
    getById(id: string): TaskTemplate | undefined {
      return this.getAll().find((t) => t.id === id);
    },
    create(data: Omit<TaskTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): TaskTemplate {
      const template: TaskTemplate = {
        ...data,
        id: uuidv4(),
        userId: DEMO_USER_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const all = this.getAll();
      all.push(template);
      setItem(KEYS.taskTemplates, all);
      return template;
    },
    update(id: string, data: Partial<TaskTemplate>): TaskTemplate | null {
      const all = this.getAll();
      const idx = all.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
      setItem(KEYS.taskTemplates, all);
      return all[idx];
    },
    delete(id: string): boolean {
      const all = this.getAll();
      const filtered = all.filter((t) => t.id !== id);
      if (filtered.length === all.length) return false;
      setItem(KEYS.taskTemplates, filtered);
      return true;
    },
  },

  taskOccurrences: {
    getAll(): TaskOccurrence[] {
      return getItem<TaskOccurrence>(KEYS.taskOccurrences);
    },
    getById(id: string): TaskOccurrence | undefined {
      return this.getAll().find((t) => t.id === id);
    },
    create(data: Omit<TaskOccurrence, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): TaskOccurrence {
      const occurrence: TaskOccurrence = {
        ...data,
        id: uuidv4(),
        userId: DEMO_USER_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const all = this.getAll();
      all.push(occurrence);
      setItem(KEYS.taskOccurrences, all);
      return occurrence;
    },
    createMany(items: TaskOccurrence[]): void {
      const all = this.getAll();
      all.push(...items);
      setItem(KEYS.taskOccurrences, all);
    },
    update(id: string, data: Partial<TaskOccurrence>): TaskOccurrence | null {
      const all = this.getAll();
      const idx = all.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
      setItem(KEYS.taskOccurrences, all);
      return all[idx];
    },
    updateMany(items: TaskOccurrence[]): void {
      const all = this.getAll();
      const idMap = new Map(items.map((i) => [i.id, i]));
      const updated = all.map((o) => idMap.get(o.id) || o);
      setItem(KEYS.taskOccurrences, updated);
    },
    delete(id: string): boolean {
      const all = this.getAll();
      const filtered = all.filter((t) => t.id !== id);
      if (filtered.length === all.length) return false;
      setItem(KEYS.taskOccurrences, filtered);
      return true;
    },
  },

  notes: {
    getAll(): Note[] {
      return getItem<Note>(KEYS.notes);
    },
    getById(id: string): Note | undefined {
      return this.getAll().find((n) => n.id === id);
    },
    create(data: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Note {
      const note: Note = {
        ...data,
        id: uuidv4(),
        userId: DEMO_USER_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const all = this.getAll();
      all.push(note);
      setItem(KEYS.notes, all);
      return note;
    },
    update(id: string, data: Partial<Note>): Note | null {
      const all = this.getAll();
      const idx = all.findIndex((n) => n.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
      setItem(KEYS.notes, all);
      return all[idx];
    },
    delete(id: string): boolean {
      const all = this.getAll();
      const filtered = all.filter((n) => n.id !== id);
      if (filtered.length === all.length) return false;
      setItem(KEYS.notes, filtered);
      return true;
    },
  },

  events: {
    getAll(): SpecialEvent[] {
      return getItem<SpecialEvent>(KEYS.events);
    },
    getById(id: string): SpecialEvent | undefined {
      return this.getAll().find((e) => e.id === id);
    },
    create(data: Omit<SpecialEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): SpecialEvent {
      const event: SpecialEvent = {
        ...data,
        id: uuidv4(),
        userId: DEMO_USER_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const all = this.getAll();
      all.push(event);
      setItem(KEYS.events, all);
      return event;
    },
    update(id: string, data: Partial<SpecialEvent>): SpecialEvent | null {
      const all = this.getAll();
      const idx = all.findIndex((e) => e.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
      setItem(KEYS.events, all);
      return all[idx];
    },
    delete(id: string): boolean {
      const all = this.getAll();
      const filtered = all.filter((e) => e.id !== id);
      if (filtered.length === all.length) return false;
      setItem(KEYS.events, filtered);
      return true;
    },
  },
};
