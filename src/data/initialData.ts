import { Book, Member, Loan, Visit, Reservation, LibrarySettings } from '../types';

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
};

export const INITIAL_BOOKS: Book[] = [];
export const INITIAL_MEMBERS: Member[] = [];
export const INITIAL_LOANS: Loan[] = [];
export const INITIAL_VISITS: Visit[] = [];
export const INITIAL_RESERVATIONS: Reservation[] = [];
