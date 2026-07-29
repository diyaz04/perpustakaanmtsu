import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Repeat,
  UserCheck,
  BookmarkCheck,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  AlertCircle,
  LogOut,
  Library,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'books'
  | 'members'
  | 'loans'
  | 'visits'
  | 'reservations'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  counts: {
    books: number;
    members: number;
    activeLoans: number;
    overdueLoans: number;
    todayVisits: number;
    pendingReservations: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  counts,
}) => {
  const navItems = [
    {
      id: 'dashboard' as AdminTab,
      label: 'Dashboard Admin',
      icon: LayoutDashboard,
      badge: counts.overdueLoans > 0 ? `${counts.overdueLoans} Overdue` : null,
      badgeColor: 'bg-red-50 text-red-600 font-bold',
    },
    {
      id: 'books' as AdminTab,
      label: 'Koleksi Buku',
      icon: BookOpen,
      badge: counts.books,
      badgeColor: 'bg-slate-100 text-slate-600 font-semibold',
    },
    {
      id: 'members' as AdminTab,
      label: 'Anggota',
      icon: Users,
      badge: counts.members,
      badgeColor: 'bg-slate-100 text-slate-600 font-semibold',
    },
    {
      id: 'loans' as AdminTab,
      label: 'Sirkulasi',
      icon: Repeat,
      badge: counts.activeLoans,
      badgeColor: 'bg-amber-50 text-amber-700 font-bold',
    },
    {
      id: 'visits' as AdminTab,
      label: 'Absensi Kunjungan',
      icon: UserCheck,
      badge: `${counts.todayVisits} Hari Ini`,
      badgeColor: 'bg-blue-50 text-blue-700 font-bold',
    },
    {
      id: 'reservations' as AdminTab,
      label: 'Reservasi Buku',
      icon: BookmarkCheck,
      badge: counts.pendingReservations > 0 ? counts.pendingReservations : null,
      badgeColor: 'bg-emerald-600 text-white font-bold',
    },
    {
      id: 'reports' as AdminTab,
      label: 'Laporan',
      icon: FileSpreadsheet,
    },
    {
      id: 'settings' as AdminTab,
      label: 'Pengaturan',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col rounded-2xl lg:rounded-none lg:border-t-0 lg:border-b-0 border border-slate-200/80 p-4 space-y-6 shadow-xs">
      {/* Brand Header */}
      <div className="px-2 py-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-white border border-slate-200/80 rounded-xl p-1 flex items-center justify-center shadow-md shadow-slate-100 shrink-0 overflow-hidden">
          <img
            src="https://lh3.googleusercontent.com/d/1TsAyUBmWgRpU18qwOxLlmKvI-HL1kRvt"
            alt="Logo Perpustakaan"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 className="font-bold text-sm text-slate-900 leading-none">Perpustakaan</h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">MTs KH A Wahab Muhsin</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-slate-500 rounded-lg px-4 py-3 flex items-center justify-between text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-md shadow-green-100 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 ${
                    isActive ? 'bg-white/20 text-white font-bold' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile/Admin Card */}
      <div className="pt-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
            ZM
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[12px] font-bold text-slate-800 truncate">Zainul Muttaqin</p>
            <p className="text-[10px] text-slate-400 font-medium">Kepala Perpus</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

