import { useEffect, useMemo, useState } from "react";
import {
  createForumPost,
  createForumReply,
  getForumReplies,
  getPublicForumPosts,
  getSubjects,
} from "../../lib/app-data";
import {
  BookmarkPlus,
  Clock,
  Eye,
  MessageSquare,
  Plus,
  Search,
  Send,
  ThumbsUp,
  X,
} from "lucide-react";

type ForumRole = "student" | "teacher" | "donor";
type AuthorRole = "siswa" | "guru" | "donatur";

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  role: AuthorRole;
  subject: string;
  time: string;
  likes: number;
  views: number;
  replies: number;
  liked: boolean;
  bookmarked: boolean;
  tags: string[];
  solved: boolean;
  subjectId?: number;
}

interface Reply {
  author: string;
  role: AuthorRole;
  content: string;
  time: string;
  likes: number;
  isAnswer?: boolean;
}

interface ForumProps {
  userId?: string | null;
  role: ForumRole;
  userName: string;
}

const subjectColors: Record<string, string> = {
  "Matematika": "bg-blue-100 text-blue-700",
  "Bhs. Indonesia": "bg-purple-100 text-purple-700",
  "IPA": "bg-green-100 text-green-700",
  "IPS": "bg-yellow-100 text-yellow-700",
  "Bhs. Inggris": "bg-pink-100 text-pink-700",
};

function mapRole(role: any): AuthorRole {
  if (role === "teacher") return "guru";
  if (role === "donor") return "donatur";
  return "siswa";
}

export function Forum({ userId, role, userName }: ForumProps) {
  const [postList, setPostList] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [subjects, setSubjects] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("semua");

  const [activePost, setActivePost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);

  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newSubjectName, setNewSubjectName] = useState<string>("Matematika");

  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getPublicForumPosts();
        const mapped: Post[] = (res ?? []).map((p: any) => {
          const createdAt = p.created_at ? new Date(p.created_at) : null;
          return {
            id: Number(p.id),
            title: p.title ?? "",
            content: p.content ?? "",
            author: p.profile?.full_name ?? p.user_name ?? "Pengguna",
            role: mapRole(p.profile?.role ?? p.role),
            subject: p.subject?.name ?? p.subject ?? "Umum",
            subjectId: p.subject_id ?? p.subject?.id,
            time: createdAt ? createdAt.toLocaleString() : "",
            likes: Number(p.likes ?? 0),
            views: Number(p.views ?? 0),
            replies: Number(p.replies ?? 0),
            liked: false,
            bookmarked: false,
            tags: p.tags ?? [],
            solved: Boolean(p.solved ?? false),
          };
        });
        setPostList(mapped);
      } catch (err) {
        console.error("Failed to load forum posts", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSubjects();
        setSubjects((res ?? []).map((s: any) => ({ id: Number(s.id), name: String(s.name) })));
      } catch (err) {
        console.error("Failed to load subjects", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!activePost) {
        setReplies([]);
        return;
      }
      try {
        const res = await getForumReplies(activePost.id);
        const mapped: Reply[] = (res ?? []).map((r: any) => ({
          author: r.profile?.full_name ?? r.author ?? "Pengguna",
          role: mapRole(r.profile?.role ?? r.role),
          content: r.content ?? "",
          time: r.created_at ? new Date(r.created_at).toLocaleString() : "",
          likes: Number(r.likes ?? 0),
          isAnswer: Boolean(r.is_answer ?? r.isAnswer ?? false),
        }));
        setReplies(mapped);
      } catch (err) {
        console.error("Failed to load forum replies", err);
        setReplies([]);
      }
    })();
  }, [activePost?.id]);

  const filtered = useMemo(() => {
    return postList.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSubject =
        selectedSubject === "semua" || p.subject === selectedSubject;
      return matchSearch && matchSubject;
    });
  }, [postList, searchQuery, selectedSubject]);

  const handleNewPost = async () => {
    if (!userId) {
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) return;

    const subject = subjects.find((s) => s.name === newSubjectName);
    const subjectId = subject?.id;
    if (!subjectId) {
      console.warn("Subject id not found for", newSubjectName);
      return;
    }

    try {
      await createForumPost(userId, subjectId, newTitle.trim(), newContent.trim());

      // reload
      const res = await getPublicForumPosts();
      const mapped: Post[] = (res ?? []).map((p: any) => {
        const createdAt = p.created_at ? new Date(p.created_at) : null;
        return {
          id: Number(p.id),
          title: p.title ?? "",
          content: p.content ?? "",
          author: p.profile?.full_name ?? p.user_name ?? "Pengguna",
          role: mapRole(p.profile?.role ?? p.role),
          subject: p.subject?.name ?? p.subject ?? "Umum",
          subjectId: p.subject_id ?? p.subject?.id,
          time: createdAt ? createdAt.toLocaleString() : "",
          likes: Number(p.likes ?? 0),
          views: Number(p.views ?? 0),
          replies: Number(p.replies ?? 0),
          liked: false,
          bookmarked: false,
          tags: p.tags ?? [],
          solved: Boolean(p.solved ?? false),
        };
      });

      setPostList(mapped);
    } catch (err) {
      console.error("Failed to create forum post", err);
      return;
    } finally {
      setShowNewPost(false);
      setNewTitle("");
      setNewContent("");
    }
  };

  const handleSendReply = async () => {
    if (!userId || !activePost) return;
    if (!replyText.trim()) return;

    try {
      await createForumReply(userId, activePost.id, replyText.trim());
      setReplyText("");

      const res = await getForumReplies(activePost.id);
      const mapped: Reply[] = (res ?? []).map((r: any) => ({
        author: r.profile?.full_name ?? r.author ?? "Pengguna",
        role: mapRole(r.profile?.role ?? r.role),
        content: r.content ?? "",
        time: r.created_at ? new Date(r.created_at).toLocaleString() : "",
        likes: Number(r.likes ?? 0),
        isAnswer: Boolean(r.is_answer ?? r.isAnswer ?? false),
      }));
      setReplies(mapped);
    } catch (err) {
      console.error("Failed to create forum reply", err);
    }
  };

  const authorRole: AuthorRole = role === "teacher" ? "guru" : role === "student" ? "siswa" : "donatur";

  const computedSubjectButtons = useMemo(() => {
    // use subjects from DB if available, otherwise fallback
    const names = subjects.map((s) => s.name);
    if (names.length) {
      return ["semua", ...names];
    }
    return [
      "semua",
      "Matematika",
      "IPA",
      "IPS",
      "Bhs. Indonesia",
      "Bhs. Inggris",
    ];
  }, [subjects]);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-900">Forum Diskusi</h2>
          <p className="text-gray-500 text-sm">Tanya, diskusi, dan bagi pengalaman belajar</p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
          style={{ background: "linear-gradient(135deg, #1E40AF, #2563EB)" }}
        >
          <Plus className="w-4 h-4" /> Buat Postingan
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari diskusi atau mata pelajaran..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {computedSubjectButtons.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSubject(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedSubject === s
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s === "semua" ? "Semua" : s}
          </button>
        ))}
      </div>

      {/* Post List */}
      <div className="space-y-3">
        {filtered.map((post) => (
          <div
            key={post.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm hover:border-blue-100 transition-all cursor-pointer"
            onClick={() => setActivePost(post)}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 flex-shrink-0 mt-0.5">
                  {post.author
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium text-gray-800">{post.author}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        post.role === "guru" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {post.role === "guru" ? "👩‍🏫 Guru" : "🎒 Siswa"}
                    </span>
                    {post.solved && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Terjawab</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-lg ${subjectColors[post.subject] || "bg-gray-100 text-gray-500"}`}
                    >
                      {post.subject}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.time}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="text-gray-900 mb-2 hover:text-blue-700 transition-colors">{post.title}</h4>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.content}</p>

            {/* Actions: like/bookmark belum punya endpoint di app-data.ts */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <ThumbsUp className="w-3.5 h-3.5" /> {post.likes}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <MessageSquare className="w-3.5 h-3.5" /> {post.replies} balasan
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <Eye className="w-3.5 h-3.5" /> {post.views}
              </span>
              <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                <BookmarkPlus className="w-3.5 h-3.5" />
              </span>
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 rounded-md text-gray-500">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Post Detail Modal */}
      {activePost && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setActivePost(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div className="flex-1 min-w-0 pr-4">
                {activePost.solved && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 mb-2 inline-block">
                    ✓ Terjawab
                  </span>
                )}
                <h3 className="text-gray-900">{activePost.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-lg ${
                      subjectColors[activePost.subject] || "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {activePost.subject}
                  </span>
                  <span className="text-xs text-gray-400">
                    {activePost.author} • {activePost.time}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActivePost(null)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">{activePost.content}</p>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-500 mb-3">{replies.length} Balasan</p>
                <div className="space-y-4">
                  {replies.map((reply, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${reply.isAnswer ? "p-3 bg-green-50 rounded-xl border border-green-100" : ""}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 flex-shrink-0">
                        {reply.author
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-800">{reply.author}</span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-md ${
                              reply.role === "guru" ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {reply.role === "guru" ? "Guru" : "Siswa"}
                          </span>
                          {reply.isAnswer && (
                            <span className="text-xs px-1.5 py-0.5 rounded-md bg-green-100 text-green-600">
                              ✓ Jawaban Terbaik
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <ThumbsUp className="w-3 h-3" /> {reply.likes}
                          </span>
                          <span className="text-xs text-gray-300">{reply.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {userName ? userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "RA"}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={userId ? "Tulis balasan kamu..." : "Login dulu untuk balas"}
                    disabled={!userId}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-60"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        void handleSendReply();
                      }
                    }}
                  />
                  <button
                    className="px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!userId}
                    onClick={() => void handleSendReply()}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Post Modal */}
      {showNewPost && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowNewPost(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-gray-900">Buat Diskusi Baru</h3>
              <button
                onClick={() => setShowNewPost(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">
                  Mata Pelajaran
                </label>
                <div className="flex flex-wrap gap-2">
                  {computedSubjectButtons
                    .filter((n) => n !== "semua")
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewSubjectName(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          newSubjectName === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">
                  Judul Pertanyaan / Diskusi
                </label>
                <input
                  type="text"
                  value={newTitle}
                  disabled={!userId}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={userId ? "Tulis pertanyaan kamu..." : "Login dulu untuk posting"}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={newContent}
                  disabled={!userId}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={userId ? "Jelaskan lebih detail..." : "Login dulu untuk posting"}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none disabled:opacity-60"
                />
              </div>

              <button
                disabled={!userId}
                onClick={() => void handleNewPost()}
                className="w-full py-3 rounded-xl text-white font-medium text-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #1E40AF, #2563EB)" }}
              >
                Posting Sekarang
              </button>

              {/* Small info: role currently not persisted by UI */}
              <div className="text-xs text-gray-400">
                Posting sebagai: <span className="text-gray-600 font-medium">{authorRole}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

