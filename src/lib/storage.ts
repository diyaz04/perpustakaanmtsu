import { Book, Member, Loan, Visit, Reservation, LibrarySettings, Manager } from '../types';
import { INITIAL_BOOKS, INITIAL_MEMBERS, INITIAL_LOANS, INITIAL_VISITS, INITIAL_RESERVATIONS, INITIAL_SETTINGS, INITIAL_MANAGERS } from '../data/initialData';

const STORAGE_KEY = 'mts_library_app_data_v4';

interface AppStorageData {
  books: Book[];
  members: Member[];
  loans: Loan[];
  visits: Visit[];
  reservations: Reservation[];
  settings: LibrarySettings;
  managers: Manager[];
}

export function loadStorageData(): AppStorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: AppStorageData = {
        books: INITIAL_BOOKS,
        members: INITIAL_MEMBERS,
        loans: INITIAL_LOANS,
        visits: INITIAL_VISITS,
        reservations: INITIAL_RESERVATIONS,
        settings: INITIAL_SETTINGS,
        managers: INITIAL_MANAGERS,
      };
      saveStorageData(initial);
      return updateFinesAndStatus(initial);
    }
    const parsed: AppStorageData = JSON.parse(raw);
    if (!parsed.managers) {
      parsed.managers = INITIAL_MANAGERS;
    }
    if (!parsed.settings) {
      parsed.settings = INITIAL_SETTINGS;
    }
    if (!parsed.settings.logo_url) {
      parsed.settings.logo_url = INITIAL_SETTINGS.logo_url;
    }
    // Mix in env variables if not set in local storage settings
    if (!parsed.settings.supabase_url && import.meta.env.VITE_SUPABASE_URL) {
      parsed.settings.supabase_url = import.meta.env.VITE_SUPABASE_URL;
    }
    if (!parsed.settings.supabase_anon_key && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      parsed.settings.supabase_anon_key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    }
    if (!parsed.settings.cloudinary_cloud_name && import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) {
      parsed.settings.cloudinary_cloud_name = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    }
    if (!parsed.settings.cloudinary_upload_preset && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) {
      parsed.settings.cloudinary_upload_preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    }
    return updateFinesAndStatus(parsed);
  } catch (err) {
    console.error('Failed to load storage data, using defaults:', err);
    return {
      books: INITIAL_BOOKS,
      members: INITIAL_MEMBERS,
      loans: INITIAL_LOANS,
      visits: INITIAL_VISITS,
      reservations: INITIAL_RESERVATIONS,
      settings: INITIAL_SETTINGS,
    };
  }
}

export function saveStorageData(data: AppStorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save storage data:', err);
  }
}

// Automatically recalculate fines and statuses for loans based on settings
export function updateFinesAndStatus(data: AppStorageData): AppStorageData {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDate = new Date(todayStr).getTime();
  const fineRate = data.settings.fine_per_day || 1000;

  const updatedLoans = data.loans.map((loan) => {
    if (loan.status === 'Dikembalikan') return loan;

    const dueDate = new Date(loan.due_date).getTime();
    if (todayDate > dueDate) {
      const diffDays = Math.ceil((todayDate - dueDate) / (1000 * 3600 * 24));
      const fine = diffDays * fineRate;
      return {
        ...loan,
        status: 'Terlambat' as const,
        fine_amount: fine,
        notes: `Terlambat ${diffDays} hari`,
      };
    } else {
      return {
        ...loan,
        status: 'Dipinjam' as const,
        fine_amount: 0,
      };
    }
  });

  return { ...data, loans: updatedLoans };
}

// Reset data to defaults
export function resetToDefaultData(): AppStorageData {
  const initial: AppStorageData = {
    books: INITIAL_BOOKS,
    members: INITIAL_MEMBERS,
    loans: INITIAL_LOANS,
    visits: INITIAL_VISITS,
    reservations: INITIAL_RESERVATIONS,
    settings: INITIAL_SETTINGS,
    managers: INITIAL_MANAGERS,
  };
  saveStorageData(initial);
  return initial;
}
