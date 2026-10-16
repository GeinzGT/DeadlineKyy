export function generateICS(event: {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  timezone?: string;
}): string {
  const tz = event.timezone || 'Asia/Jakarta';
  const uid = `${Date.now()}-${Math.random().toString(36).substring(2)}@deadline-app`;

  const escapeICS = (text: string): string =>
    text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');

  const formatDateTime = (date: string, time: string): string => {
    const d = date.replace(/-/g, '');
    const t = time.replace(/:/g, '') + '00';
    return `${d}T${t}`;
  };

  const dtStart = formatDateTime(event.startDate, event.startTime);
  const dtEnd = event.endDate && event.endTime
    ? formatDateTime(event.endDate, event.endTime)
    : formatDateTime(event.startDate, event.endTime || event.startTime);

  const now = new Date();
  const dtstamp =
    now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Deadline App//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `BEGIN:VTIMEZONE`,
    `TZID:${tz}`,
    `END:VTIMEZONE`,
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=${tz}:${dtStart}`,
    `DTEND;TZID=${tz}:${dtEnd}`,
    `SUMMARY:${escapeICS(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeICS(event.location)}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
}

export function downloadICS(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
