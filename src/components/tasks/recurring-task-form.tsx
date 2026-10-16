'use client';

import { useState, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskTemplateSchema, type TaskTemplateFormData } from '@/lib/validations';
import { useData } from '@/hooks/use-data';
import type { ReminderOffset, DayOfWeek } from '@/types';
import { DAY_LABELS, DAY_ORDER } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ReminderPicker } from '@/components/ui/reminder-picker';

interface RecurringTaskFormProps {
  open: boolean;
  onClose: () => void;
}

export function RecurringTaskForm({ open, onClose }: RecurringTaskFormProps) {
  const { courses, addTaskTemplate } = useData();
  const [submitting, setSubmitting] = useState(false);
  const [reminderOffsets, setReminderOffsets] = useState<ReminderOffset[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskTemplateFormData>({
    resolver: zodResolver(taskTemplateSchema),
    defaultValues: {
      title: '',
      courseId: '',
      description: '',
      deadlineTime: '23:59',
      deadlineDay: 'jumat' as DayOfWeek,
      recurrenceRule: 'weekly',
      startDate: '',
      endDate: '',
      reminderOffsets: [],
    },
  });

  const onSubmit: SubmitHandler<TaskTemplateFormData> = useCallback(
    (data) => {
      setSubmitting(true);
      try {
        const course = courses.find((c) => c.id === data.courseId);
        addTaskTemplate({
          ...data,
          courseName: course?.name,
          reminderOffsets,
          isActive: true,
        });
        reset();
        setReminderOffsets([]);
        onClose();
      } finally {
        setSubmitting(false);
      }
    },
    [courses, addTaskTemplate, reminderOffsets, reset, onClose]
  );

  const dayOptions = DAY_ORDER.map((d) => ({
    value: d,
    label: DAY_LABELS[d],
  }));

  const courseOptions = courses.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));

  return (
    <Modal open={open} onClose={onClose} title="Tugas Berulang Mingguan">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Judul Tugas"
          placeholder="Contoh: Tugas Mingguan Pemrograman"
          error={errors.title?.message}
          {...register('title')}
        />

        <Select
          label="Mata Kuliah"
          options={courseOptions}
          placeholder="Pilih mata kuliah (opsional)"
          {...register('courseId')}
        />

        <Select
          label="Hari Tenggat"
          options={dayOptions}
          error={errors.deadlineDay?.message}
          {...register('deadlineDay')}
        />

        <Input
          label="Jam Tenggat"
          type="time"
          error={errors.deadlineTime?.message}
          {...register('deadlineTime')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Tanggal Mulai"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input
            label="Tanggal Akhir"
            type="date"
            error={errors.endDate?.message}
            {...register('endDate')}
          />
        </div>

        <Textarea
          label="Deskripsi"
          placeholder="Deskripsi tugas..."
          error={errors.description?.message}
          {...register('description')}
        />

        <ReminderPicker value={reminderOffsets} onChange={setReminderOffsets} />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button type="submit" loading={submitting} className="flex-1">
            Buat Tugas Berulang
          </Button>
        </div>
      </form>
    </Modal>
  );
}
