import React, { useEffect, useState } from "react";
import { getStudentDetail, getStudentNotes, saveStudentNote } from "../../lib/app-data";
import { supabase } from "../../lib/supabase";
import { ChevronLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";

interface StudentDetailPageProps {
  userId: string | null; // the student being viewed
  currentUserId?: string | null; // the logged-in user (author of notes)
  onNavigate: (page: any) => void;
}

export function StudentDetailPage({ userId, currentUserId, onNavigate }: StudentDetailPageProps) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<{ date: string; score: number; avg?: number }[]>([]);
  const [subjectBreakdown, setSubjectBreakdown] = useState<{ name: string; average: number; attempts: number }[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [noteText, setNoteText] = useState("");
  const [showMineOnly, setShowMineOnly] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    (async () => {
      try {
        const res: any = await getStudentDetail(userId);
        setProfile(res?.profile ?? null);
        const attemptsData = res?.attempts ?? [];
        setAttempts(attemptsData);

        const rows = attemptsData.map((a: any) => ({
          dateISO: a.created_at,
          date: new Date(a.created_at).toLocaleDateString(),
          score: Number(a.score ?? 0),
          subject: a.quiz_set?.subject?.name ?? "Umum",
        }));
        rows.sort((a: any, b: any) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());
        // compute moving average (window = 3)
        const windowSize = 3;
        const chartRows = rows.map((r: any, i: number) => {
          const start = Math.max(0, i - (windowSize - 1));
          const slice = rows.slice(start, i + 1);
          const avg = Math.round((slice.reduce((s: number, x: any) => s + x.score, 0) / slice.length) * 10) / 10;
          return { date: r.date, score: r.score, avg };
        });
        setTrendData(chartRows);

        // subject breakdown
        const bySub: Record<string, { sum: number; count: number }> = {};
        rows.forEach((r: any) => {
          bySub[r.subject] = bySub[r.subject] || { sum: 0, count: 0 };
          bySub[r.subject].sum += r.score;
          bySub[r.subject].count += 1;
        });
        setSubjectBreakdown(Object.keys(bySub).map((k) => ({ name: k, average: Math.round((bySub[k].sum / bySub[k].count) * 10) / 10, attempts: bySub[k].count })));
        // load notes for this student
        try {
          const n = await getStudentNotes(userId);
          setNotes(n ?? []);
        } catch (err) {
          console.error('Failed to load notes', err);
        }
      } catch (err) {
        console.error("Failed to load student detail", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (!userId) return <div className="p-6">Pilih siswa terlebih dahulu.</div>;

  const averageScore = attempts.length ? Math.round((attempts.reduce((s, a) => s + (a.score ?? 0), 0) / attempts.length) * 10) / 10 : null;

  const exportCSV = () => {
    const header = ["student_name", "student_id", "quiz_set_id", "subject", "score", "total_questions", "created_at"];
    const rows = attempts.map((a: any) => [profile?.full_name ?? "", profile?.user_id ?? "", a.quiz_set_id, a.quiz_set?.subject?.name ?? "Umum", a.score ?? "", a.total_questions ?? "", a.created_at ?? ""]);
    const csv = [header.join(","), ...rows.map((r) => r.map((v) => '"' + String(v ?? "") + '"').join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile?.full_name ?? "student"}-attempts.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportCSVServer = async () => {
    if (!userId) return window.alert('Missing student id');
    try {
      // call Supabase Edge Function via client
      const fnName = 'export_student_csv';
      const res = await supabase.functions.invoke(fnName, { method: 'POST', body: JSON.stringify({ user_id: userId }) });
      if (!res || !res.data) throw new Error('No data from function');
      const csvText = typeof res.data === 'string' ? res.data : new TextDecoder().decode(res.data as any);
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile?.full_name ?? 'student'}-attempts-server.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Server CSV export failed', err);
      window.alert('Gagal mengekspor CSV dari server: ' + (err?.message ?? String(err)));
    }
  };

  const saveNote = async () => {
    if (!noteText.trim()) return;
    try {
      const author = currentUserId ?? '';
      const res = await saveStudentNote(userId as string, author, noteText.trim());
      setNotes((s) => [res, ...s]);
      setNoteText("");
    } catch (err) {
      console.error('Failed to save note', err);
      window.alert('Gagal menyimpan catatan');
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-4">
        <button onClick={() => onNavigate("analytics")} className="text-sm text-gray-600 hover:underline flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Kembali
        </button>
        <div>
          <h2 className="text-gray-900">Detail Siswa</h2>
          <p className="text-xs text-gray-500">Profil & aktivitas terakhir</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500">Nama</p>
              <p className="text-lg font-medium text-gray-900">{profile?.full_name ?? "-"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Rata-rata Skor</p>
              <p className="text-lg font-medium text-gray-900">{averageScore ?? "-"}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">Kelas: {profile?.class_name ?? '-'}</div>
            <div className="flex items-center gap-2">
              <button onClick={exportCSV} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm">Ekspor CSV</button>
              <button onClick={exportCSVServer} className="px-3 py-2 bg-gray-100 text-sm rounded-xl">Ekspor CSV (Server)</button>
            </div>
          </div>

          {trendData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-800 mb-2">Tren Skor</h4>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="avg" stroke="#10B981" strokeWidth={2} dot={false} strokeDasharray="4 4" name="Rata-rata" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-800">Riwayat Kuis</h4>
            <div className="mt-2 space-y-2">
              {attempts.length === 0 && <p className="text-xs text-gray-400">Belum ada percobaan kuis.</p>}
              {attempts.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-sm font-medium">Kuis #{a.quiz_set_id} • {a.quiz_set?.subject?.name ?? 'Umum'}</p>
                    <p className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{a.score}/{a.total_questions}</p>
                    <p className="text-xs text-gray-500">Skor</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h4 className="text-sm font-medium text-gray-800 mb-3">Rata-rata per Mata Pelajaran</h4>
          <div className="space-y-3">
            {subjectBreakdown.length === 0 && <p className="text-xs text-gray-400">Tidak ada data per mata pelajaran.</p>}
            {subjectBreakdown.map((s) => (
              <div key={s.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">{s.name}</div>
                  <div className="text-sm font-medium text-gray-900">{s.average} <span className="text-xs text-gray-400">({s.attempts} percobaan)</span></div>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, s.average)}%` }} />
                </div>
              </div>
            ))}
          </div>
          {subjectBreakdown.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Grafik Kinerja Per Mata Pelajaran</h4>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectBreakdown} layout="vertical" margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} width={90} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} formatter={(value: any) => [`${value}`, 'Rata-rata']} />
                    <Bar dataKey="average" fill="#2563EB" radius={[6, 6, 6, 6]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Catatan Guru</h4>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-md p-2 text-sm" placeholder="Tulis catatan singkat untuk siswa ini..." />
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMineOnly(false)}
                  className={`px-3 py-2 rounded-md text-sm ${!showMineOnly ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  Semua Catatan
                </button>
                <button
                  onClick={() => setShowMineOnly(true)}
                  className={`px-3 py-2 rounded-md text-sm ${showMineOnly ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  Catatan Saya
                </button>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => setNoteText("")} className="px-3 py-2 bg-gray-100 text-sm rounded-md">Batal</button>
                <button onClick={saveNote} className="px-3 py-2 bg-green-600 text-white text-sm rounded-md">Simpan Catatan</button>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {notes.filter((n) => !showMineOnly || n.author_id === currentUserId).length === 0 && (
                <p className="text-xs text-gray-400">Belum ada catatan yang sesuai.</p>
              )}
              {notes.filter((n) => !showMineOnly || n.author_id === currentUserId).map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm text-gray-800">{n.content}</div>
                      <div className="text-xs text-slate-500 mt-1">{n.author?.full_name ?? 'Guru'}</div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${n.author_id === currentUserId ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                      {n.author_id === currentUserId ? 'Saya' : 'Guru'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDetailPage;
