'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  Course,
  ClassSchedule,
  TaskTemplate,
  TaskOccurrence,
  Note,
  SpecialEvent,
} from '@/types';
import { storage } from '@/lib/storage/local-storage';
import { generateWeeklyOccurrences } from '@/lib/utils/recurrence';

interface DataContextValue {
  courses: Course[];
  schedules: ClassSchedule[];
  taskTemplates: TaskTemplate[];
  taskOccurrences: TaskOccurrence[];
  notes: Note[];
  events: SpecialEvent[];
  loading: boolean;

  addCourse: (data: Omit<Course, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Course;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  addSchedule: (data: Omit<ClassSchedule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => ClassSchedule;
  updateSchedule: (id: string, data: Partial<ClassSchedule>) => void;
  deleteSchedule: (id: string) => void;

  addTaskTemplate: (data: Omit<TaskTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => TaskTemplate;
  updateTaskTemplate: (id: string, data: Partial<TaskTemplate>) => void;
  deleteTaskTemplate: (id: string) => void;
  generateOccurrences: (templateId: string) => void;

  addTaskOccurrence: (data: Omit<TaskOccurrence, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => TaskOccurrence;
  updateTaskOccurrence: (id: string, data: Partial<TaskOccurrence>) => void;
  deleteTaskOccurrence: (id: string) => void;
  completeTask: (id: string) => void;

  addNote: (data: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  addEvent: (data: Omit<SpecialEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => SpecialEvent;
  updateEvent: (id: string, data: Partial<SpecialEvent>) => void;
  deleteEvent: (id: string) => void;

  refresh: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(() => storage.courses.getAll());
  const [schedules, setSchedules] = useState<ClassSchedule[]>(() => storage.schedules.getAll());
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>(() => storage.taskTemplates.getAll());
  const [taskOccurrences, setTaskOccurrences] = useState<TaskOccurrence[]>(() => storage.taskOccurrences.getAll());
  const [notes, setNotes] = useState<Note[]>(() => storage.notes.getAll());
  const [events, setEvents] = useState<SpecialEvent[]>(() => storage.events.getAll());
  const [loading, setLoading] = useState(false);

  const addCourse = useCallback(
    (data: Omit<Course, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const course = storage.courses.create(data);
      setCourses(storage.courses.getAll());
      return course;
    },
    []
  );

  const updateCourse = useCallback((id: string, data: Partial<Course>) => {
    storage.courses.update(id, data);
    setCourses(storage.courses.getAll());
  }, []);

  const deleteCourse = useCallback((id: string) => {
    storage.courses.delete(id);
    setCourses(storage.courses.getAll());
  }, []);

  const addSchedule = useCallback(
    (data: Omit<ClassSchedule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const schedule = storage.schedules.create(data);
      setSchedules(storage.schedules.getAll());
      return schedule;
    },
    []
  );

  const updateSchedule = useCallback(
    (id: string, data: Partial<ClassSchedule>) => {
      storage.schedules.update(id, data);
      setSchedules(storage.schedules.getAll());
    },
    []
  );

  const deleteSchedule = useCallback((id: string) => {
    storage.schedules.delete(id);
    setSchedules(storage.schedules.getAll());
  }, []);

  const addTaskTemplate = useCallback(
    (data: Omit<TaskTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const template = storage.taskTemplates.create(data);
      setTaskTemplates(storage.taskTemplates.getAll());
      const existing = storage.taskOccurrences.getAll();
      const newOccurrences = generateWeeklyOccurrences(
        template,
        existing,
        'demo-user'
      );
      if (newOccurrences.length > 0) {
        storage.taskOccurrences.createMany(newOccurrences);
        setTaskOccurrences(storage.taskOccurrences.getAll());
      }
      return template;
    },
    []
  );

  const updateTaskTemplate = useCallback(
    (id: string, data: Partial<TaskTemplate>) => {
      storage.taskTemplates.update(id, data);
      setTaskTemplates(storage.taskTemplates.getAll());
    },
    []
  );

  const deleteTaskTemplate = useCallback((id: string) => {
    storage.taskTemplates.update(id, { isActive: false });
    setTaskTemplates(storage.taskTemplates.getAll());
  }, []);

  const generateOccurrencesForTemplate = useCallback((templateId: string) => {
    const template = storage.taskTemplates.getById(templateId);
    if (!template) return;
    const existing = storage.taskOccurrences.getAll();
    const newOccurrences = generateWeeklyOccurrences(
      template,
      existing,
      'demo-user'
    );
    if (newOccurrences.length > 0) {
      storage.taskOccurrences.createMany(newOccurrences);
      setTaskOccurrences(storage.taskOccurrences.getAll());
    }
  }, []);

  const addTaskOccurrence = useCallback(
    (data: Omit<TaskOccurrence, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const occurrence = storage.taskOccurrences.create(data);
      setTaskOccurrences(storage.taskOccurrences.getAll());
      return occurrence;
    },
    []
  );

  const updateTaskOccurrence = useCallback(
    (id: string, data: Partial<TaskOccurrence>) => {
      storage.taskOccurrences.update(id, data);
      setTaskOccurrences(storage.taskOccurrences.getAll());
    },
    []
  );

  const deleteTaskOccurrence = useCallback((id: string) => {
    storage.taskOccurrences.delete(id);
    setTaskOccurrences(storage.taskOccurrences.getAll());
  }, []);

  const completeTask = useCallback((id: string) => {
    storage.taskOccurrences.update(id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    setTaskOccurrences(storage.taskOccurrences.getAll());
  }, []);

  const addNote = useCallback(
    (data: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const note = storage.notes.create(data);
      setNotes(storage.notes.getAll());
      return note;
    },
    []
  );

  const updateNote = useCallback((id: string, data: Partial<Note>) => {
    storage.notes.update(id, data);
    setNotes(storage.notes.getAll());
  }, []);

  const deleteNote = useCallback((id: string) => {
    storage.notes.delete(id);
    setNotes(storage.notes.getAll());
  }, []);

  const addEvent = useCallback(
    (data: Omit<SpecialEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const event = storage.events.create(data);
      setEvents(storage.events.getAll());
      return event;
    },
    []
  );

  const updateEvent = useCallback(
    (id: string, data: Partial<SpecialEvent>) => {
      storage.events.update(id, data);
      setEvents(storage.events.getAll());
    },
    []
  );

  const deleteEvent = useCallback((id: string) => {
    storage.events.delete(id);
    setEvents(storage.events.getAll());
  }, []);

  return (
    <DataContext.Provider
      value={{
        courses,
        schedules,
        taskTemplates,
        taskOccurrences,
        notes,
        events,
        loading,
        addCourse,
        updateCourse,
        deleteCourse,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        addTaskTemplate,
        updateTaskTemplate,
        deleteTaskTemplate,
        generateOccurrences: generateOccurrencesForTemplate,
        addTaskOccurrence,
        updateTaskOccurrence,
        deleteTaskOccurrence,
        completeTask,
        addNote,
        updateNote,
        deleteNote,
        addEvent,
        updateEvent,
        deleteEvent,
        refresh: () => {
          setCourses(storage.courses.getAll());
          setSchedules(storage.schedules.getAll());
          setTaskTemplates(storage.taskTemplates.getAll());
          setTaskOccurrences(storage.taskOccurrences.getAll());
          setNotes(storage.notes.getAll());
          setEvents(storage.events.getAll());
        },
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
