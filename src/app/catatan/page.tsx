import { Suspense } from 'react';
import { NotesPage } from '@/components/notes/notes-page';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" /></div>}>
      <NotesPage />
    </Suspense>
  );
}
