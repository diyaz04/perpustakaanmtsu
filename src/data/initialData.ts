import { Book, Member, Loan, Visit, Reservation, LibrarySettings, Manager } from '../types';

export const INITIAL_SETTINGS: LibrarySettings = {
  school_name: 'MTs KH A Wahab Muhsin',
  library_name: 'Perpustakaan MTs KH A Wahab Muhsin',
  address: 'Jl. Sukahideung, Sukarame, Tasikmalaya, Jawa Barat',
  head_librarian: 'Ahmad Fauzi, S.Pd.I',
  nip_head: '19850412 201001 1 008',
  loan_duration_days: 7,
  fine_per_day: 1000,
  max_extensions: 2,
  logo_url: 'https://lh3.googleusercontent.com/d/1TsAyUBmWgRpU18qwOxLlmKvI-HL1kRvt',
  cloudinary_cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  cloudinary_upload_preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  supabase_url: import.meta.env.VITE_SUPABASE_URL || '',
  supabase_anon_key: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

export const INITIAL_BOOKS: Book[] = [];
export const INITIAL_MEMBERS: Member[] = [];
export const INITIAL_LOANS: Loan[] = [];
export const INITIAL_VISITS: Visit[] = [];
export const INITIAL_RESERVATIONS: Reservation[] = [];

export const INITIAL_MANAGERS: Manager[] = [
  {
    id: 'mng-1',
    name: 'Ahmad Fauzi, S.Pd.I',
    email: 'ahmadfauzi@wahabmuhsin.sch.id',
    position: 'Kepala Perpustakaan',
    access_books: true,
    access_members: true,
    access_loans: true,
    access_visits: true,
    access_reservations: true,
    access_settings: true,
    access_managers: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mng-2',
    name: 'Zainul Muttaqin',
    email: 'zainul@wahabmuhsin.sch.id',
    position: 'Staf Administrasi',
    access_books: true,
    access_members: true,
    access_loans: true,
    access_visits: true,
    access_reservations: true,
    access_settings: false,
    access_managers: false,
    created_at: new Date().toISOString(),
  }
];
