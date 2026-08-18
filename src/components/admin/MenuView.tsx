import React, { useState, useEffect } from 'react';
import { Book, Member, Loan, Visit, LibrarySettings } from '../../types';
import bannerPagi from '../../../assets/library_admin_banner_pagi.jpg';
import bannerSiang from '../../../assets/library_admin_banner_siang.jpg';
import bannerSore from '../../../assets/library_admin_banner_sore.jpg';
import bannerMalam from '../../../assets/library_admin_banner_malam.jpg';
import {
  BookOpen,
  Users,
  Repeat,
  UserCheck,
  PlusCircle,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Search,
  Settings,
  AlertCircle,
} from 'lucide-react';

interface MenuViewProps {
  books: Book[];
  members: Member[];
  loans: Loan[];
  visits: Visit[];
  settings: LibrarySettings;
  onNavigateTab: (tab: any) => void;
  onOpenNewLoan: () => void;
  isSupabaseConnected: boolean;
}

export const MenuView: React.FC<MenuViewProps> = ({
  books,
  members,
  loans,
  visits,
  settings,
  onNavigateTab,
  onOpenNewLoan,
  isSupabaseConnected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    master: true,
    sirkulasi: true,
  });

  const getTimeConfig = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 11) {
      return {
        greeting: 'Selamat Pagi',
        image: bannerPagi,
        gradient: 'from-sky-50 via-amber-50/50 to-emerald-50/70 border-slate-200/60',
        textColor: 'text-slate-900',
        descColor: 'text-slate-600',
        badgeClass: 'bg-emerald-100/70 border-emerald-200 text-emerald-800',
        sparkleColor: 'text-emerald-600',
      };
    } else if (hour >= 11 && hour < 15) {
      return {
        greeting: 'Selamat Siang',
        image: bannerSiang,
        gradient: 'from-blue-50 via-teal-50/50 to-emerald-50/60 border-slate-200/60',
        textColor: 'text-slate-900',
        descColor: 'text-slate-600',
        badgeClass: 'bg-emerald-100/70 border-emerald-200 text-emerald-800',
        sparkleColor: 'text-emerald-600',
      };
    } else if (hour >= 15 && hour < 18) {
      return {
        greeting: 'Selamat Sore',
        image: bannerSore,
        gradient: 'from-orange-50 via-rose-50/50 to-amber-100/40 border-slate-200/60',
        textColor: 'text-slate-900',
        descColor: 'text-slate-600',
        badgeClass: 'bg-orange-100/70 border-orange-200 text-orange-800',
        sparkleColor: 'text-orange-600',
      };
    } else {
      return {
        greeting: 'Selamat Malam',
        image: bannerMalam,
        gradient: 'from-slate-900 via-indigo-950 to-slate-900 border-indigo-950/40',
        textColor: 'text-white',
        descColor: 'text-slate-300',
        badgeClass: 'bg-indigo-900/60 border-indigo-700 text-indigo-200',
        sparkleColor: 'text-indigo-400',
      };
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const sections = [
    {
      id: 'master',
      title: 'Master Data',
      featuresCount: 2,
      icon: BookOpen,
      iconBg: 'bg-emerald-50 text-emerald-600',
      features: [
        {
          name: 'Kelola Koleksi Buku',
          desc: 'Manajemen katalog buku, kategori, rak, dan e-book.',
          action: () => onNavigateTab('books'),
        },
        {
          name: 'Kelola Data Anggota',
          desc: 'Manajemen kartu perpustakaan untuk siswa dan guru.',
          action: () => onNavigateTab('members'),
        },
      ],
    },
    {
      id: 'sirkulasi',
      title: 'Layanan Sirkulasi & Transaksi',
      featuresCount: 3,
      icon: Repeat,
      iconBg: 'bg-emerald-50 text-emerald-600',
      features: [
        {
          name: 'Pencatatan Peminjaman',
          desc: 'Input transaksi pinjam buku menggunakan scanner barcode.',
          action: onOpenNewLoan,
        },
        {
          name: 'Pengembalian & Perpanjangan',
          desc: 'Proses pengembalian, perpanjangan, dan hitung denda.',
          action: () => onNavigateTab('loans'),
        },
        {
          name: 'Konfirmasi Reservasi Buku',
          desc: 'Lihat daftar antrean booking buku dari katalog publik.',
          action: () => onNavigateTab('reservations'),
        },
      ],
    },
    {
      id: 'absensi',
      title: 'Absensi & Kehadiran',
      featuresCount: 1,
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600',
      features: [
        {
          name: 'Pencatatan Buku Tamu / Kunjungan',
          desc: 'Catat absensi kunjungan harian perpustakaan.',
          action: () => onNavigateTab('visits'),
        },
      ],
    },
    {
      id: 'sistem',
      title: 'Manajemen Sistem & Database',
      featuresCount: 3,
      icon: Settings,
      iconBg: 'bg-emerald-50 text-emerald-600',
      features: [
        {
          name: 'Identitas & Aturan Sirkulasi',
          desc: 'Atur nama madrasah, tarif denda, dan lama pinjam.',
          action: () => onNavigateTab('settings'),
        },
        {
          name: 'Konfigurasi Supabase & Cloudinary',
          desc: 'Koneksikan database cloud dan integrasikan penyimpanan media.',
          action: () => onNavigateTab('settings'),
        },
        {
          name: 'Manajemen Akun Pengelola',
          desc: 'Daftarkan petugas perpustakaan dan atur izin akses modul.',
          action: () => onNavigateTab('managers'),
        },
      ],
    },
  ];

  // Auto-expand sections that have search matches
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const autoExpand: Record<string, boolean> = {};
      sections.forEach((s) => {
        const hasMatch = s.features?.some(
          (f) =>
            f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.desc.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (hasMatch || s.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          autoExpand[s.id] = true;
        }
      });
      setExpandedSections(autoExpand);
    }
  }, [searchQuery]);

  // Filter sections and features based on search
  const filteredSections = sections
    .map((section) => {
      const matchingFeatures = section.features?.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return {
        ...section,
        features: matchingFeatures,
      };
    })
    .filter((section) => {
      return section.features && section.features.length > 0;
    });

  return (
    <div className="space-y-6">
      {!isSupabaseConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 sm:p-5 flex gap-3.5 text-left select-none shadow-3xs animate-pulse">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-black text-amber-900 leading-tight">
              Mode Database Lokal (Belum Terintegrasi Supabase)
            </h4>
            <p className="text-[10px] sm:text-xs text-amber-700 leading-relaxed font-semibold">
              Aplikasi saat ini berjalan offline dan hanya menyimpan data di perangkat ini (tidak tersinkronisasi). 
              Hubungkan database Supabase Anda melalui tab <strong>Pengaturan</strong> di bawah, atau atur Environment Variables di Vercel agar data tersimpan aman di Cloud dan dapat diakses dari HP / komputer lain.
            </p>
          </div>
        </div>
      )}

      <div className="relative">
      {(() => {
        const timeConfig = getTimeConfig();
        const isDark = timeConfig.greeting === 'Selamat Malam';
        return (
          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${timeConfig.gradient} border p-5 sm:p-8 flex justify-between items-center gap-4 shadow-2xs transition-all duration-500 select-none`}>
            {/* Banner text info */}
            <div className={`space-y-3.5 max-w-lg text-left z-10 pr-24 xs:pr-32 sm:pr-48 md:pr-56 ${timeConfig.textColor}`}>
              <div className="space-y-1">
                <p className={`text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 justify-start ${isDark ? 'text-indigo-300' : 'text-slate-500'}`}>
                  <span>👋</span>
                  {timeConfig.greeting}
                </p>
                <h3 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
                  {settings.head_librarian || 'Ayu Siti Fatimah'}
                </h3>
              </div>
              <p className={`text-[10px] sm:text-xs leading-relaxed ${timeConfig.descColor}`}>
                Semoga hari ini penuh berkah dan kemudahan dalam mengelola sirkulasi dan koleksi literasi{' '}
                <strong className={isDark ? 'text-white' : 'text-slate-850'}>
                  {settings.library_name || 'Perpustakaan MTs KHWM'}
                </strong>.
              </p>

              {/* White badge card matching mockup */}
              <div className="flex items-center gap-2.5 bg-white p-1.5 pr-3 pl-2.5 rounded-xl border border-slate-200/50 shadow-3xs w-fit">
                <div className="w-6 h-6 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="text-left leading-none">
                  <p className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">Akses Akun</p>
                  <p className="text-[10px] text-slate-800 font-extrabold mt-0.5">Admin</p>
                </div>
              </div>
            </div>

            {/* Banner Illustration Image - borderless, fills right side, visible on mobile, blends with gradient */}
            <div className="absolute right-0 top-0 bottom-0 h-full w-28 xs:w-36 sm:w-64 md:w-80 overflow-hidden rounded-r-3xl shrink-0 pointer-events-none">
              {/* Fade out mask from left to right */}
              <div className={`absolute inset-0 bg-gradient-to-r ${
                timeConfig.greeting === 'Selamat Malam'
                  ? 'from-slate-900 via-slate-900/35 to-transparent'
                  : timeConfig.greeting === 'Selamat Sore'
                  ? 'from-orange-50 via-orange-50/20 to-transparent'
                  : timeConfig.greeting === 'Selamat Siang'
                  ? 'from-blue-50 via-blue-50/20 to-transparent'
                  : 'from-sky-50 via-sky-50/20 to-transparent'
              } z-10`} />
              <img
                src={timeConfig.image}
                alt="Librarian Illustration"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 object-center"
              />
            </div>
          </div>
        );
      })()}
      </div>

      {/* Search Services Bar */}
      <div className="relative">
        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari menu atau layanan di sini..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-3xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Services List / Accordions */}
      <div className="space-y-4">
        {filteredSections.map((section) => {
          const isExpanded = !!expandedSections[section.id];
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden transition-all duration-300"
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer hover:bg-slate-50 transition-colors select-none"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${section.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-tight">
                      {section.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      {section.featuresCount} fitur layanan
                    </p>
                  </div>
                </div>
                <div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {section.features?.map((feature, fIdx) => (
                      <div
                        key={fIdx}
                        onClick={feature.action}
                        className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-3xs hover:border-emerald-500/80 hover:shadow-xs transition-all duration-200 cursor-pointer flex justify-between items-center group select-none"
                      >
                        <div className="space-y-1 pr-4 min-w-0">
                          <h5 className="text-[11px] sm:text-xs font-black text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                            {feature.name}
                          </h5>
                          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                            {feature.desc}
                          </p>
                        </div>
                        <div className="w-6 h-6 rounded-lg bg-slate-50 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 flex items-center justify-center shrink-0 transition-colors">
                          <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-3xs">
            <p className="text-xs text-slate-400 italic">
              Tidak ada menu atau layanan yang cocok dengan pencarian Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
