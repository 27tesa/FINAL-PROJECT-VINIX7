import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from "recharts";
import { Users, TrendingUp, AlertTriangle, ChevronRight, BookOpen, Target } from "lucide-react";
import { getStudentSummaries, getAverageScoreOverall, getAverageScorePerSubject, getWeeklyActiveCounts } from "../../lib/app-data";

interface TeacherAnalyticsPageProps {
  userName: string;
  onNavigate: (page: any) => void;
}

interface TeacherAnalyticsPagePropsExtended extends TeacherAnalyticsPageProps {
  onShowStudent?: (id: string) => void;
}

export function TeacherAnalyticsPage({ userName, onNavigate, onShowStudent }: TeacherAnalyticsPagePropsExtended) {
  const [students, setStudents] = useState<any[]>([]);
  const [avgScore, setAvgScore] = useState<number>(0);
  const [weeklyActive, setWeeklyActive] = useState<{ day: string; aktif: number; total: number }[]>([]);
  const [subjectAverages, setSubjectAverages] = useState<{ name: string; average: number }[]>([]);
  const [needAttention, setNeedAttention] = useState<number>(0);
  const [activeToday, setActiveToday] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const [summaries, avg, subjects, weekly] = await Promise.all([
          getStudentSummaries(),
          getAverageScoreOverall(),
          getAverageScorePerSubject(),
          getWeeklyActiveCounts(),
        ]);

        setStudents(summaries);
        setAvgScore(avg ?? 0);
        setSubjectAverages(subjects ?? []);
        setWeeklyActive(weekly ?? []);
        setActiveToday(weekly?.length ? weekly[weekly.length - 1].aktif : 0);
        setNeedAttention((summaries ?? []).filter((s: any) => s.score > 0 && s.score < 65).length);
      } catch (err) {
        console.error("Failed to load teacher analytics", err);
      }
    })();
  }, []);

  const firstName = userName.split(" ")[0];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Analitik Kelas</h2>
          <p className="text-gray-500 text-sm">Laporan performa siswa dan tren belajar mingguan untuk {firstName}.</p>
        </div>
        <button
          onClick={() => onNavigate("quiz")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all"
        >
          <BookOpen className="w-4 h-4" /> Buat Kuis Baru
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Siswa", value: students.length.toString(), icon: Users, color: "bg-blue-50 text-blue-700", note: "Akses materi" },
          { label: "Aktif Hari Ini", value: activeToday.toString(), icon: TrendingUp, color: "bg-green-50 text-green-700", note: students.length ? `${Math.round((activeToday / students.length) * 100)}% hadir` : "-" },
          { label: "Rata-rata Skor", value: avgScore.toFixed(1), icon: Target, color: "bg-purple-50 text-purple-700", note: "Semua kuis" },
          { label: "Perlu Perhatian", value: needAttention.toString(), icon: AlertTriangle, color: "bg-red-50 text-red-700", note: "Skor < 65" },
        ].map((tile) => {
          const Icon = tile.icon;
          return (
            <div key={tile.label} className={`rounded-3xl p-5 border border-gray-100 bg-white shadow-sm`}> 
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${tile.color} mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-500 mb-1">{tile.label}</p>
              <p className="text-3xl font-semibold text-gray-900">{tile.value}</p>
              <p className="text-xs text-gray-400 mt-2">{tile.note}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900">Rata-rata Skor per Mata Pelajaran</h3>
              <p className="text-xs text-gray-400">Performa kinerja siswa dibanding target</p>
            </div>
            <span className="text-xs text-gray-500">Terbaru</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={subjectAverages} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", fontSize: "12px" }} />
              <Bar dataKey="average" fill="#4338CA" radius={[8, 8, 0, 0]} name="Rata-rata" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-5">
          <div className="mb-4">
            <h3 className="text-gray-900">Keaktifan Mingguan</h3>
            <p className="text-xs text-gray-400">Siswa yang mengakses platform per hari</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyActive} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "12px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="aktif" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: "#2563EB" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900">Detail Siswa</h3>
            <p className="text-xs text-gray-400">Nilai rata-rata, tren, dan aktivitas terakhir</p>
          </div>
          <button onClick={() => onNavigate("dashboard")} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            Kembali ke Dashboard <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                <th className="p-3">Nama</th>
                <th className="p-3">Kelas</th>
                <th className="p-3">Skor Rata-rata</th>
                <th className="p-3">Status</th>
                <th className="p-3">Terakhir Aktif</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => {
                const score = student.score ?? 0;
                const status = score >= 80 ? "Unggul" : score >= 65 ? "Stabil" : "Perlu bantuan";
                const badgeColor = score >= 80 ? "bg-blue-100 text-blue-700" : score >= 65 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
                return (
                  <tr key={index} onClick={() => onShowStudent?.(student.user_id)} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="p-3 font-medium text-gray-900">{student.name}</td>
                    <td className="p-3">{student.grade}</td>
                    <td className="p-3">{score.toFixed(1)}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-3">{student.lastActive}</td>
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
