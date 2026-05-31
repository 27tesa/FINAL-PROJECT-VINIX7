import { useState } from "react";
import { BookOpen, GraduationCap, Eye, EyeOff, Sparkles } from "lucide-react";

type Role = "student" | "teacher" | "donor";

interface LoginPageProps {
  onLogin: (payload: {
    selectedRole: Role;
    email: string;
    password: string;
    name: string;
    school: string;
    className: string;
    gradeLevel: string;
    bio: string;
    isRegister: boolean;
  }) => Promise<void>;
  onForgotPassword?: (email: string) => Promise<void>;
  authError?: string;
  supabaseConfigured?: boolean;
}

export function LoginPage({ onLogin, onForgotPassword, authError, supabaseConfigured }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [className, setClassName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const roles = [
    { id: "student" as Role, label: "Siswa", icon: GraduationCap, desc: "SMP/SMA" },
    { id: "teacher" as Role, label: "Guru", icon: BookOpen, desc: "Tutor/Pengajar" },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabaseConfigured) {
      setMessage("Supabase belum dikonfigurasi. Periksa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.");
      return;
    }
    if (forgotMode) {
      return handleForgotSubmit();
    }
    if (!email || !password) return;

    setSubmitting(true);
    setMessage(null);
    setForgotError(null);
    try {
      await onLogin({ selectedRole, email, password, name, school, className, gradeLevel, bio, isRegister });
      if (isRegister) {
        setMessage("Pendaftaran berhasil. Silakan masuk terlebih dahulu.");
        setIsRegister(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async () => {
    if (!email) {
      setForgotError("Masukkan email untuk mereset password.");
      return;
    }
    if (!onForgotPassword) return;

    setSubmitting(true);
    setForgotError(null);
    setMessage(null);
    try {
      await onForgotPassword(email);
      setMessage(`Link reset password telah dikirim ke ${email}.`);
      setForgotMode(false);
    } catch (err: any) {
      setForgotError(err?.message ?? String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 40%, #2563EB 100%)" }}>
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Pintar</span>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            SDG 4 — Quality Education
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Belajar Lebih<br />
            <span className="text-yellow-300">Pintar,</span><br />
            Lebih Mudah.
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-md">
            Platform pendidikan digital inklusif untuk siswa SMP/SMA di seluruh Indonesia.
            Materi terstandar, kuis adaptif, dan pantau progres belajarmu.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { num: "10K+", label: "Siswa Aktif" },
            { num: "500+", label: "Modul Materi" },
            { num: "98%", label: "Tingkat Kepuasan" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-2xl font-bold text-yellow-300">{stat.num}</div>
              <div className="text-blue-100 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <span className="text-xl font-bold text-blue-900">Pintar</span>
          </div>

          <h2 className="text-gray-900 mb-2">{isRegister ? "Buat Akun Baru" : "Selamat Datang Kembali"}</h2>
          <p className="text-gray-500 text-sm mb-6">
            {isRegister ? "Daftar dan mulai perjalanan belajarmu" : "Masuk ke akun Pintarmu"}
          </p>

          {!supabaseConfigured && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Supabase belum dikonfigurasi. Salin nilai dari `.env.example` ke `.env` atau `.env.local`, lalu restart dev server agar VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY tersedia.
            </div>
          )}

          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs transition-all ${selectedRole === role.id ? "bg-white shadow-md text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{role.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {forgotMode ? (
              <div>
                <label className="text-sm text-gray-700 block mb-1.5">Email untuk reset password</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            ) : isRegister ? (
              <>
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5">Sekolah</label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Nama sekolah"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5">Kelas / Jabatan</label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder={selectedRole === "teacher" ? "Contoh: Guru Matematika" : "Contoh: Kelas 9A"}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5">Tingkat / Level</label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    placeholder={selectedRole === "teacher" ? "Contoh: Guru" : "Contoh: 9"}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1.5">Bio Singkat</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ceritakan sedikit tentang dirimu"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                  />
                </div>
              </>
            ) : null}

            <div>
              <label className="text-sm text-gray-700 block mb-1.5">Email / Username</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === "student" ? "siswa@sekolah.sch.id" : "guru@sekolah.sch.id"}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!forgotMode && !isRegister && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700"
                  onClick={() => {
                    setForgotMode(true);
                    setMessage(null);
                    setForgotError(null);
                  }}
                >
                  Lupa password?
                </button>
              </div>
            )}
            {forgotMode && (
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setForgotMode(false);
                    setForgotError(null);
                    setMessage(null);
                  }}
                >
                  Kembali ke login
                </button>
                <span className="text-sm text-gray-400">Masukkan email untuk reset</span>
              </div>
            )}

            {message && <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">{message}</p>}
            {forgotError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{forgotError}</p>}
            {authError && !forgotMode && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{authError}</p>}

            <button
              type="submit"
              disabled={submitting || !supabaseConfigured}
              className="w-full py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #1E40AF, #2563EB)" }}
            >
              {submitting ? "Memproses..." : !supabaseConfigured ? "Supabase belum siap" : isRegister ? "Daftar Sekarang" : "Masuk"}
            </button>
            {!supabaseConfigured && (
              <p className="text-xs text-red-600 mt-2">Supabase belum dikonfigurasi. Periksa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.</p>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <button onClick={() => setIsRegister(!isRegister)} className="text-blue-600 font-medium hover:text-blue-700">
              {isRegister ? "Masuk" : "Daftar Gratis"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
