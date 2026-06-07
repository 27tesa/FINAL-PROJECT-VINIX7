import { isSupabaseConfigured, supabase } from "./supabase";

export interface ProfileRecord {
  user_id: string;
  full_name: string;
  email: string;
  role: "student" | "teacher" | "donor";
  school: string;
  class_name: string;
  grade_level: string;
  bio: string;
  avatar_url: string | null;
}

export interface SignUpProfile {
  fullName: string;
  email: string;
  password: string;
  role: "student" | "teacher" | "donor";
  school: string;
  class_name: string;
  grade_level: string;
  bio: string;
}

type ProfileMetadata = {
  full_name?: string;
  role?: string;
  school?: string;
  class_name?: string;
  grade_level?: string;
  bio?: string;
};

export function formatAuthError(error: unknown): string {
  const message = (error as { message?: string })?.message ?? String(error);

  if (/email not confirmed/i.test(message)) {
    return "Email belum dikonfirmasi. Periksa kotak masuk (dan folder spam), klik link konfirmasi, lalu coba masuk lagi.";
  }
  if (/invalid login credentials/i.test(message)) {
    return "Email atau password salah. Jika baru mendaftar, pastikan email sudah dikonfirmasi terlebih dahulu.";
  }
  if (/email rate limit exceeded/i.test(message)) {
    return "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.";
  }
  if (/user already registered/i.test(message)) {
    return "Email sudah terdaftar. Silakan masuk atau gunakan fitur lupa password.";
  }
  if (/password should be at least/i.test(message)) {
    return "Password minimal 6 karakter.";
  }
  if (/unable to validate email/i.test(message)) {
    return "Format email tidak valid.";
  }
  if (/signup is disabled/i.test(message)) {
    return "Pendaftaran akun baru sedang dinonaktifkan.";
  }

  return message;
}

function profileFromMetadata(
  userId: string,
  email: string | undefined,
  metadata: ProfileMetadata | undefined,
): ProfileRecord {
  const role = (metadata?.role ?? "student") as ProfileRecord["role"];
  const dbRole = role === "donor" ? "student" : role;

  return {
    user_id: userId,
    full_name: metadata?.full_name ?? email?.split("@")[0] ?? "Pengguna",
    email: email ?? "",
    role: dbRole,
    school: metadata?.school ?? "",
    class_name: metadata?.class_name ?? "",
    grade_level: metadata?.grade_level ?? "",
    bio: metadata?.bio ?? "",
    avatar_url: null,
  };
}

export async function ensureProfile(
  userId: string,
  email?: string,
  metadata?: ProfileMetadata,
) {
  try {
    const existing = await getProfile(userId);
    if (existing) return existing;

    return await upsertProfile(profileFromMetadata(userId, email, metadata));
  } catch (err) {
    console.warn("ensureProfile failed", err);
    try {
      return await getProfile(userId);
    } catch {
      return null;
    }
  }
}

export async function signUpWithRole(payload: SignUpProfile) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase belum dikonfigurasi. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY tersedia.");
  }
  const { fullName, email, password, role, school, class_name, grade_level, bio } = payload;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        school,
        class_name,
        grade_level,
        bio,
      },
    },
  });

  if (error) throw new Error(formatAuthError(error));

  const createdUserId = data.user?.id ?? null;

  if (createdUserId && data.session) {
    try {
      await ensureProfile(createdUserId, data.user?.email ?? email, data.user?.user_metadata);
    } catch (profileErr) {
      console.warn("Profile creation deferred until next sign-in", profileErr);
    }
  }

  if (data.session) {
    return data;
  }

  try {
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (!signInErr && signInData.session?.user) {
      await ensureProfile(
        signInData.session.user.id,
        signInData.session.user.email ?? email,
        signInData.session.user.user_metadata,
      );
      return signInData;
    }
  } catch (err) {
    console.warn("Auto sign-in after registration skipped", err);
  }

  return data;
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase belum dikonfigurasi. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY tersedia.");
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(formatAuthError(error));

  if (!data.session?.user && !data.user) {
    throw new Error("Login gagal. Tidak ada sesi aktif — periksa apakah email sudah dikonfirmasi.");
  }

  const user = data.user ?? data.session?.user;
  if (user) {
    await ensureProfile(user.id, user.email ?? email, user.user_metadata);
  }

  return data;
}

export async function requestPasswordReset(email: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase belum dikonfigurasi. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY tersedia.");
  }
  const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw new Error(formatAuthError(error));
  return data;
}

export async function upsertProfile(profile: ProfileRecord) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<ProfileRecord>) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPublicModules() {
  const { data, error } = await supabase
    .from("learning_modules")
    .select(`id, title, grade_level, module_type, duration_minutes, size_mb, rating, downloads, description, subject:subjects(id, name, slug, color, icon)`)
    .order("featured", { ascending: false })
    .order("rating", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getUserSummary(userId: string) {
  const [attemptsRes, stateRes, progressRes] = await Promise.all([
    supabase.from("quiz_attempts").select("score").eq("user_id", userId),
    supabase.from("user_module_states").select("completed, downloaded, bookmarked").eq("user_id", userId),
    supabase.from("progress_snapshots").select("recorded_at, metric, value, label").eq("user_id", userId),
  ]);

  if (attemptsRes.error) throw attemptsRes.error;
  if (stateRes.error) throw stateRes.error;
  if (progressRes.error) throw progressRes.error;

  const attempts = attemptsRes.data ?? [];
  const states = stateRes.data ?? [];
  const snapshots = progressRes.data ?? [];

  const totalPoints = attempts.reduce((sum: number, row: any) => sum + Number(row.score ?? 0), 0);
  const averageScore = attempts.length ? Math.round((totalPoints / attempts.length) * 10) / 10 : 0;
  const completedModules = states.filter((state: any) => state.completed).length;
  const downloadedModules = states.filter((state: any) => state.downloaded).length;
  const streakDays = new Set((snapshots ?? []).map((snap: any) => new Date(snap.recorded_at).toDateString())).size;
  const minutesLearned = snapshots.reduce((sum: number, row: any) => sum + Number(row.value ?? 0), 0);

  return {
    averageScore,
    completedModules,
    downloadedModules,
    streakDays,
    attempts: attempts.length,
    minutesLearned,
  };
}

export async function getUserRecentModules(userId: string) {
  const { data, error } = await supabase
    .from("user_module_states")
    .select(`*, module:learning_modules(id, title, grade_level, module_type, duration_minutes, size_mb, rating, downloads, subject:subjects(id, name))`)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(8);

  if (error) throw error;
  return (data ?? []).map((item: any) => ({
    id: item.module?.id ?? item.module_id,
    title: item.module?.title ?? "Materi Terbaru",
    subject: item.module?.subject?.name ?? item.module?.subject ?? "Umum",
    grade: String(item.module?.grade_level ?? ""),
    type: String(item.module?.module_type ?? "video") as any,
    duration: item.module?.duration_minutes ? `${item.module.duration_minutes} mnt` : "20 mnt",
    size: item.module?.size_mb ? `${item.module.size_mb} MB` : "0 MB",
    completed: item.completed ?? false,
    downloaded: item.downloaded ?? false,
    bookmarked: item.bookmarked ?? false,
  }));
}

export async function getUserSubjectProgress(userId: string) {
  const { data, error } = await supabase
    .from("user_module_states")
    .select(`module:learning_modules(subject:subjects(name)), completed, progress_pct`)
    .eq("user_id", userId);

  if (error) throw error;

  const bySubject: Record<string, { count: number; completed: number; progressSum: number }> = {};
  (data ?? []).forEach((item: any) => {
    const subject = item.module?.subject?.name ?? "Umum";
    bySubject[subject] = bySubject[subject] || { count: 0, completed: 0, progressSum: 0 };
    bySubject[subject].count += 1;
    bySubject[subject].completed += item.completed ? 1 : 0;
    bySubject[subject].progressSum += Number(item.progress_pct ?? 0);
  });

  return Object.entries(bySubject).map(([subject, stats]) => ({
    subject,
    completed: stats.completed,
    modules: stats.count,
    progress: stats.count ? Math.round(stats.progressSum / stats.count) : 0,
  }));
}

export async function createLearningModule(module: {
  title: string;
  subject_id: number;
  grade: string;
  type: string;
  duration: string;
  size: string;
  rating: number;
  downloads: number;
}) {
  const { data, error } = await supabase
    .from("learning_modules")
    .insert(module)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createQuizSet(payload: {
  title: string;
  description: string;
  subject_id: number;
  difficulty: string;
  total_questions: number;
  created_by: string;
  points?: number;
}) {
  const { data, error } = await supabase
    .from("quiz_sets")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLeaderboard(currentUserId?: string, top = 10) {
  const students = await getStudents();
  const userIds = students.map((s: any) => s.user_id);
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("user_id, score")
    .in("user_id", userIds);

  if (error) throw error;

  const stats: Record<string, { totalScore: number; attempts: number }> = {};
  (data ?? []).forEach((row: any) => {
    if (!stats[row.user_id]) stats[row.user_id] = { totalScore: 0, attempts: 0 };
    stats[row.user_id].totalScore += Number(row.score ?? 0);
    stats[row.user_id].attempts += 1;
  });

  const leaderboard = students
    .map((student: any) => {
      const stat = stats[student.user_id] ?? { totalScore: 0, attempts: 0 };
      const average = stat.attempts ? Math.round((stat.totalScore / stat.attempts) * 10) / 10 : 0;
      return {
        user_id: student.user_id,
        name: student.full_name,
        points: Math.round(average),
        streak: 0,
        badge: "⭐",
        modules: stat.attempts,
        quizzes: stat.attempts,
        trend: 0,
      };
    })
    .sort((a, b) => b.points - a.points)
    .slice(0, top)
    .map((item, index) => ({ ...item, rank: index + 1, isMe: currentUserId ? item.user_id === currentUserId : false }));

  return leaderboard;
}

export async function getPublicForumPosts() {
  const { data, error } = await supabase
    .from("forum_posts")
    .select(`*, subject:subjects(name, slug)`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPublicQuizSets() {
  const { data, error } = await supabase
    .from("quiz_sets")
    .select(`*, subject:subjects(name, slug)`)
    .order("points", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getSubjects() {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getForumReplies(postId: number) {
  const { data, error } = await supabase
    .from("forum_replies")
    .select(`*, profile:profiles(full_name, role)`) 
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createForumPost(userId: string, subjectId: number, title: string, content: string) {
  const { data, error } = await supabase
    .from("forum_posts")
    .insert({ user_id: userId, subject_id: subjectId, title, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createForumReply(userId: string, postId: number, content: string) {
  const { data, error } = await supabase
    .from("forum_replies")
    .insert({ user_id: userId, post_id: postId, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserModuleStates(userId: string) {
  const { data, error } = await supabase
    .from("user_module_states")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data ?? [];
}

export async function getUserBookmarkedModules(userId: string) {
  const { data, error } = await supabase
    .from("user_module_states")
    .select(`bookmarked, downloaded, completed, module:learning_modules(id, title, grade_level, module_type, duration_minutes, size_mb, rating, downloads, subject:subjects(name))`)
    .eq("user_id", userId)
    .eq("bookmarked", true)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((item: any) => ({
    id: item.module?.id,
    title: item.module?.title ?? "Materi",
    subject: item.module?.subject?.name ?? "Umum",
    grade: String(item.module?.grade_level ?? ""),
    type: String(item.module?.module_type ?? "video"),
    duration: item.module?.duration_minutes ? `${item.module.duration_minutes} mnt` : "-",
    size: item.module?.size_mb ? `${item.module.size_mb} MB` : "-",
    rating: Number(item.module?.rating ?? 0),
    downloads: Number(item.module?.downloads ?? 0),
    downloaded: Boolean(item.downloaded ?? false),
    bookmarked: Boolean(item.bookmarked ?? false),
    completed: Boolean(item.completed ?? false),
  }));
}

export async function getUserDownloadedModules(userId: string) {
  const { data, error } = await supabase
    .from("user_module_states")
    .select(`bookmarked, downloaded, completed, module:learning_modules(id, title, grade_level, module_type, duration_minutes, size_mb, rating, downloads, subject:subjects(name))`)
    .eq("user_id", userId)
    .eq("downloaded", true)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((item: any) => ({
    id: item.module?.id,
    title: item.module?.title ?? "Materi",
    subject: item.module?.subject?.name ?? "Umum",
    grade: String(item.module?.grade_level ?? ""),
    type: String(item.module?.module_type ?? "video"),
    duration: item.module?.duration_minutes ? `${item.module.duration_minutes} mnt` : "-",
    size: item.module?.size_mb ? `${item.module.size_mb} MB` : "-",
    downloaded: Boolean(item.downloaded ?? false),
    bookmarked: Boolean(item.bookmarked ?? false),
    completed: Boolean(item.completed ?? false),
  }));
}

export async function upsertUserModuleState(userId: string, moduleId: number, updates: Partial<{
  bookmarked: boolean;
  downloaded: boolean;
  completed: boolean;
  progress_pct: number;
}>) {
  const { data, error } = await supabase
    .from("user_module_states")
    .upsert({
      user_id: userId,
      module_id: moduleId,
      ...updates,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,module_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserNotifications(userId: string, role?: "student" | "teacher" | "donor") {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function markAllNotificationsRead(userId: string, role?: "student" | "teacher" | "donor") {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId);

  if (error) throw error;
  return data ?? [];
}

export async function getProgressSnapshots(userId: string) {
  const { data, error } = await supabase
    .from("progress_snapshots")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createQuizAttempt(userId: string, quizSetId: number, score: number, totalQuestions: number) {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({ user_id: userId, quiz_set_id: quizSetId, score, total_questions: totalQuestions })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getStudents() {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, full_name, class_name, grade_level, email")
    .eq("role", "student")
    .order("full_name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getAverageScoreOverall() {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("score");

  if (error) throw error;
  const arr = data ?? [];
  if (arr.length === 0) return 0;
  const sum = arr.reduce((s: number, r: any) => s + (r.score ?? 0), 0);
  return Math.round((sum / arr.length) * 10) / 10;
}

export async function getAverageScorePerSubject() {
  // fetch attempts with quiz_set -> subject
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("score, quiz_set:quiz_sets(id, subject_id, subject:subjects(name))");

  if (error) throw error;
  const map: Record<string, { sum: number; count: number }> = {};
  (data ?? []).forEach((row: any) => {
    const subject = row.quiz_set?.subject?.name ?? "Umum";
    map[subject] = map[subject] || { sum: 0, count: 0 };
    map[subject].sum += row.score ?? 0;
    map[subject].count += 1;
  });
  return Object.keys(map).map((k) => ({ name: k, average: Math.round((map[k].sum / map[k].count) * 10) / 10 }));
}

export async function getWeeklyActiveCounts() {
  const now = new Date();
  const since = new Date(now);
  since.setDate(now.getDate() - 6);
  const sinceISO = since.toISOString();

  const { data, error } = await supabase
    .from("progress_snapshots")
    .select("user_id, recorded_at")
    .gte("recorded_at", sinceISO);

  if (error) throw error;
  const byDay: Record<string, Set<string>> = {};
  (data ?? []).forEach((row: any) => {
    const d = new Date(row.recorded_at).toLocaleDateString();
    byDay[d] = byDay[d] || new Set();
    byDay[d].add(row.user_id);
  });

  const days: { day: string; aktif: number; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const key = d.toLocaleDateString();
    days.push({ day: d.toLocaleDateString(undefined, { weekday: 'short' }), aktif: byDay[key] ? byDay[key].size : 0, total: 0 });
  }
  return days;
}

export async function getStudentSummaries() {
  const students = await getStudents();
  const userIds = students.map((s: any) => s.user_id);
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("user_id, score, created_at")
    .in("user_id", userIds);

  if (error) throw error;

  const attemptsByUser: Record<string, number[]> = {};
  (data ?? []).forEach((a: any) => {
    attemptsByUser[a.user_id] = attemptsByUser[a.user_id] || [];
    attemptsByUser[a.user_id].push(a.score ?? 0);
  });

  // get last active timestamps
  const { data: snaps } = await supabase
    .from("progress_snapshots")
    .select("user_id, recorded_at")
    .in("user_id", userIds)
    .order("recorded_at", { ascending: false });

  const lastActive: Record<string, string> = {};
  (snaps ?? []).forEach((s: any) => {
    if (!lastActive[s.user_id]) lastActive[s.user_id] = s.recorded_at;
  });

  return students.map((st: any) => {
    const attempts = attemptsByUser[st.user_id] || [];
    const avg = attempts.length ? Math.round((attempts.reduce((a: number, b: number) => a + b, 0) / attempts.length) * 10) / 10 : 0;
    const trend = "0";
    const last = lastActive[st.user_id] ? new Date(lastActive[st.user_id]).toLocaleString() : "-";
    return { user_id: st.user_id, name: st.full_name, grade: st.class_name, score: avg, trend, lastActive: last };
  });
}

export async function getStudentDetail(userId: string) {
  if (!userId) return null;
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("user_id, full_name, class_name, grade_level, email")
    .eq("user_id", userId)
    .single();

  if (pErr) throw pErr;

  const { data: attempts, error: aErr } = await supabase
    .from("quiz_attempts")
    .select("id, quiz_set_id, score, total_questions, created_at, quiz_set:quiz_sets(id, subject_id, subject:subjects(name))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (aErr) throw aErr;

  return { profile, attempts };
}

export async function getStudentSubjectBreakdown(userId: string) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("score, quiz_set:quiz_sets(id, subject_id, subject:subjects(name))")
    .eq("user_id", userId);

  if (error) throw error;

  const map: Record<string, { sum: number; count: number }> = {};
  (data ?? []).forEach((row: any) => {
    const subject = row.quiz_set?.subject?.name ?? "Umum";
    map[subject] = map[subject] || { sum: 0, count: 0 };
    map[subject].sum += row.score ?? 0;
    map[subject].count += 1;
  });

  return Object.keys(map).map((k) => ({ name: k, average: Math.round((map[k].sum / map[k].count) * 10) / 10, attempts: map[k].count }));
}

export async function getStudentNotes(userId: string) {
  const { data, error } = await supabase
    .from('student_notes')
    .select('id, author_id, content, created_at, author:profiles(full_name)')
    .eq('student_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function saveStudentNote(studentId: string, authorId: string, content: string) {
  const { data, error } = await supabase
    .from('student_notes')
    .insert({ student_id: studentId, author_id: authorId, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}
