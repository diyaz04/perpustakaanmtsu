import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Book, Member, Loan, Visit, Reservation, LibrarySettings, Manager } from '../types';

let supabaseInstance: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';

export function getSupabase(): SupabaseClient | null {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  let url = '';
  let key = '';

  if (envUrl && envKey && envUrl !== 'YOUR_SUPABASE_URL_HERE' && envKey !== 'YOUR_SUPABASE_ANON_KEY_HERE') {
    url = envUrl;
    key = envKey;
  } else {
    try {
      const raw = localStorage.getItem('mts_library_app_data_v4');
      if (raw) {
        const parsed = JSON.parse(raw);
        const settings = parsed.settings;
        if (settings?.supabase_url && settings?.supabase_anon_key) {
          url = settings.supabase_url;
          key = settings.supabase_anon_key;
        }
      }
    } catch (e) {
      console.error('Error reading Supabase configuration from localStorage:', e);
    }
  }

  if (!url || !key) {
    supabaseInstance = null;
    return null;
  }

  if (url !== currentUrl || key !== currentKey || !supabaseInstance) {
    currentUrl = url;
    currentKey = key;
    try {
      new URL(url);
      supabaseInstance = createClient(url, key);
    } catch (err) {
      console.error('Invalid Supabase URL:', url, err);
      supabaseInstance = null;
    }
  }

  return supabaseInstance;
}

export async function fetchSupabaseData(): Promise<{
  books: any[];
  members: any[];
  loans: any[];
  visits: any[];
  reservations: any[];
  settings: any;
  managers: any[];
  diagnosticError?: string;
} | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    // First, test connection with a simple query to detect common issues
    const { data: testData, error: testError } = await client.from('books').select('id').limit(1);
    
    if (testError) {
      const errMsg = testError.message || '';
      const errCode = testError.code || '';
      
      // Table doesn't exist
      if (errMsg.includes('does not exist') || errMsg.includes('relation') || errCode === '42P01') {
        return {
          books: [], members: [], loans: [], visits: [], reservations: [], settings: null, managers: [],
          diagnosticError: 'TABLES_NOT_CREATED'
        };
      }
      
      // RLS blocking or permission denied
      if (errCode === '42501' || errMsg.includes('permission denied') || errMsg.includes('row-level security')) {
        return {
          books: [], members: [], loans: [], visits: [], reservations: [], settings: null, managers: [],
          diagnosticError: 'RLS_BLOCKING'
        };
      }

      // JWT or auth errors
      if (errMsg.includes('JWT') || errMsg.includes('apikey') || errMsg.includes('Invalid API key') || errCode === 'PGRST301') {
        return {
          books: [], members: [], loans: [], visits: [], reservations: [], settings: null, managers: [],
          diagnosticError: 'INVALID_KEY'
        };
      }

      // Generic error — throw with full message
      throw new Error(`Supabase query error: ${errMsg} (code: ${errCode})`);
    }

    // If test passed, fetch all data
    const [
      { data: books, error: errBooks },
      { data: members, error: errMembers },
      { data: loans, error: errLoans },
      { data: visits, error: errVisits },
      { data: reservations, error: errReservations },
      { data: settingsRows, error: errSettings }
    ] = await Promise.all([
      client.from('books').select('*'),
      client.from('members').select('*'),
      client.from('loans').select('*'),
      client.from('visits').select('*'),
      client.from('reservations').select('*'),
      client.from('settings').select('*').eq('id', 1).maybeSingle()
    ]);

    if (errBooks) throw errBooks;
    if (errMembers) throw errMembers;
    if (errLoans) throw errLoans;
    if (errVisits) throw errVisits;
    if (errReservations) throw errReservations;
    if (errSettings) throw errSettings;

    let managers: any[] = [];
    try {
      const { data: mData, error: errM } = await client.from('managers').select('*');
      if (!errM && mData) {
        managers = mData;
      }
    } catch (e) {
      console.warn('managers table might not exist in Supabase yet. Using local.', e);
    }

    return {
      books: books || [],
      members: members || [],
      loans: loans || [],
      visits: visits || [],
      reservations: reservations || [],
      settings: settingsRows || null,
      managers: managers
    };
  } catch (error) {
    console.error('Error fetching Supabase data:', error);
    throw error;
  }
}

export async function syncBook(book: Book) {
  const client = getSupabase();
  if (!client) return;
  const { book_title, book_isbn, member_name, member_number, member_class, ...dbBook } = book as any;
  const { error } = await client.from('books').upsert(dbBook);
  if (error) {
    console.error('Error syncing book:', error);
    throw error;
  }
}

export async function deleteBookFromSupabase(id: string) {
  const client = getSupabase();
  if (!client) return;
  const { error } = await client.from('books').delete().eq('id', id);
  if (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
}

export async function syncMember(member: Member) {
  const client = getSupabase();
  if (!client) return;
  const { error } = await client.from('members').upsert(member);
  if (error) {
    console.error('Error syncing member:', error);
    throw error;
  }
}

export async function deleteMemberFromSupabase(id: string) {
  const client = getSupabase();
  if (!client) return;
  const { error } = await client.from('members').delete().eq('id', id);
  if (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
}

export async function syncLoan(loan: Loan) {
  const client = getSupabase();
  if (!client) return;
  const { book_title, book_isbn, member_name, member_number, member_class, ...dbLoan } = loan;
  const { error } = await client.from('loans').upsert(dbLoan);
  if (error) {
    console.error('Error syncing loan:', error);
    throw error;
  }
}

export async function deleteLoanFromSupabase(id: string) {
  const client = getSupabase();
  if (!client) return;
  const { error } = await client.from('loans').delete().eq('id', id);
  if (error) {
    console.error('Error deleting loan:', error);
    throw error;
  }
}

export async function syncVisit(visit: Visit) {
  const client = getSupabase();
  if (!client) return;
  const { error } = await client.from('visits').upsert(visit);
  if (error) {
    console.error('Error syncing visit:', error);
    throw error;
  }
}

export async function deleteVisitFromSupabase(id: string) {
  const client = getSupabase();
  if (!client) return;
  const { error } = await client.from('visits').delete().eq('id', id);
  if (error) {
    console.error('Error deleting visit:', error);
    throw error;
  }
}

export async function syncReservation(res: Reservation) {
  const client = getSupabase();
  if (!client) return;
  const { book_title, ...dbRes } = res as any;
  const { error } = await client.from('reservations').upsert(dbRes);
  if (error) {
    console.error('Error syncing reservation:', error);
    throw error;
  }
}

export async function deleteReservationFromSupabase(id: string) {
  const client = getSupabase();
  if (!client) return;
  const { error } = await client.from('reservations').delete().eq('id', id);
  if (error) {
    console.error('Error deleting reservation:', error);
    throw error;
  }
}

export async function syncSettings(settings: LibrarySettings) {
  const client = getSupabase();
  if (!client) return;
  const { error } = await client.from('settings').upsert({ id: 1, ...settings });
  if (error) {
    console.error('Error syncing settings:', error);
    throw error;
  }
}

export async function syncAllLocalDataToSupabase(data: {
  books: Book[];
  members: Member[];
  loans: Loan[];
  visits: Visit[];
  reservations: Reservation[];
  settings: LibrarySettings;
}) {
  const client = getSupabase();
  if (!client) return;

  if (data.settings) {
    await syncSettings(data.settings);
  }
  if (data.books && data.books.length > 0) {
    const dbBooks = data.books.map(({ created_at, ...b }: any) => b);
    const { error } = await client.from('books').upsert(dbBooks);
    if (error) console.error('Error batch syncing books:', error);
  }
  if (data.members && data.members.length > 0) {
    const { error } = await client.from('members').upsert(data.members);
    if (error) console.error('Error batch syncing members:', error);
  }
  if (data.loans && data.loans.length > 0) {
    const dbLoans = data.loans.map(({ book_title, book_isbn, member_name, member_number, member_class, ...l }: any) => l);
    const { error } = await client.from('loans').upsert(dbLoans);
    if (error) console.error('Error batch syncing loans:', error);
  }
  if (data.visits && data.visits.length > 0) {
    const { error } = await client.from('visits').upsert(data.visits);
    if (error) console.error('Error batch syncing visits:', error);
  }
  if (data.reservations && data.reservations.length > 0) {
    const dbRes = data.reservations.map(({ book_title, ...r }: any) => r);
    const { error } = await client.from('reservations').upsert(dbRes);
    if (error) console.error('Error batch syncing reservations:', error);
  }
  if ((data as any).managers && (data as any).managers.length > 0) {
    try {
      const { error } = await client.from('managers').upsert((data as any).managers);
      if (error) console.warn('Error batch syncing managers:', error);
    } catch (e) {
      console.warn('Error batch syncing managers to Supabase:', e);
    }
  }
}

export async function syncManager(manager: Manager) {
  const client = getSupabase();
  if (!client) return;
  try {
    const { error } = await client.from('managers').upsert(manager);
    if (error) {
      console.warn('Error syncing manager to Supabase:', error);
    }
  } catch (e) {
    console.warn('Error syncing manager exception:', e);
  }
}

export async function deleteManagerFromSupabase(id: string) {
  const client = getSupabase();
  if (!client) return;
  try {
    const { error } = await client.from('managers').delete().eq('id', id);
    if (error) {
      console.warn('Error deleting manager from Supabase:', error);
    }
  } catch (e) {
    console.warn('Error deleting manager exception:', e);
  }
}
