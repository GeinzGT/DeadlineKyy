import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error: 'Supabase belum dikonfigurasi. Jalankan generator melalui antarmuka lokal.',
        generated: 0,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    message:
      'Endpoint ini memerlukan konfigurasi Supabase dengan service role key untuk menjalankan pembangkitan tugas berulang secara terjadwal. Lihat dokumentasi untuk konfigurasi.',
    generated: 0,
  });
}
