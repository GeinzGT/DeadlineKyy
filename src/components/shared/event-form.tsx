'use client';

import { useState, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { specialEventSchema, type SpecialEventFormData } from '@/lib/validations';
import { useData } from '@/hooks/use-data';
import type { SpecialEvent, ReminderOffset } from '@/types';
import { EVENT_TYPE_LABELS } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ReminderPicker } from '@/components/ui/reminder-picker';

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  editingEvent?: SpecialEvent | null;
}

export function EventForm({ open, onClose, editingEvent }: EventFormProps) {
  const { courses, addEvent, updateEvent } = useData();
  const [submitting, setSubmitting] = useState(false);
  const [reminderOffsets, setReminderOffsets] = useState<ReminderOffset[]>(
    editingEvent?.reminderOffsets || []
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SpecialEventFormData>({
    resolver: zodResolver(specialEventSchema),
    defaultValues: editingEvent
      ? {
          title: editingEvent.title,
          eventType: editingEvent.eventType,
          courseId: editingEvent.courseId,
          date: editingEvent.date,
          startTime: editingEvent.startTime,
          endTime: editingEvent.endTime,
          location: editingEvent.location,
          description: editingEvent.description,
          reminderOffsets: editingEvent.reminderOffsets,
        }
      : {
          title: '',
          eventType: 'exam',
          courseId: '',
          date: '',
          startTime: '08:00',
          endTime: '10:00',
          location: '',
          description: '',
          reminderOffsets: [],
        },
  });

  const onSubmit: SubmitHandler<SpecialEventFormData> = useCallback(
    (data) => {
      setSubmitting(true);
      try {
        const course = courses.find((c) => c.id === data.courseId);
        if (editingEvent) {
          updateEvent(editingEvent.id, {
            ...data,
            courseName: course?.name,
            reminderOffsets,
          });
        } else {
          addEvent({
            ...data,
            courseName: course?.name,
            reminderOffsets,
          });
        }
        reset();
        setReminderOffsets([]);
        onClose();
      } finally {
        setSubmitting(false);
      }
    },
    [courses, editingEvent, addEvent, updateEvent, reminderOffsets, reset, onClose]
  );

  const eventTypeOptions = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const courseOptions = courses.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingEvent ? 'Edit Agenda' : 'Tambah Agenda'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Judul"
          placeholder="Contoh: UTS Pemrograman"
          error={errors.title?.message}
          {...register('title')}
        />

        <Select
          label="Jenis"
          options={eventTypeOptions}
          error={errors.eventType?.message}
          {...register('eventType')}
        />

        <Select
          label="Mata Kuliah"
          options={courseOptions}
          placeholder="Pilih mata kuliah (opsional)"
          {...register('courseId')}
        />

        <Input
          label="Tanggal"
          type="date"
          error={errors.date?.message}
          {...register('date')}
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

        <Input
          label="Lokasi"
          placeholder="Lokasi (opsional)"
          {...register('location')}
        />

        <Textarea
          label="Deskripsi"
          placeholder="Deskripsi..."
          error={errors.description?.message}
          {...register('description')}
        />

        <ReminderPicker value={reminderOffsets} onChange={setReminderOffsets} />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button type="submit" loading={submitting} className="flex-1">
            {editingEvent ? 'Simpan' : 'Tambah'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
