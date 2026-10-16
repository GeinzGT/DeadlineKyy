'use client';

import { useState, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { classScheduleSchema, type ClassScheduleFormData } from '@/lib/validations';
import { useData } from '@/hooks/use-data';
import { parseRoomCode, formatParsedRoom } from '@/lib/utils/room-parser';
import type { ClassSchedule, DayOfWeek, ReminderOffset } from '@/types';
import { DAY_LABELS, DAY_ORDER } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ReminderPicker } from '@/components/ui/reminder-picker';

interface ScheduleFormProps {
  open: boolean;
  onClose: () => void;
  editingSchedule?: ClassSchedule | null;
}

export function ScheduleForm({ open, onClose, editingSchedule }: ScheduleFormProps) {
  const { courses, addSchedule, updateSchedule, addCourse } = useData();
  const [submitting, setSubmitting] = useState(false);
  const [reminderOffsets, setReminderOffsets] = useState<ReminderOffset[]>(
    editingSchedule?.reminderOffsets || []
  );
  const [roomPreview, setRoomPreview] = useState('');
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassScheduleFormData>({
    resolver: zodResolver(classScheduleSchema),
    defaultValues: editingSchedule
      ? {
          courseId: editingSchedule.courseId,
          day: editingSchedule.day,
          startTime: editingSchedule.startTime,
          endTime: editingSchedule.endTime,
          roomCode: editingSchedule.roomCode,
          semesterStart: editingSchedule.semesterStart,
          semesterEnd: editingSchedule.semesterEnd,
          reminderOffsets: editingSchedule.reminderOffsets,
          notes: editingSchedule.notes,
        }
      : {
          courseId: '',
          day: 'senin' as DayOfWeek,
          startTime: '08:00',
          endTime: '10:00',
          roomCode: '',
          semesterStart: '',
          semesterEnd: '',
          reminderOffsets: [],
          notes: '',
        },
  });

  const handleRoomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseRoomCode(e.target.value);
      setRoomPreview(parsed.parsed ? formatParsedRoom(parsed) : '');
    },
    []
  );

  const handleCreateCourse = useCallback(() => {
    if (!newCourseName.trim() || !newCourseCode.trim()) return;
    addCourse({
      name: newCourseName.trim(),
      code: newCourseCode.trim(),
      lecturer: '',
    });
    setNewCourseName('');
    setNewCourseCode('');
    setShowNewCourse(false);
  }, [newCourseName, newCourseCode, addCourse]);

  const onSubmit: SubmitHandler<ClassScheduleFormData> = (data) => {
    setSubmitting(true);
    try {
      const parsed = parseRoomCode(data.roomCode);
      const course = courses.find((c) => c.id === data.courseId);

      if (editingSchedule) {
        updateSchedule(editingSchedule.id, {
          ...data,
          parsedRoom: parsed.parsed ? parsed : null,
          courseName: course?.name,
          courseCode: course?.code,
          reminderOffsets,
          isCancelled: false,
        });
      } else {
        addSchedule({
          ...data,
          parsedRoom: parsed.parsed ? parsed : null,
          courseName: course?.name,
          courseCode: course?.code,
          reminderOffsets,
          isCancelled: false,
        });
      }
      reset();
      setReminderOffsets([]);
      setRoomPreview('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const dayOptions = DAY_ORDER.map((d) => ({
    value: d,
    label: DAY_LABELS[d],
  }));

  const courseOptions = courses.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Select
            label="Mata Kuliah"
            options={courseOptions}
            placeholder="Pilih mata kuliah"
            error={errors.courseId?.message}
            {...register('courseId')}
          />
          <button
            type="button"
            onClick={() => setShowNewCourse(!showNewCourse)}
            className="mt-1 text-xs text-slate-500 hover:text-slate-700 underline"
          >
            {showNewCourse ? 'Batal' : 'Buat mata kuliah baru'}
          </button>
        </div>

        {showNewCourse && (
          <div className="rounded-lg border border-slate-200 p-3 space-y-2">
            <Input
              label="Nama Mata Kuliah"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              placeholder="Contoh: Pemrograman Web"
            />
            <Input
              label="Kode Mata Kuliah"
              value={newCourseCode}
              onChange={(e) => setNewCourseCode(e.target.value)}
              placeholder="Contoh: IF3110"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleCreateCourse}
            >
              Simpan Mata Kuliah
            </Button>
          </div>
        )}

        <Select
          label="Hari"
          options={dayOptions}
          error={errors.day?.message}
          {...register('day')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Jam Mulai"
            type="time"
            error={errors.startTime?.message}
            {...register('startTime')}
          />
          <Input
            label="Jam Selesai"
            type="time"
            error={errors.endTime?.message}
            {...register('endTime')}
          />
        </div>

        <div>
          <Input
            label="Kode Ruangan"
            placeholder="Contoh: TULT 0701"
            error={errors.roomCode?.message}
            {...register('roomCode', { onChange: handleRoomChange })}
          />
          {roomPreview && (
            <p className="mt-1 text-xs text-slate-500">{roomPreview}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Mulai Semester"
            type="date"
            error={errors.semesterStart?.message}
            {...register('semesterStart')}
          />
          <Input
            label="Akhir Semester"
            type="date"
            error={errors.semesterEnd?.message}
            {...register('semesterEnd')}
          />
        </div>

        <ReminderPicker value={reminderOffsets} onChange={setReminderOffsets} />

        <Textarea
          label="Catatan"
          placeholder="Catatan tambahan..."
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button type="submit" loading={submitting} className="flex-1">
            {editingSchedule ? 'Simpan' : 'Tambah'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
