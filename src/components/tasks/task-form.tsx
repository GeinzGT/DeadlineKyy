'use client';

import { useState, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskOccurrenceSchema, type TaskOccurrenceFormData } from '@/lib/validations';
import { useData } from '@/hooks/use-data';
import type { TaskOccurrence, ReminderOffset } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ReminderPicker } from '@/components/ui/reminder-picker';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  editingTask?: TaskOccurrence | null;
}

export function TaskForm({ open, onClose, editingTask }: TaskFormProps) {
  const { courses, addTaskOccurrence, updateTaskOccurrence } = useData();
  const [submitting, setSubmitting] = useState(false);
  const [reminderOffsets, setReminderOffsets] = useState<ReminderOffset[]>(
    editingTask?.reminderOffsets || []
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskOccurrenceFormData>({
    resolver: zodResolver(taskOccurrenceSchema),
    defaultValues: editingTask
      ? {
          title: editingTask.title,
          courseId: editingTask.courseId,
          description: editingTask.description,
          dueDate: editingTask.dueDate,
          dueTime: editingTask.dueTime,
          status: editingTask.status,
          reminderOffsets: editingTask.reminderOffsets,
          notes: editingTask.notes,
        }
      : {
          title: '',
          courseId: '',
          description: '',
          dueDate: '',
          dueTime: '23:59',
          status: 'pending',
          reminderOffsets: [],
          notes: '',
        },
  });

  const onSubmit: SubmitHandler<TaskOccurrenceFormData> = useCallback(
    (data) => {
      setSubmitting(true);
      try {
        const course = courses.find((c) => c.id === data.courseId);
        if (editingTask) {
          updateTaskOccurrence(editingTask.id, {
            ...data,
            courseName: course?.name,
            reminderOffsets,
          });
        } else {
          addTaskOccurrence({
            ...data,
            templateId: null,
            courseName: course?.name,
            reminderOffsets,
            completedAt: null,
            isModified: false,
          });
        }
        reset();
        setReminderOffsets([]);
        onClose();
      } finally {
        setSubmitting(false);
      }
    },
    [courses, editingTask, addTaskOccurrence, updateTaskOccurrence, reminderOffsets, reset, onClose]
  );

  const courseOptions = courses.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));

  const statusOptions = [
    { value: 'pending', label: 'Belum Dikerjakan' },
    { value: 'in_progress', label: 'Sedang Dikerjakan' },
    { value: 'completed', label: 'Selesai' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingTask ? 'Edit Tugas' : 'Tambah Tugas'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Judul Tugas"
          placeholder="Contoh: Tugas 1 Pemrograman"
          error={errors.title?.message}
          {...register('title')}
        />

        <Select
          label="Mata Kuliah"
          options={courseOptions}
          placeholder="Pilih mata kuliah (opsional)"
          {...register('courseId')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Tanggal Tenggat"
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />
          <Input
            label="Jam Tenggat"
            type="time"
            error={errors.dueTime?.message}
            {...register('dueTime')}
          />
        </div>

        <Select
          label="Status"
          options={statusOptions}
          error={errors.status?.message}
          {...register('status')}
        />

        <Textarea
          label="Deskripsi"
          placeholder="Deskripsi tugas..."
          error={errors.description?.message}
          {...register('description')}
        />

        <ReminderPicker value={reminderOffsets} onChange={setReminderOffsets} />

        <Textarea
          label="Catatan"
          placeholder="Catatan tambahan..."
          {...register('notes')}
        />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button type="submit" loading={submitting} className="flex-1">
            {editingTask ? 'Simpan' : 'Tambah'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
