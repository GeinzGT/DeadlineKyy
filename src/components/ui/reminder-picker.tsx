'use client';

import type { ReminderOffset } from '@/types';
import { REMINDER_LABELS } from '@/types';

interface ReminderPickerProps {
  value: ReminderOffset[];
  onChange: (offsets: ReminderOffset[]) => void;
}

const ALL_OFFSETS: ReminderOffset[] = [
  'ten_minutes',
  'thirty_minutes',
  'one_hour',
  'one_day',
];

export function ReminderPicker({ value, onChange }: ReminderPickerProps) {
  const toggle = (offset: ReminderOffset) => {
    if (value.includes(offset)) {
      onChange(value.filter((v) => v !== offset));
    } else {
      onChange([...value, offset]);
    }
  };

  return (
    <div className="space-y-1">
      <span className="block text-sm font-medium text-slate-700">
        Pengingat
      </span>
      <div className="flex flex-wrap gap-2">
        {ALL_OFFSETS.map((offset) => (
          <button
            key={offset}
            type="button"
            onClick={() => toggle(offset)}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
              value.includes(offset)
                ? 'border-slate-800 bg-slate-800 text-white'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {REMINDER_LABELS[offset]}
          </button>
        ))}
      </div>
    </div>
  );
}
