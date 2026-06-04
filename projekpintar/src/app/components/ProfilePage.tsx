import React, { useEffect, useState } from "react";
import {
  User, Mail, Phone, MapPin, School, Lock, Bell, Palette, Database,
  Shield, ChevronRight, Camera, Check, Eye, EyeOff, Smartphone,
  Globe, HelpCircle, FileText, AlertTriangle, Wifi, WifiOff, Sun, Moon,
  Flame, Trophy, Star, BookOpen, CheckCircle2, Edit3, Save, X
} from "lucide-react";
import { getProfile, updateProfile } from "../../lib/app-data";
import { supabase } from "../../lib/supabase";

type Tab = "profil" | "akun" | "notifikasi" | "tampilan" | "privasi";
type Role = "student" | "teacher" | "donor";

interface ProfilePageProps {
  userName: string;
  role: Role;
  userId?: string | null;
}

export function ProfilePage({ userName, role, userId }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profil");
  const [editMode, setEditMode] = useState(false);

  // Profile state
  const [displayName, setDisplayName] = useState(userName);
  const [email, setEmail] = useState(role === "teacher" ? "sari.dewi@sekolah.sch.id" : "raka.adwya@siswa.sch.id");
  const [phone, setPhone] = useState("081234567890");
  const [school, setSchool] = useState(role === "teacher" ? "SMPN 5 Bandung" : "SMPN 5 Bandung");
  const [gradeClass, setGradeClass] = useState(role === "student" ? "Kelas 9A" : "Guru Matematika");
  const [bio, setBio] = useState(role === "teacher" ? "Guru Matematika berpengalaman 8 tahun." : "Suka belajar dan tantangan baru!");
  const [location, setLocation] = useState("Bandung, Jawa Barat");
  const [savedProfile, setSavedProfile] = useState(false);

  // Password state
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    kuis: true, materi: true, forum: true, streak: true, leaderboard: false, email_digest: false,
  });

  // Appearance
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [fontSize, setFontSize] = useState<"kecil" | "normal" | "besar">("normal");
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [colorScheme, setColorScheme] = useState<"blue" | "purple" | "green" | "orange">("blue");

  // Privacy & Data
  const [dataSaver, setDataSaver] = useState(false);
  const [autoDownload, setAutoDownload] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);

  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = role === "student" ? "Siswa" : role === "teacher" ? "Guru" : "Donatur";
  const roleColor = role === "student" ? "from-blue-500 to-indigo-600" : role === "teacher" ? "from-purple-500 to-indigo-600" : "from-green-500 to-teal-600";

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profil", label: "Profil", icon: User },
    { id: "akun", label: "Akun", icon: Lock },
    { id: "notifikasi", label: "Notifikasi", icon: Bell },
    { id: "tampilan", label: "Tampilan", icon: Palette },
    { id: "privasi", label: "Data & Privasi", icon: Shield },
  ];

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const profile = await getProfile(userId);
        if (profile) {
          setDisplayName(profile.full_name ?? userName);
          setEmail(profile.email ?? "");
          setSchool(profile.school ?? school);
          setGradeClass(profile.class_name ?? gradeClass);
          setBio(profile.bio ?? bio);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    })();
  }, [userId]);

  const handleSaveProfile = async () => {
    if (!userId) return;
    try {
      await updateProfile(userId, {
        full_name: displayName,
        email,
        school,
        class_name: gradeClass,
        grade_level: role === "teacher" ? "Guru" : gradeClass.replace(/Kelas\s*/i, ""),
        bio,
        avatar_url: null,
        role,
        user_id: userId,
      });
      setSavedProfile(true);
      setEditMode(false);
      setTimeout(() => setSavedProfile(false), 3000);
    } catch (err) {
      console.error("Failed to save profile", err);
      window.alert("Gagal menyimpan profil. Coba lagi.");
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword || !confirmPassword) {
      window.alert("Isi password baru dan konfirmasi password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      window.alert("Password baru tidak cocok.");
      return;
    }
    try {
      await supabase.auth.updateUser({ password: newPassword });
      setPasswordSaved(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      console.error("Failed to update password", err);
      window.alert("Gagal mengubah password. Coba lagi.");
    }
  };

  const colorOptions = [
    { id: "blue", label: "Biru (Default)", bg: "bg-blue-600" },
    { id: "purple", label: "Ungu", bg: "bg-purple-600" },
    { id: "green", label: "Hijau", bg: "bg-green-600" },
    { id: "orange", label: "Oranye", bg: "bg-orange-500" },
  ];

  const achievements = [
    { icon: "🔥", label: "7 Hari Streak", earned: true },
    { icon: "🧠", label: "50 Kuis Selesai", earned: true },
    { icon: "📚", label: "38 Modul Belajar", earned: true },
    { icon: "💯", label: "Perfect Score", earned: false },
    { icon: "🌅", label: "Early Bird", earned: false },
    { icon: "🏆", label: "Top 3 Leaderboard", earned: true },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-6" style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)" }}>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -right-4 bottom-0 w-24 h-24 bg-white/5 rounded-full" />
        <div className="relative z-10 p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-end gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${roleColor} flex items-center justify-center text-3xl font-bold text-white shadow-xl`}>
              {initials}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-white">{displayName}</h2>
              <span className="text-xs px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full">{roleLabel}</span>
            </div>
            <p className="text-blue-200 text-sm">{email}</p>
            <p className="text-blue-300 text-sm mt-0.5">{school} • {gradeClass}</p>
          </div>
          {/* Stats (student only) */}
          {role === "student" && (
            <div className="flex gap-4 sm:ml-auto">
              {[
                { icon: <Flame className="w-4 h-4 text-orange-300" />, value: "7", label: "Streak" },
                { icon: <Star className="w-4 h-4 text-yellow-300" />, value: "2,840", label: "Poin" },
                { icon: <Trophy className="w-4 h-4 text-yellow-300" />, value: "#3", label: "Rank" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">{s.icon}<span className="text-white font-bold text-sm">{s.value}</span></div>
                  <p className="text-blue-300 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {savedProfile && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Profil berhasil disimpan!</span>
        </div>
      )}
      {passwordSaved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Password berhasil diubah!</span>
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex gap-1 p-1.5 bg-gray-100 rounded-2xl mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab.id ? "bg-white shadow-md text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── TAB: PROFIL ─── */}
      {activeTab === "profil" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Edit Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-gray-900">Informasi Pribadi</h3>
                {!editMode ? (
                  <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-all">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditMode(false)} className="flex items-center gap-1 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all">
                      <X className="w-4 h-4" /> Batal
                    </button>
                    <button onClick={handleSaveProfile} className="flex items-center gap-1 text-sm text-white bg-blue-600 px-3 py-1.5 rounded-xl hover:bg-blue-700 transition-all">
                      <Save className="w-4 h-4" /> Simpan
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Nama Lengkap", value: displayName, setter: setDisplayName, icon: User, type: "text" },
                  { label: "Email", value: email, setter: setEmail, icon: Mail, type: "email" },
                  { label: "Nomor Telepon", value: phone, setter: setPhone, icon: Phone, type: "tel" },
                  { label: "Lokasi", value: location, setter: setLocation, icon: MapPin, type: "text" },
                  { label: "Sekolah / Institusi", value: school, setter: setSchool, icon: School, type: "text" },
                  { label: role === "student" ? "Kelas" : "Jabatan", value: gradeClass, setter: setGradeClass, icon: BookOpen, type: "text" },
                ].map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.label}>
                      <label className="text-xs font-medium text-gray-500 block mb-1.5 uppercase tracking-wider">{field.label}</label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          disabled={!editMode}
                          className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border transition-all ${editMode ? "border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" : "border-gray-100 bg-gray-50 text-gray-700 cursor-default"}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <label className="text-xs font-medium text-gray-500 block mb-1.5 uppercase tracking-wider">Bio / Tentang Saya</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!editMode}
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border resize-none transition-all ${editMode ? "border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" : "border-gray-100 bg-gray-50 text-gray-700 cursor-default"}`}
                />
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border border-red-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-red-700">Zona Berbahaya</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 py-2.5 px-4 rounded-xl border border-red-200 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  Nonaktifkan Akun
                </button>
                <button className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700 transition-colors">
                  Hapus Akun Permanen
                </button>
              </div>
            </div>
          </div>

          {/* Right: Badges & Stats */}
          <div className="space-y-4">
            {/* Achievements */}
            {role === "student" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-gray-900 mb-4">Badge Pencapaian</h3>
                <div className="grid grid-cols-3 gap-3">
                  {achievements.map((ach) => (
                    <div key={ach.label} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all ${ach.earned ? "bg-yellow-50 border border-yellow-100" : "bg-gray-50 border border-gray-100 opacity-40"}`}>
                      <span className="text-2xl">{ach.icon}</span>
                      <p className="text-xs text-gray-600 leading-tight">{ach.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-gray-900 mb-4">Ringkasan Aktivitas</h3>
              <div className="space-y-3">
                {(role === "student" ? [
                  { label: "Total Poin", value: "2,840", icon: Star, color: "text-yellow-500" },
                  { label: "Modul Selesai", value: "34 / 58", icon: CheckCircle2, color: "text-green-500" },
                  { label: "Kuis Dikerjakan", value: "50", icon: BookOpen, color: "text-blue-500" },
                  { label: "Streak Terpanjang", value: "14 hari", icon: Flame, color: "text-orange-500" },
                ] : [
                  { label: "Siswa Dipantau", value: "30", icon: User, color: "text-blue-500" },
                  { label: "Kuis Dibuat", value: "12", icon: BookOpen, color: "text-purple-500" },
                  { label: "Materi Diunggah", value: "8", icon: CheckCircle2, color: "text-green-500" },
                  { label: "Forum Dijawab", value: "23", icon: Flame, color: "text-orange-500" },
                ]).map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${s.color}`} />
                      <span className="text-sm text-gray-600 flex-1">{s.label}</span>
                      <span className="text-sm font-medium text-gray-900">{s.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Member Card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1E40AF, #2563EB)" }}>
              <div className="p-5 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-blue-200 uppercase tracking-wider">Kartu Member</span>
                  <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-medium">Aktif</span>
                </div>
                <p className="text-lg font-bold mb-0.5">{displayName}</p>
                <p className="text-blue-200 text-sm">{roleLabel} • {school}</p>
                <div className="mt-4 flex items-center gap-1 text-blue-300 text-xs">
                  <Shield className="w-3 h-3" />
                  <span>ID: PTR-{Math.floor(Math.random() * 90000) + 10000}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: AKUN ─── */}
      {activeTab === "akun" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Change Password */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Lock className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-gray-900">Ubah Password</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: "Password Saat Ini", show: showOld, toggle: () => setShowOld(!showOld) },
                { label: "Password Baru", show: showNew, toggle: () => setShowNew(!showNew) },
                { label: "Konfirmasi Password Baru", show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5 uppercase tracking-wider">{f.label}</label>
                  <div className="relative">
                    <input
                      type={f.show ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-4 pr-10 py-2.5 rounded-xl text-sm border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700 space-y-1">
                <p className="font-medium">Syarat password kuat:</p>
                <ul className="space-y-0.5 text-blue-600">
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3" /> Minimal 8 karakter</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3" /> Kombinasi huruf & angka</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3" /> Setidaknya 1 karakter spesial</li>
                </ul>
              </div>
              <button onClick={handleSavePassword} className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                Simpan Password Baru
              </button>
            </div>
          </div>

          {/* Sessions & Security */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-gray-900">Sesi Aktif</h3>
              </div>
              <div className="space-y-3">
                {[
                  { device: "Chrome — Windows 11", location: "Bandung, Indonesia", status: "Sesi Ini", active: true },
                  { device: "Mobile App — Android", location: "Bandung, Indonesia", status: "2 jam lalu", active: false },
                  { device: "Firefox — MacOS", location: "Jakarta, Indonesia", status: "2 hari lalu", active: false },
                ].map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${s.active ? "bg-green-50 border border-green-100" : "bg-gray-50"}`}>
                    <Smartphone className={`w-4 h-4 flex-shrink-0 ${s.active ? "text-green-600" : "text-gray-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{s.device}</p>
                      <p className="text-xs text-gray-500">{s.location} • {s.status}</p>
                    </div>
                    {!s.active && <button className="text-xs text-red-500 hover:text-red-700 transition-colors flex-shrink-0">Keluar</button>}
                    {s.active && <span className="text-xs text-green-600 font-medium flex-shrink-0">✓ Aktif</span>}
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full py-2 rounded-xl border border-red-200 text-sm text-red-600 hover:bg-red-50 transition-colors">
                Keluar dari Semua Perangkat
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-gray-900">Login Sosial</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Google", icon: "🔵", connected: true },
                  { name: "Facebook", icon: "🔷", connected: false },
                ].map((s) => (
                  <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-sm text-gray-700 flex-1">{s.name}</span>
                    <button className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${s.connected ? "text-red-500 hover:bg-red-50" : "text-blue-600 hover:bg-blue-50"}`}>
                      {s.connected ? "Putuskan" : "Hubungkan"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: NOTIFIKASI ─── */}
      {activeTab === "notifikasi" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                <Bell className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="text-gray-900">Preferensi Notifikasi</h3>
            </div>
            <div className="space-y-4">
              {[
                { key: "kuis" as const, label: "Pengingat Kuis", desc: "Notifikasi saat ada kuis baru atau jadwal kuis" },
                { key: "materi" as const, label: "Materi Baru", desc: "Pemberitahuan ketika ada materi baru tersedia" },
                { key: "forum" as const, label: "Forum & Balasan", desc: "Notifikasi saat ada balasan di diskusimu" },
                { key: "streak" as const, label: "Pengingat Streak", desc: "Ingatkan agar streak belajar harian terjaga" },
                { key: "leaderboard" as const, label: "Update Leaderboard", desc: "Notifikasi perubahan posisi di papan peringkat" },
                { key: "email_digest" as const, label: "Email Mingguan", desc: "Ringkasan aktivitas belajar dikirim via email" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifPrefs(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`w-12 h-6 rounded-full transition-all flex-shrink-0 relative ${notifPrefs[item.key] ? "bg-blue-600" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifPrefs[item.key] ? "left-6" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-gray-900 mb-5">Jadwal Pengingat Belajar</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-2 uppercase tracking-wider">Waktu Pengingat Harian</label>
                <input type="time" defaultValue="19:00" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-2 uppercase tracking-wider">Hari Aktif</label>
                <div className="flex gap-1.5">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d, i) => (
                    <button key={d} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${i < 5 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{d}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-2 uppercase tracking-wider">Target Belajar Harian</label>
                <div className="flex gap-2 items-center">
                  <input type="range" min={15} max={120} defaultValue={60} className="flex-1 accent-blue-600" />
                  <span className="text-sm font-medium text-gray-700 w-16 text-right">60 menit</span>
                </div>
              </div>
              <button className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                Simpan Jadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: TAMPILAN ─── */}
      {activeTab === "tampilan" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            {/* Theme */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-yellow-600" />
                </div>
                <h3 className="text-gray-900">Tema Tampilan</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { id: "light" as const, label: "Terang", icon: Sun, preview: "bg-white border-2" },
                  { id: "dark" as const, label: "Gelap", icon: Moon, preview: "bg-gray-900 border-2" },
                  { id: "system" as const, label: "Sistem", icon: Smartphone, preview: "bg-gradient-to-br from-white to-gray-900 border-2" },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${theme === t.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className={`w-12 h-8 rounded-lg ${t.preview} ${theme === t.id ? "border-blue-300" : "border-gray-200"}`}></div>
                      <Icon className={`w-4 h-4 ${theme === t.id ? "text-blue-600" : "text-gray-500"}`} />
                      <span className={`text-xs font-medium ${theme === t.id ? "text-blue-700" : "text-gray-500"}`}>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Color Scheme */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-3 uppercase tracking-wider">Skema Warna</label>
                <div className="flex gap-3">
                  {colorOptions.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColorScheme(c.id as any)}
                      title={c.label}
                      className={`w-10 h-10 rounded-xl ${c.bg} transition-all ${colorScheme === c.id ? "ring-4 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"}`}
                    >
                      {colorScheme === c.id && <Check className="w-4 h-4 text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Font Size */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-gray-900 mb-4">Ukuran Teks</h3>
              <div className="flex gap-2">
                {(["kecil", "normal", "besar"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-medium capitalize transition-all ${fontSize === size ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                    style={{ fontSize: size === "kecil" ? "11px" : size === "besar" ? "16px" : "14px" }}
                  >
                    {size === "kecil" ? "Kecil" : size === "besar" ? "Besar" : "Normal"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">Preview ukuran teks akan diterapkan pada seluruh halaman</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Language */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-gray-900">Bahasa Antarmuka</h3>
              </div>
              <div className="space-y-2">
                {[
                  { id: "id" as const, label: "Bahasa Indonesia", flag: "🇮🇩" },
                  { id: "en" as const, label: "English", flag: "🇺🇸" },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${language === lang.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className={`flex-1 text-sm text-left font-medium ${language === lang.id ? "text-blue-700" : "text-gray-700"}`}>{lang.label}</span>
                    {language === lang.id && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Accessibility */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-gray-900 mb-4">Aksesibilitas</h3>
              <div className="space-y-3">
                {[
                  { label: "Animasi Dikurangi", desc: "Kurangi gerakan animasi UI" },
                  { label: "Kontras Tinggi", desc: "Tingkatkan kontras teks dan elemen" },
                  { label: "Layar Baca", desc: "Kompatibilitas dengan screen reader" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-1">
                    <div>
                      <p className="text-sm text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-gray-200 relative flex-shrink-0">
                      <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: PRIVASI ─── */}
      {activeTab === "privasi" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Wifi className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-gray-900">Penggunaan Data</h3>
              </div>
              <div className="space-y-4">
                {[
                  { key: "dataSaver", label: "Mode Hemat Data", desc: "Kompresi media dan prioritas teks agar hemat kuota", value: dataSaver, toggle: () => setDataSaver(!dataSaver) },
                  { key: "autoDownload", label: "Unduh Otomatis", desc: "Simpan materi offline saat terhubung Wi-Fi", value: autoDownload, toggle: () => setAutoDownload(!autoDownload) },
                  { key: "analytics", label: "Analitik Pembelajaran", desc: "Bantu kami tingkatkan platform dengan data anonim", value: analytics, toggle: () => setAnalytics(!analytics) },
                ].map((item) => (
                  <div key={item.key} className={`flex items-center justify-between gap-4 p-3.5 rounded-xl border transition-all ${item.value ? "border-blue-100 bg-blue-50/50" : "border-gray-100 bg-gray-50"}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={item.toggle}
                      className={`w-12 h-6 rounded-full transition-all flex-shrink-0 relative ${item.value ? "bg-blue-600" : "bg-gray-300"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${item.value ? "left-6" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-gray-900">Visibilitas Profil</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Profil Publik", desc: "Profil terlihat oleh pengguna lain", value: publicProfile, toggle: () => setPublicProfile(!publicProfile) },
                  { label: "Tampilkan di Leaderboard", desc: "Namamu muncul di papan peringkat kelas", value: true, toggle: () => {} },
                  { label: "Aktivitas Belajar", desc: "Teman bisa lihat modul yang kamu selesaikan", value: false, toggle: () => {} },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-2">
                    <div>
                      <p className="text-sm text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={item.toggle}
                      className={`w-12 h-6 rounded-full transition-all flex-shrink-0 relative ${item.value ? "bg-blue-600" : "bg-gray-200"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${item.value ? "left-6" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Storage */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-gray-900 mb-4">Penyimpanan Lokal</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Materi Offline</span>
                  <span className="font-medium text-gray-800">245 MB / 2 GB</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "12%" }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">12% terpakai</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Video Offline", size: "180 MB", count: "8 file" },
                  { label: "Dokumen PDF", size: "42 MB", count: "23 file" },
                  { label: "Cache App", size: "23 MB", count: "" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-700">{item.label}</p>
                      {item.count && <p className="text-xs text-gray-400">{item.count}</p>}
                    </div>
                    <span className="text-xs text-gray-600">{item.size}</span>
                    <button className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">Hapus</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Help */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-gray-900 mb-3">Bantuan & Dukungan</h3>
              <div className="space-y-2">
                {[
                  { icon: HelpCircle, label: "Pusat Bantuan & FAQ", color: "text-blue-600" },
                  { icon: FileText, label: "Kebijakan Privasi", color: "text-gray-600" },
                  { icon: FileText, label: "Syarat & Ketentuan", color: "text-gray-600" },
                  { icon: Mail, label: "Hubungi Dukungan", color: "text-green-600" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                      <Icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                      <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-400">Pintar v1.0.0 • SDG 4 Quality Education</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
