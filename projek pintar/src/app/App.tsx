import React, { useState, useEffect, lazy, Suspense } from "react";
import { LoginPage } from "./components/LoginPage";
import { Layout } from "./components/Layout";
import { StudentDashboard } from "./components/StudentDashboard";
import { ErrorBoundary, LoadingFallback } from "./components/ErrorBoundary";
const TeacherDashboard = lazy(() => import("./components/TeacherDashboard").then((m) => ({ default: m.TeacherDashboard })));
const TeacherAnalyticsPage = lazy(() => import("./components/TeacherAnalyticsPage").then((m) => ({ default: m.TeacherAnalyticsPage })));
const StudentDetailPage = lazy(() => import("./components/StudentDetailPage"));
import { ModuleLibrary } from "./components/ModuleLibrary";
const AIQuizMaker = lazy(() => import("./components/AIQuizMaker").then((m) => ({ default: m.AIQuizMaker })));
import { Leaderboard } from "./components/Leaderboard";
import { Forum } from "./components/Forum";
import { ProfilePage } from "./components/ProfilePage";
import { BookOpen, Star, Bookmark, Bell, Clock, CheckCircle2, TrendingUp, Download, WifiOff, Play, FileText, Headphones } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import {
  getUserNotifications,
  markAllNotificationsRead,
  signUpWithRole,
  signIn,
  requestPasswordReset,
  getProfile,
  getUserSummary,
  getUserRecentModules,
  getLeaderboard,
  getProgressSnapshots,
  getUserSubjectProgress,
} from "../lib/app-data";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area,
} from "recharts";

type Role = "student" | "teacher" | "donor";
type Page =
  | "dashboard" | "modules" | "quiz" | "analytics" | "leaderboard"
  | "bookmarks" | "forum" | "notifications" | "profile"
  | "progress" | "downloads" | "student";

interface BookmarksPageProps {
  userId: string | null;
}

function BookmarksPage({ userId }: BookmarksPageProps) {
  const [bookmarked, setBookmarked] = React.useState<any[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = React.useState(false);

  React.useEffect(() => {
    if (!userId) {
      setBookmarked([]);
      return;
    }
    (async () => {
      setBookmarksLoading(true);
      try {
        const { getUserBookmarkedModules } = await import("../../lib/app-data");
        const data = await getUserBookmarkedModules(userId);
        setBookmarked(data ?? []);
      } catch (err) {
        console.error("Failed to load bookmarks", err);
        setBookmarked([]);
      } finally {
        setBookmarksLoading(false);
      }
    })();
  }, [userId]);

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <h2 className="text-gray-900 mb-1">Materi Tersimpan</h2>
      <p className="text-gray-500 text-sm mb-6">{bookmarked.length} item tersimpan</p>
      {bookmarksLoading ? (
        <div className="text-center py-20"><p className="text-gray-400">Memuat...</p></div>
      ) : (
        <>
          <div className="space-y-3">
            {bookmarked.map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Bookmark className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.subject} • {item.type}</p>
                </div>
                <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            ))}
          </div>
          {bookmarked.length === 0 && (
            <div className="text-center py-20">
              <p className="text-5xl mb-3">🔖</p>
              <p className="text-gray-500">Belum ada materi yang disimpan.</p>
              <p className="text-sm text-gray-400 mt-1">Tekan ikon bookmark pada materi untuk menyimpannya di sini.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Notifications Page
function NotificationsPage({
  role,
  notifications,
  onMarkAllRead,
}: {
  role: Role;
  notifications: any[];
  onMarkAllRead: () => Promise<void>;
}) {
  const filteredNotifications = notifications;

  const unreadCount = filteredNotifications.filter((n) => !n.read).length;

  const typeStyle: Record<string, { icon: string; color: string }> = {
    quiz: { icon: "📝", color: "bg-orange-50 border-orange-100" },
    achievement: { icon: "🏆", color: "bg-yellow-50 border-yellow-100" },
    new: { icon: "📚", color: "bg-blue-50 border-blue-100" },
    reminder: { icon: "⏰", color: "bg-purple-50 border-purple-100" },
    forum: { icon: "💬", color: "bg-green-50 border-green-100" },
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-900">Notifikasi</h2>
          <p className="text-gray-500 text-sm">{unreadCount} belum dibaca</p>
        </div>
        <button onClick={onMarkAllRead} className="text-sm text-blue-600 hover:underline">Tandai semua dibaca</button>
      </div>
      <div className="space-y-3">
        {filteredNotifications.map((n: any, i: number) => {
          const style = typeStyle[n.kind] || { icon: "🔔", color: "bg-gray-50 border-gray-100" };
          return (
            <div key={i} className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-sm ${style.color} ${!n.read ? "shadow-sm" : "opacity-70"}`}>
              <span className="text-2xl flex-shrink-0">{style.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${!n.read ? "text-gray-900" : "text-gray-600"}`}>{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></span>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message ?? n.content ?? n.desc}</p>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(n.created_at ?? n.time ?? Date.now()).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Donor Dashboard
function DonorDashboard({ userName }: { userName: string }) {
  const impactData = [
    { month: "Jan", siswa: 120 },
    { month: "Feb", siswa: 180 },
    { month: "Mar", siswa: 250 },
    { month: "Apr", siswa: 320 },
    { month: "Mei", siswa: 410 },
    { month: "Jun", siswa: 520 },
  ];

  const schools = [
    { name: "SDN 12 Nusa Tenggara", province: "NTT", need: "Buku & Perangkat", urgency: "kritis", score: 38 },
    { name: "SMPN 5 Kepulauan Aru", province: "Maluku", need: "Koneksi Internet", urgency: "tinggi", score: 52 },
    { name: "SMAN 2 Flores Timur", province: "NTT", need: "Seragam & Alat Tulis", urgency: "tinggi", score: 61 },
    { name: "MTs Al-Hidayah", province: "Kalbar", need: "Laboratorium IPA", urgency: "sedang", score: 70 },
  ];

  const urgencyBadge: Record<string, string> = {
    kritis: "bg-red-100 text-red-700",
    tinggi: "bg-orange-100 text-orange-700",
    sedang: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-gray-900">Dasbor Transparansi Donatur</h2>
        <p className="text-gray-500 text-sm">Pantau dampak bantuan pendidikan Anda secara real-time</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Siswa Terbantu", value: "1,540", icon: "👨‍🎓", color: "bg-blue-50" },
          { label: "Sekolah Terdampak", value: "48", icon: "🏫", color: "bg-green-50" },
          { label: "Donasi Disalurkan", value: "Rp 82jt", icon: "💰", color: "bg-yellow-50" },
          { label: "Provinsi Terjangkau", value: "12", icon: "🗺️", color: "bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 border border-gray-100`}>
            <p className="text-2xl mb-2">{s.icon}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="text-gray-900 mb-4">Pertumbuhan Siswa Terjangkau</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={impactData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: "12px", fontSize: "12px" }} />
              <Bar dataKey="siswa" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Siswa" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="text-gray-900 mb-4">Sekolah Prioritas Bantuan</h3>
          <div className="space-y-3">
            {schools.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-sm font-bold text-red-700 flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.province} • {s.need}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${urgencyBadge[s.urgency]}`}>{s.urgency}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <h3 className="text-white mb-2">Salurkan Bantuan Sekarang</h3>
        <p className="text-blue-100 text-sm mb-4">Pilih sekolah yang membutuhkan dan jenis bantuan yang ingin Anda berikan.</p>
        <div className="flex flex-wrap gap-3">
          {["Beasiswa Siswa", "Buku & Seragam", "Fasilitas Sekolah", "Akses Internet"].map((type) => (
            <button key={type} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors">
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Quiz Page for Students
function QuizPage() {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const questions = [
    { q: "Berapakah akar-akar dari x² - 5x + 6 = 0?", opts: ["x=1, x=6", "x=2, x=3", "x=-2, x=-3", "x=0, x=5"], correct: 1 },
    { q: "Nilai diskriminan dari 2x² + 4x - 6 = 0 adalah?", opts: ["D=16", "D=48", "D=64", "D=32"], correct: 2 },
    { q: "Rumus kuadratik digunakan ketika...", opts: ["Angkanya mudah difaktorkan", "Nilai a = 0", "Tidak bisa difaktorkan", "b selalu positif"], correct: 2 },
  ];

  if (finished) {
    const correct = answered.filter(Boolean).length;
    return (
      <div className="p-4 lg:p-6 max-w-xl mx-auto text-center">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <p className="text-5xl mb-4">{correct === questions.length ? "🎉" : correct >= 2 ? "👏" : "💪"}</p>
          <h2 className="text-gray-900 mb-2">Kuis Selesai!</h2>
          <p className="text-gray-500 text-sm mb-6">Kamu menjawab {correct} dari {questions.length} soal dengan benar</p>
          <div className="text-4xl font-bold text-blue-600 mb-6">{Math.round((correct / questions.length) * 100)}%</div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-green-50 rounded-xl p-3"><p className="font-bold text-green-700">{correct}</p><p className="text-xs text-gray-500">Benar</p></div>
            <div className="bg-red-50 rounded-xl p-3"><p className="font-bold text-red-700">{questions.length - correct}</p><p className="text-xs text-gray-500">Salah</p></div>
            <div className="bg-yellow-50 rounded-xl p-3"><p className="font-bold text-yellow-700">+{correct * 50}</p><p className="text-xs text-gray-500">Poin</p></div>
          </div>
          <button onClick={() => { setStarted(false); setCurrent(0); setSelected(null); setAnswered([]); setFinished(false); }} className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="p-4 lg:p-6 max-w-xl mx-auto">
        <h2 className="text-gray-900 mb-1">Kuis & Latihan</h2>
        <p className="text-gray-500 text-sm mb-6">Uji pemahaman kamu dengan soal adaptif</p>
        <div className="space-y-3 mb-6">
          {[
            { title: "Kuis Persamaan Kuadrat", subject: "Matematika", questions: 3, duration: "5 mnt", difficulty: "Sedang", points: 150 },
            { title: "Latihan Teks Argumentasi", subject: "Bhs. Indonesia", questions: 5, duration: "8 mnt", difficulty: "Mudah", points: 100 },
            { title: "Soal Fotosintesis", subject: "IPA", questions: 4, duration: "6 mnt", difficulty: "Sulit", points: 200 },
          ].map((quiz, i) => (
            <div key={i} className={`bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 ${i === 0 ? "cursor-pointer hover:border-blue-200 hover:shadow-sm" : "opacity-60"} transition-all`} onClick={i === 0 ? () => setStarted(true) : undefined}>
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{quiz.title}</p>
                <p className="text-xs text-gray-500">{quiz.subject} • {quiz.questions} soal • {quiz.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-yellow-600">+{quiz.points} pts</p>
                <p className="text-xs text-gray-400">{quiz.difficulty}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="p-4 lg:p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Soal {current + 1} dari {questions.length}</p>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`w-6 h-1.5 rounded-full ${i < current ? "bg-green-400" : i === current ? "bg-blue-500" : "bg-gray-200"}`}></div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-4">
        <p className="text-gray-800 leading-relaxed mb-6">{q.q}</p>
        <div className="space-y-3">
          {q.opts.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm text-left border transition-all ${selected === i ? "border-blue-500 bg-blue-50 text-blue-800" : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50/50"}`}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium flex-shrink-0 ${selected === i ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <button
        disabled={selected === null}
        onClick={() => {
          const isCorrect = selected === q.correct;
          const newAnswered = [...answered, isCorrect];
          setAnswered(newAnswered);
          if (current + 1 < questions.length) {
            setCurrent(current + 1);
            setSelected(null);
          } else {
            setFinished(true);
          }
        }}
        className="w-full py-3.5 rounded-xl text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
        style={{ background: "linear-gradient(135deg, #1E40AF, #2563EB)" }}
      >
        {current + 1 < questions.length ? "Soal Berikutnya" : "Selesai"}
      </button>
    </div>
  );
}

// ─── Progress Page ───────────────────────────────────────────────────────────
interface ProgressPageProps {
  userId: string | null;
  weeklyData: any[];
  subjectProgress: any[];
}

function ProgressPage({ userId, weeklyData = [], subjectProgress = [] }: ProgressPageProps) {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h2 className="text-gray-900 mb-1">Progres Belajar</h2>
        <p className="text-gray-500 text-sm">Pantau perkembangan belajarmu secara detail</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Belajar", value: weeklyData.reduce((s: any, d: any) => s + (d.menit || 0), 0).toString() + " mnt", sub: "minggu ini", icon: Clock, color: "bg-blue-50 text-blue-600" },
          { label: "Soal Dikerjakan", value: weeklyData.reduce((s: any, d: any) => s + (d.soal || 0), 0).toString(), sub: "minggu ini", icon: CheckCircle2, color: "bg-green-50 text-green-600" },
          { label: "Mata Pelajaran", value: subjectProgress.length.toString(), sub: "sedang belajar", icon: Star, color: "bg-yellow-50 text-yellow-600" },
          { label: "Rata-rata Progress", value: subjectProgress.length > 0 ? Math.round(subjectProgress.reduce((s: any, p: any) => s + (p.progress || p.average || 0), 0) / subjectProgress.length).toString() + "%" : "-", sub: "semua mapel", icon: BookOpen, color: "bg-purple-50 text-purple-600" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Weekly Chart */}
      {weeklyData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-gray-900 mb-4">Aktivitas 7 Hari Terakhir</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="pgMenit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: "12px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="menit" stroke="#2563EB" fill="url(#pgMenit)" strokeWidth={2} name="Menit Belajar" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-subject breakdown */}
      {subjectProgress.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-gray-900 mb-4">Detail per Mata Pelajaran</h3>
          <div className="space-y-5">
            {subjectProgress.map((s: any, i: number) => {
              const progress = s.progress || s.average || 0;
              const colors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899"];
              const color = colors[i % colors.length];
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800">{s.name || s.subject}</span>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span style={{ color }} className="font-bold">{Math.round(progress)}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {weeklyData.length === 0 && subjectProgress.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400">Data progres belum tersedia</p>
        </div>
      )}
    </div>
  );
}

// ─── Downloads Page ───────────────────────────────────────────────────────────
interface DownloadsPageProps {
  userId: string | null;
}

function DownloadsPage({ userId }: DownloadsPageProps) {
  const [downloads, setDownloads] = React.useState<any[]>([]);
  const [downloadsLoading, setDownloadsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!userId) {
      setDownloads([]);
      return;
    }
    (async () => {
      setDownloadsLoading(true);
      try {
        const { getUserDownloadedModules } = await import("../../lib/app-data");
        const data = await getUserDownloadedModules(userId);
        setDownloads(data ?? []);
      } catch (err) {
        console.error("Failed to load downloads", err);
        setDownloads([]);
      } finally {
        setDownloadsLoading(false);
      }
    })();
  }, [userId]);

  const typeIcon: Record<string, React.ElementType> = { video: Play, baca: FileText, latihan: Star, audio: Headphones };
  const typeColor: Record<string, string> = {
    video: "bg-blue-100 text-blue-700", baca: "bg-purple-100 text-purple-700",
    latihan: "bg-orange-100 text-orange-700", audio: "bg-green-100 text-green-700",
  };

  const totalSize = downloads.reduce((s: number, d: any) => {
    const sizeMatch = String(d.size || "0").match(/(\d+)/);
    return s + (sizeMatch ? parseInt(sizeMatch[1]) : 0);
  }, 0);

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-900 mb-1">Unduhan Offline</h2>
          <p className="text-gray-500 text-sm">{downloads.length} file • Total {totalSize} MB</p>
        </div>
        {downloads.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
            <WifiOff className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">Siap Offline</span>
          </div>
        )}
      </div>

      {downloadsLoading ? (
        <div className="text-center py-20"><p className="text-gray-400">Memuat...</p></div>
      ) : (
        <>
          {downloads.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Ruang Penyimpanan</span>
                <span className="text-sm text-gray-500">{totalSize} MB / 2 GB terpakai</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(totalSize / 2048) * 100}%` }}></div>
              </div>
              <p className="text-xs text-gray-400">Masih tersedia {(2048 - totalSize).toFixed(0)} MB ruang penyimpanan</p>
            </div>
          )}

          <div className="space-y-3">
            {downloads.map((item: any, i: number) => {
              const Icon = typeIcon[item.type] || Download;
              return (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-all group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor[item.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.subject} • {item.size || "-"}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Download className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {downloads.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <WifiOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada materi yang diunduh.</p>
              <p className="text-sm text-gray-400 mt-1">Unduh materi dari perpustakaan untuk akses offline.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>("student");
  const [userName, setUserName] = useState("");
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [authError, setAuthError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentSummary, setStudentSummary] = useState<any>(null);
  const [recentModules, setRecentModules] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<any[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  const restoreSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session) return;
    const sessionUserId = data.session.user.id;
    setUserId(sessionUserId);
    setIsLoggedIn(true);
    const profile = await getProfile(sessionUserId);
    if (profile) {
      setRole(profile.role ?? "student");
      setUserName(profile.full_name ?? profile.email ?? "");
    }
  };

  useEffect(() => {
    restoreSession();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const signedInUserId = session?.user?.id ?? null;
      setUserId(signedInUserId);
      setIsLoggedIn(Boolean(signedInUserId));
      if (signedInUserId) {
        const profile = await getProfile(signedInUserId);
        if (profile) {
          setRole(profile.role ?? "student");
          setUserName(profile.full_name ?? profile.email ?? "");
        }
      } else {
        setUserName("");
        setRole("student");
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (payload: {
    selectedRole: Role;
    email?: string;
    password?: string;
    name?: string;
    school?: string;
    className?: string;
    gradeLevel?: string;
    bio?: string;
    isRegister?: boolean;
  }): Promise<void> => {
    const { selectedRole, name, email, password, school, className, gradeLevel, bio, isRegister } = payload;
    setAuthError(null);
    try {
      if (isRegister) {
        if (!email || !password || !name) throw new Error("Nama, email, dan password diperlukan untuk pendaftaran.");
        const signUpResult = await signUpWithRole({
          fullName: name,
          email,
          password,
          role: selectedRole === "donor" ? "student" : selectedRole,
          school: school || "SMPN 5 Bandung",
          class_name: className || (selectedRole === "teacher" ? "Guru" : "9A"),
          grade_level: gradeLevel || (selectedRole === "teacher" ? "Guru" : "9"),
          bio: bio || (selectedRole === "teacher" ? "Guru berpengalaman." : "Siswa yang rajin belajar."),
        });

        const sessionUserId = signUpResult?.user?.id ?? signUpResult?.session?.user?.id ?? null;
        if (sessionUserId) {
          const profile = await getProfile(sessionUserId);
          if (profile) {
            setRole(profile.role ?? selectedRole);
            setUserName(profile.full_name ?? email ?? "");
          } else {
            setRole(selectedRole);
            setUserName(name ?? email ?? "");
          }
          setUserId(sessionUserId);
          setIsLoggedIn(true);
          setCurrentPage("dashboard");
          return;
        }

        return;
      }

      if (!email || !password) throw new Error("Email dan password harus diisi.");
      const res = await signIn(email, password);
      const sessionUserId = res?.user?.id ?? res?.session?.user?.id ?? null;
      if (sessionUserId) {
        const profile = await getProfile(sessionUserId);
        if (profile) {
          setRole(profile.role ?? selectedRole);
          setUserName(profile.full_name ?? email ?? "");
        } else {
          setRole(selectedRole);
          setUserName(name ?? email ?? "");
        }
      }
      setUserId(sessionUserId ?? null);
      setIsLoggedIn(true);
      setCurrentPage("dashboard");
    } catch (err: any) {
      setAuthError(err?.message ?? String(err));
      throw err;
    }
  };

  useEffect(() => {
    (async () => {
      if (!userId) return;
      try {
        const [notificationsData, summary, modules, leaderboard, weekly, subjects] = await Promise.all([
          getUserNotifications(userId).catch(() => []),
          role === "student" ? getUserSummary(userId).catch(() => null) : Promise.resolve(null),
          role === "student" ? getUserRecentModules(userId).catch(() => []) : Promise.resolve([]),
          getLeaderboard(userId).catch(() => []),
          role === "student" ? getProgressSnapshots(userId).catch(() => []) : Promise.resolve([]),
          role === "student" ? getUserSubjectProgress(userId).catch(() => []) : Promise.resolve([]),
        ]);
        setNotifications(notificationsData ?? []);
        setStudentSummary(summary);
        setRecentModules(modules ?? []);
        setWeeklyData(weekly ?? []);
        setSubjectProgress(subjects ?? []);
        setLeaderboardData(leaderboard ?? []);
      } catch (err) {
        console.error('Failed to fetch user data', err);
        // Fallback to empty data to prevent blank screens
        setNotifications([]);
        setStudentSummary(null);
        setRecentModules([]);
        setLeaderboardData([]);
      }
    })();
  }, [userId, role]);

  const handleMarkAllNotificationsRead = async () => {
    if (!userId) return;
    try {
      await markAllNotificationsRead(userId, role);
      const updated = await getUserNotifications(userId, role);
      setNotifications(updated ?? []);
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  const handleForgotPassword = async (email?: string) => {
    if (!email) return;
    try {
      await requestPasswordReset(email);
      window.alert(`Email reset password telah dikirim ke ${email}. Periksa kotak masuk Anda.`);
    } catch (err: any) {
      window.alert(`Gagal mengirim email reset: ${err?.message ?? String(err)}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserId(null);
    setCurrentPage("dashboard");
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} onForgotPassword={handleForgotPassword} authError={authError ?? undefined} supabaseConfigured={isSupabaseConfigured} />;
  }

  const renderPage = () => {
    if (currentPage === "dashboard") {
      if (role === "teacher") 
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <TeacherDashboard userName={userName} onNavigate={(p) => setCurrentPage(p as Page)} />
            </Suspense>
          </ErrorBoundary>
        );
      if (role === "donor") return <DonorDashboard userName={userName} />;
      return (
        <ErrorBoundary>
          <StudentDashboard
            userName={userName}
            onNavigate={(p) => setCurrentPage(p as Page)}
            summary={studentSummary}
            recentModules={recentModules}
            notifications={notifications}
          />
        </ErrorBoundary>
      );
    }
    if (currentPage === "modules") 
      return (
        <ErrorBoundary>
          <ModuleLibrary role={role} userId={userId} />
        </ErrorBoundary>
      );
    if (currentPage === "quiz") 
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            {role === "teacher" ? <AIQuizMaker /> : <QuizPage />}
          </Suspense>
        </ErrorBoundary>
      );
    if (currentPage === "analytics") {
      if (role === "teacher")
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <TeacherAnalyticsPage
                userName={userName}
                onNavigate={(p) => setCurrentPage(p as Page)}
                onShowStudent={(id: string) => {
                  setSelectedStudentId(id);
                  setCurrentPage("student");
                }}
              />
            </Suspense>
          </ErrorBoundary>
        );
      if (role === "donor") return <DonorDashboard userName={userName} />;
      return (
        <ErrorBoundary>
          <StudentDashboard userName={userName} onNavigate={(p) => setCurrentPage(p as Page)} />
        </ErrorBoundary>
      );
    }
    if (currentPage === "student") 
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <StudentDetailPage userId={selectedStudentId} currentUserId={userId} onNavigate={(p: Page) => setCurrentPage(p)} />
          </Suspense>
        </ErrorBoundary>
      );
    if (currentPage === "leaderboard") 
      return (
        <ErrorBoundary>
          <Leaderboard currentUserId={userId} data={leaderboardData} />
        </ErrorBoundary>
      );
    if (currentPage === "bookmarks") 
      return (
        <ErrorBoundary>
          <BookmarksPage userId={userId} />
        </ErrorBoundary>
      );
    if (currentPage === "forum") 
      return (
        <ErrorBoundary>
          <Forum userId={userId} role={role} userName={userName} />
        </ErrorBoundary>
      );
    if (currentPage === "notifications") 
      return (
        <ErrorBoundary>
          <NotificationsPage role={role} notifications={notifications} onMarkAllRead={handleMarkAllNotificationsRead} />
        </ErrorBoundary>
      );
    if (currentPage === "profile") 
      return (
        <ErrorBoundary>
          <ProfilePage userName={userName} role={role} userId={userId} />
        </ErrorBoundary>
      );
    if (currentPage === "progress") 
      return (
        <ErrorBoundary>
          <ProgressPage userId={userId} weeklyData={weeklyData} subjectProgress={subjectProgress} />
        </ErrorBoundary>
      );
    if (currentPage === "downloads") 
      return (
        <ErrorBoundary>
          <DownloadsPage userId={userId} />
        </ErrorBoundary>
      );
    return null;
  };

  return (
    <Layout
      role={role}
      userName={userName}
      currentPage={currentPage}
      onNavigate={(page) => setCurrentPage(page as Page)}
      onLogout={handleLogout}
      notifCount={notifications.filter((n) => !n.read).length}
    >
      {renderPage()}
    </Layout>
  );
}
