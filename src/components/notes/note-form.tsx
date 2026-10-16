'use client';

import { useState, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { noteSchema, type NoteFormData } from '@/lib/validations';
import { useData } from '@/hooks/use-data';
import type { Note } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface NoteFormProps {
  open: boolean;
  onClose: () => void;
  editingNote?: Note | null;
}

export function NoteForm({ open, onClose, editingNote }: NoteFormProps) {
  const { courses, addNote, updateNote } = useData();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: editingNote
      ? {
          title: editingNote.title,
          content: editingNote.content,
          type: editingNote.type,
          courseId: editingNote.courseId,
          taskId: editingNote.taskId,
        }
      : {
          title: '',
          content: '',
          type: 'general',
          courseId: '',
          taskId: '',
        },
  });

  const onSubmit: SubmitHandler<NoteFormData> = useCallback(
    (data: NoteFormData) => {
      setSubmitting(true);
      try {
        const course = courses.find((c) => c.id === data.courseId);
        if (editingNote) {
          updateNote(editingNote.id, {
            ...data,
            courseName: course?.name,
          });
        } else {
          addNote({
            ...data,
            courseName: course?.name,
          });
        }
        reset();
        onClose();
      } finally {
        setSubmitting(false);
      }
    },
    [courses, editingNote, addNote, updateNote, reset, onClose]
  );

  const courseOptions = courses.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));

  const typeOptions = [
    { value: 'general', label: 'Umum' },
    { value: 'course', label: 'Catatan Kuliah' },
    { value: 'task', label: 'Catatan Tugas' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingNote ? 'Edit Catatan' : 'Tambah Catatan'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Judul"
          placeholder="Judul catatan"
          error={errors.title?.message}
          {...register('title')}
        />

        <Select
          label="Jenis"
          options={typeOptions}
          error={errors.type?.message}
          {...register('type')}
        />

        <Select
          label="Mata Kuliah"
          options={courseOptions}
          placeholder="Pilih mata kuliah (opsional)"
          {...register('courseId')}
        />

        <Textarea
          label="Isi Catatan"
          placeholder="Tulis catatan di sini..."
          error={errors.content?.message}
          rows={6}
          {...register('content')}
        />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button type="submit" loading={submitting} className="flex-1">
            {editingNote ? 'Simpan' : 'Tambah'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
