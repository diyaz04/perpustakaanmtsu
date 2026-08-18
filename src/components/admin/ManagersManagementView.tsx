import React, { useState, useMemo } from 'react';
import { Manager, LibrarySettings } from '../../types';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Edit3,
  Trash2,
  Mail,
  Briefcase,
  Check,
  X,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface ManagersManagementViewProps {
  managers: Manager[];
  settings: LibrarySettings;
  onAddManager: (manager: Manager) => void;
  onUpdateManager: (manager: Manager) => void;
  onDeleteManager: (id: string) => void;
}

export const ManagersManagementView: React.FC<ManagersManagementViewProps> = ({
  managers,
  settings,
  onAddManager,
  onUpdateManager,
  onDeleteManager,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [accessBooks, setAccessBooks] = useState(true);
  const [accessMembers, setAccessMembers] = useState(true);
  const [accessLoans, setAccessLoans] = useState(true);
  const [accessVisits, setAccessVisits] = useState(true);
  const [accessReservations, setAccessReservations] = useState(true);
  const [accessSettings, setAccessSettings] = useState(false);
  const [accessManagers, setAccessManagers] = useState(false);

  // Delete Confirmation State
  const [deletingManager, setDeletingManager] = useState<Manager | null>(null);

  const filteredManagers = useMemo(() => {
    return managers.filter(
      (m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [managers, searchTerm]);

  const openAddModal = () => {
    setEditingManager(null);
    setName('');
    setEmail('');
    setPosition('Staf Perpustakaan');
    setAccessBooks(true);
    setAccessMembers(true);
    setAccessLoans(true);
    setAccessVisits(true);
    setAccessReservations(true);
    setAccessSettings(false);
    setAccessManagers(false);
    setIsModalOpen(true);
  };

  const openEditModal = (m: Manager) => {
    setEditingManager(m);
    setName(m.name);
    setEmail(m.email);
    setPosition(m.position);
    setAccessBooks(m.access_books);
    setAccessMembers(m.access_members);
    setAccessLoans(m.access_loans);
    setAccessVisits(m.access_visits);
    setAccessReservations(m.access_reservations);
    setAccessSettings(m.access_settings);
    setAccessManagers(m.access_managers);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const managerData: Manager = {
      id: editingManager ? editingManager.id : `mng-${Date.now()}`,
      name,
      email,
      position,
      access_books: accessBooks,
      access_members: accessMembers,
      access_loans: accessLoans,
      access_visits: accessVisits,
      access_reservations: accessReservations,
      access_settings: accessSettings,
      access_managers: accessManagers,
      created_at: editingManager?.created_at || new Date().toISOString(),
    };

    if (editingManager) {
      onUpdateManager(managerData);
    } else {
      onAddManager(managerData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingManager) {
      onDeleteManager(deletingManager.id);
      setDeletingManager(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/85 shadow-3xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Pengelola Akun &amp; Hak Akses</span>
          </h2>
          <p className="text-xs text-slate-450 text-slate-400 font-bold mt-1">
            Manajemen akun petugas perpustakaan beserta pengaturan izin akses modul sistem.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengelola</span>
        </button>
      </div>

      {/* Statistics and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-3xs flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Pengelola</span>
            <span className="text-xl font-black text-slate-900">{managers.length}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="sm:col-span-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-3xs flex items-center px-4 gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari pengelola berdasarkan nama, email, atau jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Main List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-3xs overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-250/60 text-slate-450 text-[10px] uppercase font-black tracking-wider">
                <th className="px-5 py-3">Nama &amp; Email</th>
                <th className="px-5 py-3">Jabatan</th>
                <th className="px-5 py-3 text-center">Buku</th>
                <th className="px-5 py-3 text-center">Anggota</th>
                <th className="px-5 py-3 text-center">Sirkulasi</th>
                <th className="px-5 py-3 text-center">Absensi</th>
                <th className="px-5 py-3 text-center">Reservasi</th>
                <th className="px-5 py-3 text-center">Pengaturan</th>
                <th className="px-5 py-3 text-center">Akses Admin</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredManagers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/65 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-extrabold text-slate-900">{m.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-350" />
                      <span>{m.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.position}</span>
                    </div>
                  </td>
                  {/* Permissions */}
                  <td className="px-5 py-4 text-center">
                    {m.access_books ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-50 rounded-full text-emerald-600"><Check className="w-3 h-3 stroke-[3]" /></span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-50 rounded-full text-slate-300"><X className="w-3 h-3 stroke-[3]" /></span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {m.access_members ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-50 rounded-full text-emerald-600"><Check className="w-3 h-3 stroke-[3]" /></span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-50 rounded-full text-slate-300"><X className="w-3 h-3 stroke-[3]" /></span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {m.access_loans ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-50 rounded-full text-emerald-600"><Check className="w-3 h-3 stroke-[3]" /></span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-50 rounded-full text-slate-300"><X className="w-3 h-3 stroke-[3]" /></span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {m.access_visits ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-50 rounded-full text-emerald-600"><Check className="w-3 h-3 stroke-[3]" /></span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-50 rounded-full text-slate-300"><X className="w-3 h-3 stroke-[3]" /></span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {m.access_reservations ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-50 rounded-full text-emerald-600"><Check className="w-3 h-3 stroke-[3]" /></span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-50 rounded-full text-slate-300"><X className="w-3 h-3 stroke-[3]" /></span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {m.access_settings ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-50 rounded-full text-emerald-600"><Check className="w-3 h-3 stroke-[3]" /></span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-50 rounded-full text-slate-300"><X className="w-3 h-3 stroke-[3]" /></span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {m.access_managers ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-bold text-[9px] uppercase tracking-wider">Super</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md font-bold text-[9px] uppercase tracking-wider">Biasa</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(m)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                        title="Edit Hak Akses"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingManager(m)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                        title="Hapus Akun Pengelola"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredManagers.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-slate-400 font-semibold">
                    Tidak ditemukan akun pengelola yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Card Layout */}
        <div className="block md:hidden divide-y divide-slate-100 p-4 space-y-4">
          {filteredManagers.map((m) => (
            <div key={m.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{m.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold">{m.email}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEditModal(m)}
                    className="p-1.5 bg-white text-slate-600 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingManager(m)}
                    className="p-1.5 bg-white text-rose-600 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>{m.position}</span>
                <span className="ml-auto px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-bold text-[8px] uppercase tracking-wider">
                  {m.access_managers ? 'Super Admin' : 'Admin Biasa'}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Hak Akses Modul:</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${m.access_books ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>Buku</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${m.access_members ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>Anggota</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${m.access_loans ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>Sirkulasi</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${m.access_visits ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>Absensi</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${m.access_reservations ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>Reservasi</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${m.access_settings ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>Sistem</span>
                </div>
              </div>
            </div>
          ))}
          {filteredManagers.length === 0 && (
            <div className="py-8 text-center text-slate-400 font-semibold text-xs">
              Tidak ditemukan akun pengelola yang sesuai.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Manager Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-3xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-none">
                    {editingManager ? 'Edit Hak Akses Pengelola' : 'Tambah Akun Pengelola'}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-455 text-slate-400 font-bold mt-1.5 font-semibold">
                    {editingManager ? 'Sesuaikan detail & izin operasional sistem' : 'Daftarkan pengelola baru & beri hak akses'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Nama Lengkap Pengelola *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ahmad Fauzi, S.Pd.I"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Alamat Email (Akun Login) *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@wahabmuhsin.sch.id"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Jabatan / Posisi Kerja *
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Contoh: Staf Sirkulasi / Relawan"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                  required
                />
              </div>

              {/* Access Permissions Section */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Hak Akses Modul Operasional:</span>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Book Module Access */}
                  <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200/60 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessBooks}
                      onChange={(e) => setAccessBooks(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-extrabold text-slate-800">Kelola Koleksi Buku</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">Dapat menambah, merubah, &amp; menghapus koleksi buku.</div>
                    </div>
                  </label>

                  {/* Member Module Access */}
                  <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200/60 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessMembers}
                      onChange={(e) => setAccessMembers(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-extrabold text-slate-800">Kelola Keanggotaan</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">Dapat mengelola siswa, guru, &amp; cetak kartu anggota.</div>
                    </div>
                  </label>

                  {/* Circulation Access */}
                  <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200/60 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessLoans}
                      onChange={(e) => setAccessLoans(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-extrabold text-slate-800">Transaksi Sirkulasi</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">Dapat melayani pinjam buku, denda, &amp; pengembalian.</div>
                    </div>
                  </label>

                  {/* Visit Attendance Access */}
                  <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200/60 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessVisits}
                      onChange={(e) => setAccessVisits(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-extrabold text-slate-800">Absensi Kunjungan</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">Dapat mengelola log buku tamu perpustakaan harian.</div>
                    </div>
                  </label>

                  {/* Book Reservations Access */}
                  <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200/60 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessReservations}
                      onChange={(e) => setAccessReservations(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-extrabold text-slate-800">Persetujuan Reservasi</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">Dapat menyetujui / menolak pemesanan buku siswa.</div>
                    </div>
                  </label>

                  {/* Settings Module Access */}
                  <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200/60 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessSettings}
                      onChange={(e) => setAccessSettings(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-extrabold text-slate-800">Pengaturan Sistem</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">Dapat mengubah profil perpus, denda, &amp; kunci database.</div>
                    </div>
                  </label>

                  {/* Managers Management Access */}
                  <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200/60 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessManagers}
                      onChange={(e) => setAccessManagers(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-extrabold text-slate-800">Kelola Akun Pengelola (Super Admin)</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">Dapat mendaftarkan &amp; merubah akses pengelola lainnya.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-150 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all cursor-pointer"
                >
                  {editingManager ? 'Simpan Perubahan' : 'Daftarkan Pengelola'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-sm w-full overflow-hidden text-left">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 shadow-3xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-none">Hapus Akun</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Konfirmasi pencabutan akses</p>
                </div>
              </div>
              <button
                onClick={() => setDeletingManager(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-550 text-slate-600 font-semibold leading-relaxed">
                Apakah Anda yakin ingin menghapus pengelola <span className="font-extrabold text-slate-900">"{deletingManager.name}"</span>? Akun ini tidak akan bisa login atau mengakses portal admin lagi.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setDeletingManager(null)}
                  className="px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-150 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-rose-600/10 hover:shadow-lg transition-all cursor-pointer"
                >
                  Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
