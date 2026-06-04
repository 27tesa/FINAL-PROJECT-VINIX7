import { BookOpen, Flame, Trophy, Target, Clock, Download, Star, TrendingUp, PlayCircle, CheckCircle2, ArrowRight, Zap } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

interface StudentDashboardProps {
  userName: string;
  onNavigate: (page: any) => void;
  summary?: {
    averageScore: number;
    completedModules: number;
    downloadedModules: number;
    streakDays: number;
    attempts: number;
    minutesLearned: number;
  } | null;
  recentModules?: Array<{
    title: string;
    subject: string;
    duration: string;
    type: string;
    completed: boolean;
    downloaded?: boolean;
  }>;
  notifications?: Array<{ title?: string; message?: string; time?: string; type?: string; kind?: string; read?: boolean }>;
  weeklyData?: Array<{ day: string; menit: number; value?: number }>;
  subjectProgress?: Array<{ subject: string; progress: number; modules: number; completed: number }>;
}

const defaultWeeklyData: Array<{ day: string; menit: number; value?: number }> = [
  { day: "Sen", menit: 45 },
  { day: "Sel", menit: 30 },
  { day: "Rab", menit: 60 },
  { day: "Kam", menit: 20 },
  { day: "Jum", menit: 75 },
  { day: "Sab", menit: 90 },
  { day: "Min", menit: 55 },
];

const defaultSubjects = [
  { name: "Matematika", progress: 72, color: "#3B82F6", icon: "📐", modules: 12 },
  { name: "Bahasa Indonesia", progress: 88, color: "#8B5CF6", icon: "📝", modules: 10 },
  { name: "IPA", progress: 55, color: "#10B981", icon: "🔬", modules: 15 },
  { name: "IPS", progress: 40, color: "#F59E0B", icon: "🌍", modules: 8 },
];

const defaultRecentModules = [
  { title: "Persamaan Kuadrat", subject: "Matematika", duration: "25 mnt", type: "video", completed: true },
  { title: "Teks Argumentasi", subject: "Bhs. Indonesia", duration: "20 mnt", type: "baca", completed: true },
  { title: "Sistem Tata Surya", subject: "IPA", duration: "35 mnt", type: "video", completed: false },
  { title: "Perang Dunia II", subject: "IPS", duration: "30 mnt", type: "baca", completed: false },
];

const defaultNotifications = [
  { text: "Kuis Matematika Bab 5 dimulai besok", time: "2j lalu", type: "quiz" },
  { text: "Kamu naik ke peringkat 3 leaderboard!", time: "5j lalu", type: "achievement" },
  { text: "Materi baru: Sel & Jaringan Tumbuhan tersedia", time: "1h lalu", type: "new" },
];

export function StudentDashboard({ userName, onNavigate, summary, recentModules, notifications, weeklyData, subjectProgress }: StudentDashboardProps) {
  const firstName = userName.split(" ")[0] || "Pengguna";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Malam";

  const statsSummary = summary ?? {
    averageScore: 0,
    completedModules: 0,
    downloadedModules: 0,
    streakDays: 0,
    attempts: 0,
    minutesLearned: 0,
  };

  const progressPct = Math.min(100, Math.round((statsSummary.streakDays / 7) * 100));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  const weeklyChartData = (weeklyData && weeklyData.length ? weeklyData : defaultWeeklyData).map((item) => ({
    day: item.day,
    menit: Number(item.menit ?? item.value ?? 0),
  }));

  const subjectColorMap: Record<string, string> = {
    "Matematika": "#3B82F6",
    "Bahasa Indonesia": "#8B5CF6",
    "IPA": "#10B981",
    "IPS": "#F59E0B",
    "Bhs. Inggris": "#EC4899",
    "PKN": "#F97316",
    Umum: "#64748B",
  };

  const subjectIconMap: Record<string, string> = {
    "Matematika": "📐",
    "Bahasa Indonesia": "📝",
    "IPA": "🔬",
    "IPS": "🌍",
    "Bhs. Inggris": "🗣️",
    "PKN": "🏛️",
    Umum: "📚",
  };

  const subjectsToDisplay = subjectProgress && subjectProgress.length
    ? subjectProgress.map((item) => ({
      name: item.subject,
      progress: item.progress,
      color: subjectColorMap[item.subject] ?? "#3B82F6",
      icon: subjectIconMap[item.subject] ?? "📚",
      modules: item.modules,
    }))
    : defaultSubjects;

  const moduleItems = recentModules ?? [];
  const notificationItems = notifications ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Hero Greeting */}
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 text-white" style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)" }}>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm mb-1">{greeting}, 👋</p>
            <h1 className="text-white mb-2">{firstName}!</h1>
            <p className="text-blue-100 text-sm">Kamu sudah belajar <strong className="text-yellow-300">{progressPct}%</strong> dari target minggu ini. Terus semangat!</p>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                <Flame className="w-4 h-4 text-orange-300" />
                <span>7 hari streak</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                <Trophy className="w-4 h-4 text-yellow-300" />
                <span>Peringkat #3</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-32 h-32 relative flex items-center justify-center">
              <svg width="128" height="128" className="-rotate-90">
                <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
                <circle
                  cx="64" cy="64" r={radius} fill="none"
                  stroke="white" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{progressPct}%</span>
              </div>
            </div>
            <p className="text-center text-blue-200 text-xs mt-1">Target Mingguan</p>
          </div>
        </div>
        {/* decorative circles */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Poin", value: `${statsSummary.attempts * 50}`, icon: Star, color: "bg-yellow-50 text-yellow-600", trend: statsSummary.attempts ? `${statsSummary.attempts} percobaan` : "Belum ada kuis" },
          { label: "Modul Selesai", value: `${statsSummary.completedModules}`, icon: CheckCircle2, color: "bg-green-50 text-green-600", trend: `${statsSummary.completedModules} modul selesai` },
          { label: "Menit Belajar", value: `${statsSummary.minutesLearned} mnt`, icon: Clock, color: "bg-blue-50 text-blue-600", trend: `${statsSummary.streakDays} hari streak` },
          { label: "Materi Offline", value: `${statsSummary.downloadedModules}`, icon: Download, color: "bg-purple-50 text-purple-600", trend: "tersimpan" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.trend}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progress per Mata Pelajaran */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Progres Mata Pelajaran</h3>
            <button onClick={() => onNavigate("modules")} className="text-sm text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
              Lihat semua <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {subjectsToDisplay.map((subj) => (
              <div key={subj.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>{subj.icon}</span>
                    <span>{subj.name}</span>
                    <span className="text-xs text-gray-400">({subj.modules} modul)</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: subj.color }}>{subj.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${subj.progress}%`, background: subj.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aktivitas Belajar */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="text-gray-900 mb-1">Aktivitas Minggu Ini</h3>
          <p className="text-xs text-gray-400 mb-4">Total: {statsSummary.minutesLearned} menit</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={weeklyChartData}>
              <defs>
                <linearGradient id="colorMenit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#1E40AF", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                formatter={(v: number) => [`${v} mnt`, "Belajar"]}
              />
              <Area type="monotone" dataKey="menit" stroke="#2563EB" strokeWidth={2} fill="url(#colorMenit)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-blue-700">Naik <strong>24%</strong> dari minggu lalu</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lanjutkan Belajar */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Lanjutkan Belajar</h3>
            <button onClick={() => onNavigate("modules")} className="text-sm text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
              Lihat semua <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {moduleItems.map((mod, i) => (
              <div key={i} className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${mod.completed ? "border-green-100 bg-green-50/50" : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${mod.type === "video" ? "bg-blue-100" : "bg-purple-100"}`}>
                  {mod.type === "video" ? <PlayCircle className="w-5 h-5 text-blue-600" /> : <BookOpen className="w-5 h-5 text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{mod.title}</p>
                  <p className="text-xs text-gray-500">{mod.subject} • {mod.duration}</p>
                </div>
                {mod.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notifikasi */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Notifikasi</h3>
            <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">{notificationItems.length}</span>
          </div>
          <div className="space-y-3">
            {notificationItems.map((notif, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.type === "quiz" ? "bg-orange-400" : notif.type === "achievement" ? "bg-yellow-400" : "bg-blue-400"}`}></div>
                <div>
                  <p className="text-xs text-gray-700 leading-relaxed">{notif.title ?? notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Rekomendasi AI */}
          <div className="mt-4 p-3 rounded-xl border border-purple-200 bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-medium text-purple-700">Rekomendasi AI</p>
            </div>
            <p className="text-xs text-purple-600">Coba latihan soal <strong>Sistem Persamaan Linear</strong> — kamu hampir menguasainya!</p>
            <button onClick={() => onNavigate("quiz")} className="mt-2 text-xs text-purple-700 font-medium hover:underline">
              Mulai Latihan →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
