'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit, StickyNote, CalendarDays } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { NoteForm } from '@/components/notes/note-form';
import { EventForm } from '@/components/shared/event-form';
import type { Note, SpecialEvent } from '@/types';
import { EVENT_TYPE_LABELS } from '@/types';
import { formatDateShort } from '@/lib/utils/helpers';

type Tab = 'notes' | 'events';

export function NotesPage() {
  const { notes, events, deleteNote, deleteEvent, loading } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('notes');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingEvent, setEditingEvent] = useState<SpecialEvent | null>(null);
  const [deleteNoteTarget, setDeleteNoteTarget] = useState<string | null>(null);
  const [deleteEventTarget, setDeleteEventTarget] = useState<string | null>(null);

  const handleDeleteNote = () => {
    if (deleteNoteTarget) {
      deleteNote(deleteNoteTarget);
      setDeleteNoteTarget(null);
    }
  };

  const handleDeleteEvent = () => {
    if (deleteEventTarget) {
      deleteEvent(deleteEventTarget);
      setDeleteEventTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          {activeTab === 'notes' ? 'Catatan' : 'Agenda'}
        </h2>
        <Button
          size="sm"
          onClick={() => {
            if (activeTab === 'notes') {
              setEditingNote(null);
              setShowNoteForm(true);
            } else {
              setEditingEvent(null);
              setShowEventForm(true);
            }
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Tambah</span>
        </Button>
      </div>

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 'notes'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          type="button"
        >
          Catatan
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 'events'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          type="button"
        >
          Agenda
        </button>
      </div>

      {activeTab === 'notes' && (
        <>
          {notes.length === 0 ? (
            <EmptyState
              icon={<StickyNote className="h-8 w-8" />}
              title="Belum ada catatan"
              description="Buat catatan pertamamu untuk mata kuliah atau tugas."
              action={
                <Button size="sm" onClick={() => { setEditingNote(null); setShowNoteForm(true); }}>
                  <Plus className="h-4 w-4" />
                  Tambah Catatan
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="group rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {note.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {note.courseName && (
                          <span className="text-xs text-slate-500">
                            {note.courseName}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {formatDateShort(note.createdAt.split('T')[0])}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => { setEditingNote(note); setShowNoteForm(true); }}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Edit catatan"
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteNoteTarget(note.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Hapus catatan"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {note.content && (
                    <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap line-clamp-4">
                      {note.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'events' && (
        <>
          {events.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-8 w-8" />}
              title="Belum ada agenda"
              description="Tambahkan ujian, kuis, presentasi, atau acara khusus."
              action={
                <Button size="sm" onClick={() => { setEditingEvent(null); setShowEventForm(true); }}>
                  <Plus className="h-4 w-4" />
                  Tambah Agenda
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {events
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((event) => (
                  <div
                    key={event.id}
                    className="group rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <CalendarDays className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {event.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                            <span className="text-xs text-slate-500">
                              {event.date} {event.startTime} - {event.endTime}
                            </span>
                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                              {EVENT_TYPE_LABELS[event.eventType]}
                            </span>
                          </div>
                          {event.courseName && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {event.courseName}
                            </p>
                          )}
                          {event.location && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => { setEditingEvent(event); setShowEventForm(true); }}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          aria-label="Edit agenda"
                          type="button"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteEventTarget(event.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Hapus agenda"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      <NoteForm
        open={showNoteForm}
        onClose={() => { setShowNoteForm(false); setEditingNote(null); }}
        editingNote={editingNote}
      />
      <EventForm
        open={showEventForm}
        onClose={() => { setShowEventForm(false); setEditingEvent(null); }}
        editingEvent={editingEvent}
      />
      <ConfirmDialog
        open={!!deleteNoteTarget}
        title="Hapus Catatan"
        message="Apakah kamu yakin ingin menghapus catatan ini?"
        onConfirm={handleDeleteNote}
        onCancel={() => setDeleteNoteTarget(null)}
      />
      <ConfirmDialog
        open={!!deleteEventTarget}
        title="Hapus Agenda"
        message="Apakah kamu yakin ingin menghapus agenda ini?"
        onConfirm={handleDeleteEvent}
        onCancel={() => setDeleteEventTarget(null)}
      />
    </div>
  );
}
