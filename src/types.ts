export type UserRole = 'admin' | 'siswa' | 'guru' | 'public';

export type BookCategory = 
  | 'Agama Islam'
  | 'Bahasa & Sastra'
  | 'Matematika & IPA'
  | 'IPS & Sejarah'
  | 'Teknologi & Umum'
  | 'Fiksi & Novel'
  | 'Kamus & Referensi'
  | 'Laptop';

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  isbn: string;
  category: BookCategory;
  stock: number;
  available_stock: number;
  shelf_location: string;
  cover_url: string;
  barcode: string;
  description?: string;
  e_book_url?: string;
  created_at?: string;
  qr_printed_count?: number; // jumlah eksemplar yang sudah dicetak QR-nya
}

export interface Member {
  id: string;
  name: string;
  member_number: string; // NIS for siswa, NIP for guru
  role: 'siswa' | 'guru';
  class_or_position: string; // e.g. "Kelas 7A", "Guru Fiqih"
  photo_url: string;
  phone?: string;
  email?: string;
  gender: 'L' | 'P';
  registered_at: string;
}

export type LoanStatus = 'Dipinjam' | 'Dikembalikan' | 'Terlambat';

export interface Loan {
  id: string;
  book_id: string;
  member_id: string;
  loan_date: string; // YYYY-MM-DD
  due_date: string;  // YYYY-MM-DD
  return_date?: string; // YYYY-MM-DD
  status: LoanStatus;
  fine_amount: number;
  extensions_count: number;
  notes?: string;
  // Joined virtual fields for UI convenience
  book_title?: string;
  book_isbn?: string;
  member_name?: string;
  member_number?: string;
  member_class?: string;
}

export interface Visit {
  id: string;
  member_id?: string;
  visitor_name: string;
  visitor_number?: string; // NIS/NIP
  role: 'siswa' | 'guru' | 'tamu';
  class_or_position?: string;
  visit_date: string; // YYYY-MM-DD
  visit_time: string; // HH:mm
  purpose: 'Membaca' | 'Meminjam Buku' | 'Mengembalikan Buku' | 'Diskusi/Belajar' | 'Lainnya';
}

export interface Reservation {
  id: string;
  book_id: string;
  member_name: string;
  member_number: string;
  contact_phone: string;
  reservation_date: string;
  status: 'Menunggu' | 'Disetujui' | 'Dibatalkan' | 'Selesai';
  notes?: string;
  book_title?: string;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  password: string;
  position: string;
  access_books: boolean;
  access_members: boolean;
  access_loans: boolean;
  access_visits: boolean;
  access_reservations: boolean;
  access_settings: boolean;
  access_managers: boolean;
  created_at?: string;
}

export interface LibrarySettings {
  school_name: string;
  library_name: string;
  address: string;
  head_librarian: string;
  nip_head: string;
  loan_duration_days: number;
  fine_per_day: number;
  max_extensions: number;
  logo_url?: string;
  cloudinary_cloud_name?: string;
  cloudinary_upload_preset?: string;
  supabase_url?: string;
  supabase_anon_key?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
    role: UserRole;
    name: string;
  } | null;
}
