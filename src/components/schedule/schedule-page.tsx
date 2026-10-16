'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit, MapPin, Download } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { formatParsedRoom } from '@/lib/utils/room-parser';
import { generateICS, downloadICS } from '@/lib/utils/ics-export';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ScheduleForm } from '@/components/schedule/schedule-form';
import type { ClassSchedule, DayOfWeek } from '@/types';
import { DAY_LABELS, DAY_ORDER } from '@/types';
import { getCurrentDayOfWeek } from '@/lib/utils/helpers';

type ViewMode = 'daily' | 'weekly';

export function SchedulePage() {
  const { schedules, deleteSchedule, loading } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getCurrentDayOfWeek());

  const schedulesByDay = useMemo(() => {
    const grouped: Record<DayOfWeek, ClassSchedule[]> = {
      senin: [],
      selasa: [],
      rabu: [],
      kamis: [],
      jumat: [],
      sabtu: [],
      minggu: [],
    };
    schedules.forEach((s) => {
      if (!s.isCancelled) {
        grouped[s.day].push(s);
      }
    });
    Object.values(grouped).forEach((arr) =>
      arr.sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
    return grouped;
  }, [schedules]);

  const handleEdit = (schedule: ClassSchedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteSchedule(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handleExportICS = (schedule: ClassSchedule) => {
    const room = schedule.parsedRoom?.parsed
      ? formatParsedRoom(schedule.parsedRoom)
      : schedule.roomCode;
    const ics = generateICS({
      title: schedule.courseName || 'Kelas',
      description: schedule.notes || undefined,
      location: room || undefined,
      startDate: schedule.semesterStart,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
    downloadICS(ics, `${schedule.courseName || 'kelas'}.ics`);
  };

  const renderScheduleItem = (schedule: ClassSchedule) => {
    const roomDisplay = schedule.parsedRoom?.parsed
      ? formatParsedRoom(schedule.parsedRoom)
      : schedule.roomCode || '-';

    return (
      <div
        key={schedule.id}
        className="group flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-300 transition-colors"
      >
        <div className="flex flex-col items-center shrink-0 w-14 pt-0.5">
          <span className="text-sm font-semibold text-slate-900">
            {schedule.startTime}
          </span>
          <span className="text-xs text-slate-400">{schedule.endTime}</span>
        </div>
        <div className="h-full w-px bg-slate-200 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900 truncate">
            {schedule.courseName || schedule.courseCode || 'Mata Kuliah'}
          </p>
          {schedule.courseCode && (
            <p className="text-xs text-slate-500 mt-0.5">{schedule.courseCode}</p>
          )}
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{roomDisplay}</span>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => handleExportICS(schedule)}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Ekspor ke kalender"
            type="button"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEdit(schedule)}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Edit jadwal"
            type="button"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(schedule.id)}
            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Hapus jadwal"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
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
        <h2 className="text-lg font-semibold text-slate-900">Jadwal Kuliah</h2>
        <Button size="sm" onClick={() => { setEditingSchedule(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Tambah</span>
        </Button>
      </div>

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        <button
          onClick={() => setViewMode('daily')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === 'daily'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          type="button"
        >
          Harian
        </button>
        <button
          onClick={() => setViewMode('weekly')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === 'weekly'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          type="button"
        >
          Mingguan
        </button>
      </div>

      {viewMode === 'daily' && (
        <>
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {DAY_ORDER.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedDay === day
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                type="button"
              >
                {DAY_LABELS[day]}
              </button>
            ))}
          </div>
          {schedulesByDay[selectedDay].length === 0 ? (
            <EmptyState
              title={`Tidak ada kelas pada ${DAY_LABELS[selectedDay]}`}
              description="Tambahkan jadwal kuliah untuk hari ini."
              action={
                <Button size="sm" onClick={() => { setEditingSchedule(null); setShowForm(true); }}>
                  <Plus className="h-4 w-4" />
                  Tambah Jadwal
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {schedulesByDay[selectedDay].map(renderScheduleItem)}
            </div>
          )}
        </>
      )}

      {viewMode === 'weekly' && (
        <div className="space-y-4">
          {DAY_ORDER.map((day) => {
            const daySchedules = schedulesByDay[day];
            if (daySchedules.length === 0) return null;
            return (
              <div key={day}>
                <h3 className="text-sm font-medium text-slate-500 mb-2">
                  {DAY_LABELS[day]}
                </h3>
                <div className="space-y-2">
                  {daySchedules.map(renderScheduleItem)}
                </div>
              </div>
            );
          })}
          {schedules.filter((s) => !s.isCancelled).length === 0 && (
            <EmptyState
              title="Belum ada jadwal kuliah"
              description="Tambahkan jadwal kuliah untuk melihat jadwal mingguan."
              action={
                <Button size="sm" onClick={() => { setEditingSchedule(null); setShowForm(true); }}>
                  <Plus className="h-4 w-4" />
                  Tambah Jadwal
                </Button>
              }
            />
          )}
        </div>
      )}

      <ScheduleForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingSchedule(null); }}
        editingSchedule={editingSchedule}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Jadwal"
        message="Apakah kamu yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
