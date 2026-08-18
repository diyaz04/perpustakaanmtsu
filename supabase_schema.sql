-- SQL Schema untuk Perpustakaan Digital MTs KH A Wahab Muhsin
-- Silakan jalankan script ini di SQL Editor Supabase Anda.

-- 1. Tabel Settings (Hanya berisi 1 baris untuk pengaturan perpustakaan)
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY CHECK (id = 1),
  school_name TEXT NOT NULL,
  library_name TEXT NOT NULL,
  address TEXT NOT NULL,
  head_librarian TEXT NOT NULL,
  nip_head TEXT NOT NULL,
  loan_duration_days INT NOT NULL DEFAULT 7,
  fine_per_day INT NOT NULL DEFAULT 1000,
  max_extensions INT NOT NULL DEFAULT 2,
  logo_url TEXT,
  cloudinary_cloud_name TEXT,
  cloudinary_upload_preset TEXT,
  supabase_url TEXT,
  supabase_anon_key TEXT
);

-- 2. Tabel Books (Buku)
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT NOT NULL,
  year INT NOT NULL,
  isbn TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  available_stock INT NOT NULL DEFAULT 0,
  shelf_location TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  barcode TEXT NOT NULL,
  description TEXT,
  e_book_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  qr_printed_count INT DEFAULT 0
);

-- 3. Tabel Members (Anggota - Siswa dan Guru)
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  member_number TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('siswa', 'guru')),
  class_or_position TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  gender TEXT NOT NULL CHECK (gender IN ('L', 'P')),
  registered_at TEXT NOT NULL
);

-- 4. Tabel Loans (Sirkulasi Peminjaman Buku)
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  book_id TEXT REFERENCES books(id) ON DELETE CASCADE,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  loan_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  return_date TEXT,
  status TEXT NOT NULL CHECK (status IN ('Dipinjam', 'Dikembalikan', 'Terlambat')),
  fine_amount INT NOT NULL DEFAULT 0,
  extensions_count INT NOT NULL DEFAULT 0,
  notes TEXT
);

-- 5. Tabel Visits (Buku Tamu / Absensi Kunjungan)
CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
  visitor_name TEXT NOT NULL,
  visitor_number TEXT,
  role TEXT NOT NULL CHECK (role IN ('siswa', 'guru', 'tamu')),
  class_or_position TEXT,
  visit_date TEXT NOT NULL,
  visit_time TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('Membaca', 'Meminjam Buku', 'Mengembalikan Buku', 'Diskusi/Belajar', 'Lainnya'))
);

-- 6. Tabel Reservations (Reservasi / Booking Buku)
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  book_id TEXT REFERENCES books(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  member_number TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  reservation_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Menunggu', 'Disetujui', 'Dibatalkan', 'Selesai')),
  notes TEXT
);

-- 7. Tabel Managers (Pengelola Portal / Admin)
CREATE TABLE IF NOT EXISTS managers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL DEFAULT 'admin123',
  position TEXT NOT NULL,
  access_books BOOLEAN NOT NULL DEFAULT FALSE,
  access_members BOOLEAN NOT NULL DEFAULT FALSE,
  access_loans BOOLEAN NOT NULL DEFAULT FALSE,
  access_visits BOOLEAN NOT NULL DEFAULT FALSE,
  access_reservations BOOLEAN NOT NULL DEFAULT FALSE,
  access_settings BOOLEAN NOT NULL DEFAULT FALSE,
  access_managers BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menonaktifkan Row Level Security (RLS) agar client side app (dengan anon key)
-- dapat membaca & menulis data secara langsung ke tabel.
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE managers DISABLE ROW LEVEL SECURITY;
