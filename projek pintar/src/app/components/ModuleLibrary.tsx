import React, { useEffect, useMemo, useState } from "react";
import { getPublicModules, getUserModuleStates, upsertUserModuleState, getSubjects } from "../../lib/app-data";
import { Search, Filter, Download, BookmarkPlus, PlayCircle, FileText, Headphones, CheckCircle2, Clock, Star, Wifi, WifiOff, ChevronDown, X } from "lucide-react";

type ModuleType = "video" | "baca" | "audio" | "latihan";
type Subject = "semua" | "matematika" | "ipa" | "ips" | "bindo" | "bahasa_inggris" | "pkn";
type Grade = "semua" | "7" | "8" | "9" | "10" | "11" | "12";

interface Module {
  id: number;
  title: string;
  subject: string;
  grade: string;
  type: ModuleType;
  duration: string;
  size: string;
  rating: number;
  downloads: number;
  downloaded: boolean;
  bookmarked: boolean;
  completed: boolean;
  tags: string[];
}

type PublicModule = {
  id: number;
  title: string;
  subject: string;
  grade: string;
  type: ModuleType;
  duration: string;
  size: string;
  rating: number;
  downloads: number;
  tags: string[];
};

const toModuleType = (t: string): ModuleType => {
  const s = String(t ?? "").toLowerCase();
  if (s.includes("baca") || s.includes("read")) return "baca";
  if (s.includes("audio")) return "audio";
  if (s.includes("latihan") || s.includes("quiz")) return "latihan";
  return "video";
};

const typeIcon: Record<ModuleType, React.ElementType> = {
  video: PlayCircle,
  baca: FileText,
  audio: Headphones,
  latihan: Star,
};

const typeColor: Record<ModuleType, string> = {
  video: "bg-blue-100 text-blue-700",
  baca: "bg-purple-100 text-purple-700",
  audio: "bg-green-100 text-green-700",
  latihan: "bg-orange-100 text-orange-700",
};

const subjectEmoji: Record<string, string> = {
  "Matematika": "📐", "IPA": "🔬", "IPS": "🌍", "Bhs. Indonesia": "📝", "Bhs. Inggris": "🗣️", "PKN": "🏛️",
};

interface ModuleLibraryProps {
  role: "student" | "teacher" | "donor";
  userId?: string | null;
}

export function ModuleLibrary({ role, userId }: ModuleLibraryProps) {
  const [search, setSearch] = useState("");
  const [subjectsList, setSubjectsList] = useState<{ slug: string; name: string }[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("semua");
  const [selectedGrade, setSelectedGrade] = useState<Grade>("semua");
  const [selectedType, setSelectedType] = useState<ModuleType | "semua">("semua");
  const [offlineOnly, setOfflineOnly] = useState(false);
  const [moduleList, setModuleList] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeModule, setActiveModule] = useState<Module | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [publicMods, subjects, userStates] = await Promise.all([
          getPublicModules(),
          getSubjects(),
          role === "student" && userId ? getUserModuleStates(String(userId)) : Promise.resolve([]),
        ]);

        setSubjectsList(Array.isArray(subjects) ? subjects.map((s: any) => ({ slug: String(s.slug), name: s.name })) : []);

        const stateByModuleId = new Map<number, any>();
        (userStates ?? []).forEach((s: any) => {
          const mid = s.module_id ?? s.id;
          if (typeof mid === "number") stateByModuleId.set(mid, s);
        });

        const mapped: Module[] = (publicMods ?? []).map((m: any) => {
          const mid: number = m.id;
          const st = stateByModuleId.get(mid);
          return {
            id: mid,
            title: m.title ?? "Materi",
            subject: m.subject?.name ?? m.subject ?? "Umum",
            grade: String(m.grade ?? ""),
            type: toModuleType(m.type ?? "video"),
            duration: m.duration ?? "20 mnt",
            size: m.size ?? "0 MB",
            rating: Number(m.rating ?? 0),
            downloads: Number(m.downloads ?? 0),
            downloaded: Boolean(st?.downloaded ?? false),
            bookmarked: Boolean(st?.bookmarked ?? false),
            completed: Boolean(st?.completed ?? false),
            tags: Array.isArray(m.tags) ? m.tags : [],
          };
        });

        setModuleList(mapped);
      } catch (err) {
        console.error("Failed to load modules", err);
        setModuleList([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [role, userId]);

  const subjectOptions = [{ slug: "semua", name: "Semua" }, ...subjectsList];
  const subjectLabels: Record<string, string> = subjectOptions.reduce((acc, item) => ({ ...acc, [item.slug]: item.name }), {} as Record<string, string>);

  const filtered = moduleList.filter((m) => {
    const query = search.toLowerCase();
    const matchSearch = m.title.toLowerCase().includes(query) ||
      m.subject.toLowerCase().includes(query) ||
      m.tags.some((t) => t.toLowerCase().includes(query));
    const selectedSubjectLabel = subjectLabels[selectedSubject]?.toLowerCase();
    const matchSubject = selectedSubject === "semua" ||
      (selectedSubjectLabel ? m.subject.toLowerCase().includes(selectedSubjectLabel) : true);
    const matchGrade = selectedGrade === "semua" || m.grade === selectedGrade;
    const matchType = selectedType === "semua" || m.type === selectedType;
    const matchOffline = !offlineOnly || m.downloaded;
    return matchSearch && matchSubject && matchGrade && matchType && matchOffline;
  });

  const toggleDownload = async (id: number) => {
    setModuleList((prev) => prev.map((m) => (m.id === id ? { ...m, downloaded: !m.downloaded } : m)));
    if (role === "student" && userId) {
      try {
        await upsertUserModuleState(String(userId), id, { downloaded: true });
      } catch {
        // ignore
      }
    }
  };

  const toggleBookmark = async (id: number) => {
    setModuleList((prev) => prev.map((m) => (m.id === id ? { ...m, bookmarked: !m.bookmarked } : m)));
    if (role === "student" && userId) {
      try {
        await upsertUserModuleState(String(userId), id, { bookmarked: true });
      } catch {
        // ignore (UI already updated optimistically)
      }
    }
  };

  const headerTitle = role === "teacher" ? "Materi Pengajaran" : role === "donor" ? "Materi Edukasi" : "Materi Pelajaran";
  const headerSub = userId ? `${filtered.length} materi tersedia • ${moduleList.filter(m => m.downloaded).length} tersimpan offline` : "Jelajahi materi belajar terbaik untuk kamu.";

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-1">{headerTitle}</h2>
        <p className="text-gray-500 text-sm">{headerSub}</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari materi, topik, atau kata kunci..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          <Filter className="w-4 h-4" />
          Filter
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
        <button
          onClick={() => setOfflineOnly(!offlineOnly)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${offlineOnly ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          {offlineOnly ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
          {offlineOnly ? "Hanya Offline" : "Mode Offline"}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Mata Pelajaran</p>
            <div className="flex flex-wrap gap-2">
              {subjectOptions.map((subject) => (
                <button
                  key={subject.slug}
                  onClick={() => setSelectedSubject(subject.slug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedSubject === subject.slug ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Kelas</p>
            <div className="flex flex-wrap gap-2">
              {["semua", "7", "8", "9", "10", "11", "12"].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g as Grade)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedGrade === g ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {g === "semua" ? "Semua Kelas" : `Kelas ${g}`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Tipe Konten</p>
            <div className="flex flex-wrap gap-2">
              {["semua", "video", "baca", "audio", "latihan"].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t as ModuleType | "semua")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedType === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {t === "semua" ? "Semua Tipe" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Module Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((mod) => {
          const TypeIcon = typeIcon[mod.type];
          return (
            <div
              key={mod.id}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
              onClick={() => setActiveModule(mod)}
            >
              {/* Card Header */}
              <div className={`h-2 w-full ${mod.completed ? "bg-green-400" : mod.downloaded ? "bg-blue-400" : "bg-gray-200"}`}></div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`px-2 py-1 rounded-lg text-xs font-medium ${typeColor[mod.type]} flex items-center gap-1`}>
                    <TypeIcon className="w-3 h-3" />
                    {mod.type}
                  </div>
                  <div className="flex items-center gap-1">
                    {mod.completed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {mod.downloaded && <WifiOff className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>

                <h4 className="text-gray-900 mb-1 leading-snug group-hover:text-blue-700 transition-colors">{mod.title}</h4>
                <p className="text-xs text-gray-500 mb-3">
                  {subjectEmoji[mod.subject] || "📚"} {mod.subject} • Kelas {mod.grade}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {mod.duration}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {mod.rating}</span>
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {mod.downloads.toLocaleString()}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mod.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded-md text-xs text-gray-500">#{tag}</span>
                  ))}
                </div>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleDownload(mod.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${mod.downloaded ? "bg-green-50 text-green-700 border border-green-200" : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {mod.downloaded ? "Tersimpan" : "Unduh"}
                  </button>
                  <button
                    onClick={() => toggleBookmark(mod.id)}
                    className={`p-2 rounded-xl border text-xs transition-all ${mod.bookmarked ? "bg-yellow-50 border-yellow-200 text-yellow-600" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500">Tidak ada materi yang sesuai filter.</p>
          <button onClick={() => { setSearch(""); setSelectedSubject("semua"); setSelectedGrade("semua"); setSelectedType("semua"); setOfflineOnly(false); }} className="mt-3 text-sm text-blue-600 hover:underline">
            Reset filter
          </button>
        </div>
      )}

      {/* Module Detail Modal */}
      {activeModule && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setActiveModule(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${typeColor[activeModule.type]} flex items-center gap-1.5`}>
                {React.createElement(typeIcon[activeModule.type], { className: "w-4 h-4" })}
                {activeModule.type}
              </div>
              <button onClick={() => setActiveModule(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-gray-900 mb-2">{activeModule.title}</h2>
            <p className="text-gray-500 text-sm mb-4">{subjectEmoji[activeModule.subject]} {activeModule.subject} • Kelas {activeModule.grade}</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Durasi", value: activeModule.duration },
                { label: "Ukuran", value: activeModule.size },
                { label: "Rating", value: `⭐ ${activeModule.rating}` },
              ].map((info) => (
                <div key={info.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-sm font-medium text-gray-800">{info.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{info.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                Mulai Belajar
              </button>
              <button
                onClick={() => toggleDownload(activeModule.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-colors ${activeModule.downloaded ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"}`}
              >
                <Download className="w-4 h-4" />
                {activeModule.downloaded ? "Hapus Unduhan" : "Unduh Offline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
