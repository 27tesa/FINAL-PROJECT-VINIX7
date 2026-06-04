import { useEffect, useState } from "react";
import { Users, TrendingUp, BookOpen, AlertTriangle, ChevronRight, Star, Target, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend,
} from "recharts";
import { getStudents, getAverageScoreOverall, getAverageScorePerSubject, getWeeklyActiveCounts, getStudentSummaries } from "../../lib/app-data";

interface TeacherDashboardProps {
  userName: string;
  onNavigate: (page: any) => void;
}

const defaultClassProgress: { name: string; rata: number; target: number; siswa: number }[] = [];
const defaultWeeklyActive: { day: string; aktif: number; total: number }[] = [];
const defaultRadarData: { skill: string; nilai: number }[] = [];
const defaultStudents: any[] = [];

const statusBadge: Record<string, { label: string; cls: string }> = {
  excellent: { label: "Unggul", cls: "bg-blue-100 text-blue-700" },
  good: { label: "Baik", cls: "bg-green-100 text-green-700" },
  needs_help: { label: "Perlu Bantuan", cls: "bg-yellow-100 text-yellow-700" },
  critical: { label: "Kritis", cls: "bg-red-100 text-red-700" },
};

export function TeacherDashboard({ userName, onNavigate }: TeacherDashboardProps) {
  const firstName = userName.split(" ")[0];
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [avgScore, setAvgScore] = useState<number>(0);
  const [needAttention, setNeedAttention] = useState<number>(0);
  const [activeToday, setActiveToday] = useState<number>(0);
  const [classProgress, setClassProgress] = useState(defaultClassProgress);
  const [weeklyActive, setWeeklyActive] = useState(defaultWeeklyActive);
  const [radarData, setRadarData] = useState(defaultRadarData);
  const [students, setStudents] = useState<any[]>(defaultStudents);

  useEffect(() => {
    (async () => {
      try {
        const studs = await getStudents();
        setTotalStudents(studs.length);
        const summaries = await getStudentSummaries();
        setStudents(summaries);

        const avg = await getAverageScoreOverall();
        setAvgScore(avg ?? 0);

        const perSub = await getAverageScorePerSubject();
        setClassProgress(perSub.map((p: any) => ({ name: p.name, rata: p.average, target: 80, siswa: studs.length })));

        const weekly = await getWeeklyActiveCounts();
        const todayCount = weekly.length ? weekly[weekly.length - 1].aktif : 0;
        setWeeklyActive(weekly);
        setActiveToday(todayCount);

        setRadarData(perSub.slice(0, 5).map((p: any) => ({ skill: p.name, nilai: Math.round(p.average) })));

        setNeedAttention(summaries.filter((s: any) => s.score > 0 && s.score < 65).length);
      } catch (err) {
        console.error("Failed loading teacher metrics", err);
        // Set fallback data so page doesn't go blank
        setTotalStudents(0);
        setAvgScore(0);
        setNeedAttention(0);
        setActiveToday(0);
        setClassProgress([]);
        setWeeklyActive([]);
        setRadarData([]);
        setStudents([]);
      }
    })();
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Selamat datang, {firstName}!</h2>
          <p className="text-gray-500 text-sm">Pantau progres belajar siswa Anda hari ini</p>
        </div>
        <button
          onClick={() => onNavigate("quiz")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
          style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }}
        >
          <Star className="w-4 h-4" />
          Buat Kuis AI
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Siswa", value: totalStudents.toString(), sub: `${totalStudents > 0 ? `${totalStudents} siswa` : "-"}` , icon: Users, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
          { label: "Aktif Hari Ini", value: activeToday.toString(), sub: `${totalStudents ? Math.round((activeToday / totalStudents) * 100) : 0}% kehadiran`, icon: TrendingUp, color: "bg-green-50 text-green-600", border: "border-green-100" },
          { label: "Rata-rata Skor", value: avgScore.toString(), sub: "Dari target 80", icon: Target, color: "bg-purple-50 text-purple-600", border: "border-purple-100" },
          { label: "Perlu Perhatian", value: needAttention.toString(), sub: "Siswa tertinggal", icon: AlertTriangle, color: "bg-red-50 text-red-600", border: "border-red-100" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`bg-white border ${s.border} rounded-2xl p-4`}>
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart - Progress per Mapel */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="text-gray-900 mb-1">Rata-rata Nilai per Mata Pelajaran</h3>
          <p className="text-xs text-gray-400 mb-4">Dibandingkan dengan target kelas</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={classProgress} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: "12px", fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="rata" name="Rata-rata Kelas" fill="#3B82F6" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="target" name="Target" fill="#E2E8F0" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="text-gray-900 mb-1">Profil Kompetensi Kelas</h3>
          <p className="text-xs text-gray-400 mb-2">Rata-rata seluruh siswa</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "#64748B" }} />
              <Radar name="Kelas 9" dataKey="nilai" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500 rounded"></div>
            <span className="text-xs text-gray-500">Kelas 9 (Gabungan)</span>
          </div>
        </div>
      </div>

      {/* Keaktifan Mingguan */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900">Keaktifan Belajar Mingguan</h3>
            <p className="text-xs text-gray-400">Jumlah siswa aktif mengakses platform</p>
          </div>
          <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-green-700">+12% vs minggu lalu</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={weeklyActive}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 30]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: "12px", fontSize: "12px" }}
              formatter={(v: number) => [`${v} siswa`, "Aktif"]}
            />
            <Line type="monotone" dataKey="aktif" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: "#2563EB" }} activeDot={{ r: 6 }} name="Aktif" isAnimationActive={false} />
            <Line type="monotone" dataKey="total" stroke="#E2E8F0" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Total" isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-gray-900">Daftar Siswa & Progres</h3>
          <button onClick={() => onNavigate("analytics")} className="text-sm text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
            Lihat semua <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-50">
                <th className="text-left px-5 py-3 font-medium">Siswa</th>
                <th className="text-left px-5 py-3 font-medium">Kelas</th>
                <th className="text-left px-5 py-3 font-medium">Skor Rata-rata</th>
                <th className="text-left px-5 py-3 font-medium">Tren</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Terakhir Aktif</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const badge = statusBadge[s.status];
                const isPositive = s.trend.startsWith("+");
                const initials = s.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{s.grade}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${s.score}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{s.score}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}>
                        {s.trend}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {s.lastActive}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
