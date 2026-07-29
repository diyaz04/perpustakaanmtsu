import React, { useState, useMemo } from 'react';
import { Member, Loan, LibrarySettings } from '../../types';
import { ImageUploader } from '../ImageUploader';
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
} from 'lucide-react';

interface MembersManagementViewProps {
  members: Member[];
  loans: Loan[];
  settings: LibrarySettings;
  onAddMember: (member: Omit<Member, 'id' | 'registered_at'>) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onOpenMemberCard: (member: Member) => void;
}

export const MembersManagementView: React.FC<MembersManagementViewProps> = ({
  members,
  loans,
  settings,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onOpenMemberCard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'siswa' | 'guru'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
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

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Anggota Baru</span>
        </button>
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
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Riwayat Pinjam: {historyMember.name}</h3>
              </div>
              <button
                onClick={() => setHistoryMember(null)}
                className="p-1 rounded-full hover:bg-white/20 text-slate-300"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3">
              {memberLoansHistory.length > 0 ? (
                memberLoansHistory.map((l) => (
                  <div
                    key={l.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="font-bold text-slate-900 flex justify-between">
                      <span>{l.book_title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          l.status === 'Terlambat'
                            ? 'bg-rose-100 text-rose-800'
                            : l.status === 'Dipinjam'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Pinjam: {l.loan_date}</span>
                      <span>Jatuh Tempo: {l.due_date}</span>
                    </div>
                    {l.return_date && (
                      <div className="text-[11px] text-emerald-700">Dikembalikan: {l.return_date}</div>
                    )}
                    {l.fine_amount > 0 && (
                      <div className="text-rose-700 font-bold">Denda: Rp {l.fine_amount.toLocaleString('id-ID')}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Anggota ini belum pernah melakukan peminjaman buku.
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setHistoryMember(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl"
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
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gradient-to-r from-green-700 to-emerald-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingMember ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-emerald-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Muhammad Rayhan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru / Staf</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {role === 'guru' ? 'NIP' : 'NIS (Nomor Induk)'} *
                  </label>
                  <input
                    type="text"
                    value={memberNumber}
                    onChange={(e) => setMemberNumber(e.target.value)}
                    placeholder="20237001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {role === 'guru' ? 'Mata Pelajaran / Jabatan' : 'Kelas'} *
                  </label>
                  <input
                    type="text"
                    value={classOrPosition}
                    onChange={(e) => setClassOrPosition(e.target.value)}
                    placeholder={role === 'guru' ? 'Guru Bahasa Arab' : 'Kelas 7A'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. HP / WA</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs"
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
