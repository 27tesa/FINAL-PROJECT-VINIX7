import React, { useState } from "react";
import {
  LayoutDashboard, BookOpen, Brain, BarChart3, Trophy, Bookmark,
  MessageSquare, Bell, Search, Menu, X, LogOut, Sparkles,
  ChevronRight, Settings, Wifi, WifiOff, User, HelpCircle,
  GraduationCap, Users, FileText, TrendingUp, Download
} from "lucide-react";

type Role = "student" | "teacher" | "donor";
type Page =
  | "dashboard" | "modules" | "quiz" | "analytics" | "leaderboard"
  | "bookmarks" | "forum" | "notifications" | "profile"
  | "progress" | "downloads" | "student";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const studentNavGroups: NavGroup[] = [
  {
    title: "Beranda",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Belajar",
    items: [
      { id: "modules", label: "Materi Pelajaran", icon: BookOpen },
      { id: "quiz", label: "Kuis & Latihan", icon: Brain },
      { id: "downloads", label: "Unduhan Offline", icon: Download },
    ],
  },
  {
    title: "Aktivitas",
    items: [
      { id: "progress", label: "Progres Belajar", icon: TrendingUp },
      { id: "bookmarks", label: "Materi Tersimpan", icon: Bookmark },
    ],
  },
  {
    title: "Komunitas",
    items: [
      { id: "leaderboard", label: "Papan Peringkat", icon: Trophy },
      { id: "forum", label: "Forum Diskusi", icon: MessageSquare, badge: "3" },
    ],
  },
];

const teacherNavGroups: NavGroup[] = [
  {
    title: "Beranda",
    items: [
      { id: "dashboard", label: "Dashboard Guru", icon: LayoutDashboard },
    ],
  },
  {
    title: "Kelas",
    items: [
      { id: "analytics", label: "Progres Siswa", icon: BarChart3 },
      { id: "quiz", label: "Buat Kuis AI", icon: Brain },
      { id: "modules", label: "Kelola Materi", icon: BookOpen },
    ],
  },
  {
    title: "Komunitas",
    items: [
      { id: "forum", label: "Forum Diskusi", icon: MessageSquare, badge: "5" },
    ],
  },
];

const donorNavGroups: NavGroup[] = [
  {
    title: "Beranda",
    items: [
      { id: "dashboard", label: "Dasbor Donatur", icon: LayoutDashboard },
    ],
  },
  {
    title: "Laporan",
    items: [
      { id: "analytics", label: "Laporan Dampak", icon: BarChart3 },
    ],
  },
];

interface LayoutProps {
  role: Role;
  userName: string;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
  notifCount?: number;
}

export function Layout({ role, userName, currentPage, onNavigate, onLogout, children, notifCount = 3 }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navGroups = role === "student" ? studentNavGroups : role === "teacher" ? teacherNavGroups : donorNavGroups;
  const roleLabel = role === "student" ? "Siswa" : role === "teacher" ? "Guru" : "Donatur";
  const roleIcon = role === "student" ? GraduationCap : role === "teacher" ? BookOpen : Users;
  const RoleIcon = roleIcon;

  const initials = userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const navigate = (page: Page) => {
    onNavigate(page);
    setSidebarOpen(false);
  };

  const isActive = (id: Page) => currentPage === id;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: "linear-gradient(135deg, #1E40AF, #2563EB)" }}
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 leading-none">Pintar</p>
              <p className="text-xs text-gray-400 leading-none mt-0.5">SDG 4 Education</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User card — clickable → Profile */}
        <button
          onClick={() => navigate("profile")}
          className={`mx-3 mt-3 p-3.5 rounded-2xl flex items-center gap-3 transition-all group ${
            currentPage === "profile"
              ? "bg-blue-600 shadow-md shadow-blue-200"
              : "bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              currentPage === "profile" ? "bg-white/20 text-white" : "bg-blue-600 text-white"
            }`}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className={`text-sm font-medium truncate ${currentPage === "profile" ? "text-white" : "text-gray-800"}`}>
              {userName}
            </p>
            <div className={`flex items-center gap-1 ${currentPage === "profile" ? "text-blue-200" : "text-blue-600"}`}>
              <RoleIcon className="w-3 h-3" />
              <span className="text-xs">{roleLabel}</span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${currentPage === "profile" ? "text-white/70" : "text-blue-400"}`} />
        </button>

        {/* Nav Groups */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-1.5">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        active
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                            active ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 pb-3 border-t border-gray-100 pt-3 space-y-0.5 flex-shrink-0">
          {/* Data Saver */}
          <button
            onClick={() => setDataSaver(!dataSaver)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              dataSaver ? "bg-green-50 text-green-700 border border-green-200" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            {dataSaver ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span className="flex-1 text-left">{dataSaver ? "Mode Hemat: ON" : "Mode Hemat Data"}</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${dataSaver ? "bg-green-500" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${dataSaver ? "left-4" : "left-0.5"}`} />
            </div>
          </button>

          {/* Notifications */}
          <button
            onClick={() => navigate("notifications")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              isActive("notifications") ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span className="flex-1 text-left">Notifikasi</span>
            {notifCount > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isActive("notifications") ? "bg-white/20 text-white" : "bg-red-500 text-white"}`}>
                {notifCount}
              </span>
            )}
          </button>

          {/* Help */}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all">
            <HelpCircle className="w-4 h-4" />
            <span className="flex-1 text-left">Bantuan</span>
          </button>

          {/* Profile / Settings shortcut */}
          <button
            onClick={() => navigate("profile")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              isActive("profile") ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="flex-1 text-left">Profil & Pengaturan</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 h-16 px-4 lg:px-6 flex items-center gap-4 flex-shrink-0">
          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700 p-1">
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb (desktop) */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>/</span>
            <span className="text-gray-700 font-medium capitalize">
              {currentPage === "dashboard" ? "Beranda"
                : currentPage === "modules" ? "Materi Pelajaran"
                : currentPage === "quiz" ? (role === "teacher" ? "Buat Kuis AI" : "Kuis & Latihan")
                : currentPage === "analytics" ? "Progres Siswa"
                : currentPage === "leaderboard" ? "Papan Peringkat"
                : currentPage === "bookmarks" ? "Tersimpan"
                : currentPage === "forum" ? "Forum Diskusi"
                : currentPage === "notifications" ? "Notifikasi"
                : currentPage === "profile" ? "Profil & Pengaturan"
                : currentPage === "progress" ? "Progres Belajar"
                : currentPage === "downloads" ? "Unduhan Offline"
                : currentPage}
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-auto lg:mx-0 lg:ml-4">
            {searchOpen ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari materi, topik, atau soal..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-400 hover:bg-gray-200 transition-colors w-full"
              >
                <Search className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">Cari materi, topik, soal...</span>
                <span className="text-xs border border-gray-300 rounded px-1.5 py-0.5 text-gray-400 hidden sm:block">⌘K</span>
              </button>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Notification bell */}
            <button
              onClick={() => navigate("notifications")}
              className={`relative p-2.5 rounded-xl transition-colors ${
                isActive("notifications") ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <Bell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Profile button */}
            <button
              onClick={() => navigate("profile")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                isActive("profile") ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium text-gray-800 leading-none">{userName.split(" ")[0]}</p>
                <p className="text-xs text-gray-400 leading-none mt-0.5">{roleLabel}</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
