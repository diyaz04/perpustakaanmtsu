import React, { useState, useMemo } from 'react';
import { Member, Loan, LibrarySettings } from '../../types';
import { ImageUploader } from '../ImageUploader';
import * as XLSX from 'xlsx';
import {
  Users,
  UserPlus,
  Search,
  Edit3,
  Trash2,
  CreditCard,
  History,
  GraduationCap,
  XCircle,
  Phone,
  Mail,
  ShieldCheck,
  Download,
  Upload,
  FileSpreadsheet,
  X,
} from 'lucide-react';

interface MembersManagementViewProps {
  members: Member[];
  loans: Loan[];
  settings: LibrarySettings;
  onAddMember: (member: Omit<Member, 'id' | 'registered_at'>) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onOpenMemberCard: (member: Member) => void;
  onImportMembers?: (membersList: Omit<Member, 'id' | 'registered_at'>[]) => Promise<void>;
}

export const MembersManagementView: React.FC<MembersManagementViewProps> = ({
  members,
  loans,
  settings,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onOpenMemberCard,
  onImportMembers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'siswa' | 'guru'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportExcel = () => {
    const dataToExport = members.map((m) => ({
      'No. Anggota': m.member_number,
      'Nama Lengkap': m.name,
      'Tipe': m.role === 'siswa' ? 'Siswa' : 'Guru',
      'Kelas/Jabatan': m.class_or_position,
      'Jenis Kelamin': m.gender,
      'Kontak/Telepon': m.phone || '',
      'Email': m.email || '',
      'Tanggal Registrasi': m.registered_at,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Anggota');
    XLSX.writeFile(workbook, `Data_Anggota_Perpustakaan_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'No. Anggota': '20260001',
        'Nama Lengkap': 'Ahmad Fauzi',
        'Tipe': 'Siswa',
        'Kelas/Jabatan': 'Kelas 7A',
        'Jenis Kelamin': 'L',
        'Kontak/Telepon': '081234567890',
        'Email': 'ahmad@school.sch.id',
      },
      {
        'No. Anggota': '19850312201001',
        'Nama Lengkap': 'Siti Rahmawati, S.Pd.',
        'Tipe': 'Guru',
        'Kelas/Jabatan': 'Wali Kelas 9B',
        'Jenis Kelamin': 'P',
        'Kontak/Telepon': '089876543210',
        'Email': 'siti@school.sch.id',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import');
    XLSX.writeFile(workbook, 'Template_Import_Anggota.xlsx');
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (rawData.length === 0) {
          alert('File Excel kosong atau tidak memiliki data.');
          setIsImporting(false);
          return;
        }

        const parsedMembers = rawData.map((row: any) => {
          const mNumber = String(row['No. Anggota'] || row['Nomor'] || row['NIS'] || row['NIP'] || `MEM-${Math.floor(1000 + Math.random() * 9000)}`);
          const mName = String(row['Nama Lengkap'] || row['Nama'] || 'Anggota Tanpa Nama');
          const mTypeRaw = String(row['Tipe'] || row['Kategori'] || row['Peran'] || 'Siswa').toLowerCase();
          const mRole: 'siswa' | 'guru' = mTypeRaw.includes('guru') || mTypeRaw.includes('staff') || mTypeRaw.includes('staff') ? 'guru' : 'siswa';
          const mClass = String(row['Kelas/Jabatan'] || row['Kelas'] || row['Jabatan'] || 'Umum');
          const mGenderRaw = String(row['Jenis Kelamin'] || row['Gender'] || 'L').toUpperCase();
          const mGender: 'L' | 'P' = mGenderRaw.startsWith('P') ? 'P' : 'L';
          const mPhone = String(row['Kontak/Telepon'] || row['Kontak'] || row['HP'] || '');
          const mEmail = String(row['Email'] || '');

          return {
            member_number: mNumber,
            name: mName,
            role: mRole,
            class_or_position: mClass,
            gender: mGender,
            photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300', // Default photo
            phone: mPhone,
            email: mEmail,
          };
        });

        if (onImportMembers) {
          await onImportMembers(parsedMembers);
        } else {
          for (const m of parsedMembers) {
            await onAddMember(m);
          }
        }
      } catch (err) {
        console.error(err);
        alert('Gagal mengimpor file Excel. Silakan periksa kesesuaian kolom.');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [historyMember, setHistoryMember] = useState<Member | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [role, setRole] = useState<'siswa' | 'guru'>('siswa');
  const [classOrPosition, setClassOrPosition] = useState('Kelas 7A');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [photoUrl, setPhotoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.member_number.includes(searchTerm) ||
        m.class_or_position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = roleFilter === 'all' || m.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [members, searchTerm, roleFilter]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage) || 1;
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setMemberNumber(`2026${Math.floor(1000 + Math.random() * 9000)}`);
    setRole('siswa');
    setClassOrPosition('Kelas 7A');
    setGender('L');
    setPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300');
    setPhone('081234567890');
    setEmail('');
    setIsModalOpen(true);
  };

  const openEditModal = (m: Member) => {
    setEditingMember(m);
    setName(m.name);
    setMemberNumber(m.member_number);
    setRole(m.role);
    setClassOrPosition(m.class_or_position);
    setGender(m.gender);
    setPhotoUrl(m.photo_url);
    setPhone(m.phone || '');
    setEmail(m.email || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      onUpdateMember({
        ...editingMember,
        name,
        member_number: memberNumber,
        role,
        class_or_position: classOrPosition,
        gender,
        photo_url: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
        phone,
        email,
      });
    } else {
      onAddMember({
        name,
        member_number: memberNumber,
        role,
        class_or_position: classOrPosition,
        gender,
        photo_url: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
        phone,
        email,
      });
    }
    setIsModalOpen(false);
  };

  const memberLoansHistory = useMemo(() => {
    if (!historyMember) return [];
    return loans.filter((l) => l.member_id === historyMember.id);
  }, [loans, historyMember]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Manajemen Data Anggota (Siswa & Guru)
          </h2>
          <p className="text-xs text-slate-500">
            Kelola data registrasi anggota perpustakaan, buat nomor NIS/NIP, dan cetak kartu anggota digital
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Download Template Button */}
          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-3xs"
            title="Unduh Template Excel untuk Impor Anggota"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Template Excel</span>
          </button>

          {/* Import Excel Button */}
          <label className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer relative shadow-3xs">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>{isImporting ? 'Mengimpor...' : 'Impor Excel'}</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
              disabled={isImporting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>

          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-3xs"
            title="Ekspor Seluruh Data Anggota ke Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>

          {/* Add Member Button */}
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer shadow-3xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Anggota Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama anggota, NIS/NIP, atau kelas..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500">Kategori:</span>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Anggota</option>
            <option value="siswa">Siswa Saja</option>
            <option value="guru">Guru & Staf Saja</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4">Foto & Nama Anggota</th>
                <th className="py-3.5 px-4">NIS / NIP</th>
                <th className="py-3.5 px-4">Role & Kelas/Jabatan</th>
                <th className="py-3.5 px-4">Kontak</th>
                <th className="py-3.5 px-4 text-center">Kartu Anggota</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.photo_url}
                          alt={m.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{m.name}</div>
                          <div className="text-[10px] text-slate-400">Gender: {m.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      {m.member_number}
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.role === 'guru'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {m.role}
                      </span>
                      <div className="text-slate-600 font-medium text-[11px]">{m.class_or_position}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      <div>{m.phone || '-'}</div>
                      <div className="text-slate-400 truncate max-w-[150px]">{m.email || '-'}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenMemberCard(m)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-[11px] rounded-lg inline-flex items-center gap-1.5 transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Cetak Kartu</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setHistoryMember(m)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="Lihat Riwayat Pinjam"
                        >
                          <History className="w-4 h-4 text-amber-600" />
                        </button>
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="Edit Anggota"
                        >
                          <Edit3 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus anggota "${m.name}"?`)) {
                              onDeleteMember(m.id);
                            }
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-600 rounded-lg transition-colors"
                          title="Hapus Anggota"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada data anggota ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>
            Halaman {currentPage} dari {totalPages} ({filteredMembers.length} Anggota)
          </div>
          <div className="flex gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-50 font-semibold"
            >
              Sebelumnya
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-50 font-semibold"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Member History Modal */}
      {historyMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setHistoryMember(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shadow-3xs">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-none">Riwayat Pinjam: {historyMember.name}</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-455 text-slate-400 font-bold mt-1.5">Sirkulasi buku anggota</p>
                </div>
              </div>
              <button
                onClick={() => setHistoryMember(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              {memberLoansHistory.length > 0 ? (
                memberLoansHistory.map((l) => (
                  <div
                    key={l.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 shadow-3xs text-left"
                  >
                    <div className="font-extrabold text-slate-900 flex justify-between gap-4">
                      <span className="truncate">{l.book_title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold shrink-0 ${
                          l.status === 'Terlambat'
                            ? 'bg-rose-100 text-rose-800 shadow-3xs'
                            : l.status === 'Dipinjam'
                            ? 'bg-amber-100 text-amber-800 shadow-3xs'
                            : 'bg-emerald-100 text-emerald-800 shadow-3xs'
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                      <span>Pinjam: {l.loan_date}</span>
                      <span>Jatuh Tempo: {l.due_date}</span>
                    </div>
                    {l.return_date && (
                      <div className="text-[10px] text-emerald-700 font-extrabold">Dikembalikan: {l.return_date}</div>
                    )}
                    {l.fine_amount > 0 && (
                      <div className="text-rose-700 font-extrabold">Denda: Rp {l.fine_amount.toLocaleString('id-ID')}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                  Anggota ini belum pernah melakukan peminjaman buku.
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setHistoryMember(null)}
                className="px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-150 rounded-xl transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
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
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-none">
                    {editingMember ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-455 text-slate-400 font-bold mt-1.5 font-semibold">
                    {editingMember ? 'Ubah informasi detail keanggotaan' : 'Daftarkan anggota perpustakaan baru'}
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
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Muhammad Rayhan"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Role Anggota *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const r = e.target.value as 'siswa' | 'guru';
                      setRole(r);
                      if (r === 'guru') setClassOrPosition('Guru Fiqih');
                      else setClassOrPosition('Kelas 7A');
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs cursor-pointer"
                  >
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru / Staf</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    {role === 'guru' ? 'NIP' : 'NIS (Nomor Induk)'} *
                  </label>
                  <input
                    type="text"
                    value={memberNumber}
                    onChange={(e) => setMemberNumber(e.target.value)}
                    placeholder="20237001"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    {role === 'guru' ? 'Mata Pelajaran / Jabatan' : 'Kelas'} *
                  </label>
                  <input
                    type="text"
                    value={classOrPosition}
                    onChange={(e) => setClassOrPosition(e.target.value)}
                    placeholder={role === 'guru' ? 'Guru Bahasa Arab' : 'Kelas 7A'}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs cursor-pointer"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <ImageUploader
                label="Foto Profil Anggota (Kamera HP / Upload File)"
                value={photoUrl}
                onChange={(url) => setPhotoUrl(url)}
                placeholder="https://images.unsplash.com/..."
                cloudName={settings.cloudinary_cloud_name}
                uploadPreset={settings.cloudinary_upload_preset}
                maxWidth={600}
                maxHeight={800}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">No. HP / WA</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all shadow-3xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
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
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
