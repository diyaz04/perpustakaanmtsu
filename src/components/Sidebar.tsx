import React from 'react';
import { Book, Member, Loan, Visit, LibrarySettings, Manager } from '../types';
import {
  LayoutDashboard,
  LayoutGrid,
  BookOpen,
  Users,
  Repeat,
  UserCheck,
  BookmarkCheck,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  LogOut,
  Library,
  ShieldCheck,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'menu'
  | 'books'
  | 'members'
  | 'loans'
  | 'visits'
  | 'reservations'
  | 'reports'
  | 'settings'
  | 'managers';

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
  settings: LibrarySettings;
  onLogout?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentManager?: Manager | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  counts,
  settings,
  onLogout,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const menuUtamaItems = [
    {
      id: 'menu' as AdminTab,
      label: 'Menu',
      icon: LayoutGrid,
    },
    {
      id: 'dashboard' as AdminTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
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
  ];

  const masterSettingsItems = [
    {
      id: 'reports' as AdminTab,
      label: 'Laporan',
      icon: FileSpreadsheet,
    },
    {
      id: 'managers' as AdminTab,
      label: 'Pengelola',
      icon: ShieldCheck,
    },
    {
      id: 'settings' as AdminTab,
      label: 'Pengaturan',
      icon: Settings,
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const renderItem = (item: typeof menuUtamaItems[0]) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        title={isCollapsed ? item.label : undefined}
        className={`w-full text-slate-500 rounded-xl px-4 py-3 flex items-center justify-between text-xs font-semibold transition-all cursor-pointer select-none ${
          isActive
            ? 'bg-emerald-50 text-emerald-700 font-bold shadow-xs'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        } ${isCollapsed ? 'justify-center px-2' : ''}`}
      >
        <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="relative flex items-center justify-center shrink-0">
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
            {isCollapsed && item.badge !== null && item.badge !== undefined && (
              <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </div>
          {!isCollapsed && <span className="truncate">{item.label}</span>}
        </div>

        {!isCollapsed && item.badge !== null && item.badge !== undefined && (
          <span
            className={`px-2 py-0.5 rounded-lg text-[9px] shrink-0 font-bold ${
              isActive ? 'bg-emerald-600/10 text-emerald-700' : item.badgeColor
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className={`w-full bg-white border-r border-slate-200 shrink-0 flex flex-col rounded-2xl lg:rounded-none lg:border-t-0 lg:border-b-0 border border-slate-200/80 p-4 space-y-6 shadow-xs transition-all duration-300 ${
      isCollapsed ? 'lg:w-20 lg:p-3' : 'lg:w-64 lg:p-4'
    }`}>
      {/* Brand Header */}
      <div className={`px-2 py-2 flex items-center justify-between ${isCollapsed ? 'flex-col gap-4' : 'gap-3'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-white border border-slate-200/80 rounded-xl p-1 flex items-center justify-center shadow-md shadow-slate-100 shrink-0 overflow-hidden">
            <img
              src={settings.logo_url || "https://lh3.googleusercontent.com/d/1TsAyUBmWgRpU18qwOxLlmKvI-HL1kRvt"}
              alt="Logo Perpustakaan"
              className="w-full h-full object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-xs text-slate-900 leading-none truncate uppercase tracking-tight">
                {settings.library_name ? settings.library_name.replace('Perpustakaan ', '') : 'PERPUSTAKAAN'}
              </h1>
              <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider font-bold truncate">
                {settings.school_name || 'MTs KHWM'}
              </p>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? "Buka Sidebar" : "Kecilkan Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-5 overflow-y-auto">
        {/* Menu Utama */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Menu Utama</p>
          )}
          {menuUtamaItems.map(renderItem)}
        </div>

        {/* Master & Pengaturan */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Master & Pengaturan</p>
          )}
          {masterSettingsItems.map(renderItem)}
        </div>
      </nav>

      {/* Profile/Admin Card */}
      <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
        <div className={`bg-slate-50 rounded-xl p-3 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center font-bold text-emerald-800 text-xs shrink-0 shadow-2xs">
            {getInitials(settings.head_librarian || 'Petugas')}
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] font-bold text-slate-800 truncate">{settings.head_librarian || 'Zainul Muttaqin'}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Kepala Perpus</p>
            </div>
          )}
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            title={isCollapsed ? "Keluar Portal" : undefined}
            className={`w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-100 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isCollapsed ? 'px-0' : ''
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            {!isCollapsed && <span>Keluar Portal</span>}
          </button>
        )}
      </div>
    </aside>
  );
};

