import { useState } from "react";
import { Trophy, Flame, Star, TrendingUp, Crown, Medal, Award, Zap } from "lucide-react";

type Period = "minggu" | "bulan" | "sepanjang";

interface Player {
  rank: number;
  name: string;
  points: number;
  streak: number;
  badge: string;
  modules: number;
  quizzes: number;
  trend: number;
  isMe: boolean;
}

// Hardcoded players removed - use data prop from parent instead

const achievements = [
  { name: "Streak Master", desc: "7 hari berturut-turut", icon: "🔥", earned: true },
  { name: "Quiz Champion", desc: "50 kuis diselesaikan", icon: "🧠", earned: true },
  { name: "Modul Hunter", desc: "38 modul dipelajari", icon: "📚", earned: true },
  { name: "Perfect Score", desc: "Nilai 100 dalam kuis", icon: "💯", earned: false },
  { name: "Early Bird", desc: "Belajar sebelum jam 7", icon: "🌅", earned: false },
  { name: "Night Owl", desc: "Belajar setelah jam 21", icon: "🦉", earned: false },
];

interface LeaderboardProps {
  currentUserId?: string | null;
  data?: Player[];
}

export function Leaderboard({ currentUserId, data }: LeaderboardProps) {
  const [period, setPeriod] = useState<Period>("minggu");
  const playerList = data && data.length ? data : [];
  const myRank = playerList.find(p => p.isMe);

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-gray-900">Papan Peringkat</h2>
          <p className="text-gray-500 text-sm">Bersaing dengan teman dan raih hadiah!</p>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-6 w-fit">
        {(["minggu", "bulan", "sepanjang"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all ${period === p ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            {p === "sepanjang" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1) + " Ini"}
          </button>
        ))}
      </div>

      {/* My Rank Banner */}
      {myRank && (
        <div className="mb-6 p-4 rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                #{myRank.rank}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Posisi Kamu</p>
                <p className="text-xs text-gray-500">{myRank.points.toLocaleString()} poin • Streak {myRank.streak} hari 🔥</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-orange-100 px-3 py-1.5 rounded-full">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-medium text-orange-700">{myRank.streak} hari</span>
              </div>
              <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-full">
                <Star className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-medium text-yellow-700">{myRank.points.toLocaleString()} pts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-3 mb-6 h-40">
        {playerList.slice(0, 3).map((player, index) => {
          const podium = ["🥈", "🏆", "🥉"];
          const widths = ["w-14 h-14", "w-16 h-16", "w-14 h-14"];
          const podiumClasses = ["bg-gray-200", "bg-gradient-to-br from-yellow-400 to-orange-400", "bg-orange-100"];
          const rankLabels = ["2", "1", "3"];
          const textColors = ["text-gray-700", "text-yellow-600", "text-gray-700"];
          return (
            <div key={player.rank} className="flex-1 max-w-28 flex flex-col items-center">
              <div className={`${widths[index]} rounded-2xl ${podiumClasses[index]} flex items-center justify-center text-2xl mb-2 ${index === 1 ? "shadow-lg" : ""}`}>{podium[index]}</div>
              <p className="text-xs text-center text-gray-700 font-medium truncate w-full text-center">{player.name.split(" ")[0]}</p>
              <p className="text-xs text-gray-500">{player.points.toLocaleString()}</p>
              <div
                className={`w-full rounded-t-2xl mt-2 flex items-center justify-center ${index === 1 ? "shadow-md" : ""}`}
                style={{
                  height: index === 1 ? 96 : index === 0 ? 64 : 48,
                  background: index === 1 ? "linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)" : index === 0 ? "#E5E7EB" : "#FED7AA",
                }}
              >
                <span className={`text-white font-bold text-xl ${index === 1 ? "" : "text-gray-500"}`}>{rankLabels[index]}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Full Rankings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-gray-900">Peringkat Lengkap</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {playerList.map((p) => (
              <div key={p.rank} className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${p.isMe ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-gray-50"}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${p.rank === 1 ? "bg-yellow-100 text-yellow-700" : p.rank === 2 ? "bg-gray-100 text-gray-600" : p.rank === 3 ? "bg-orange-100 text-orange-600" : "bg-gray-50 text-gray-500"}`}>
                  {p.rank <= 3 ? p.badge : p.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${p.isMe ? "text-blue-700" : "text-gray-800"}`}>
                    {p.name} {p.isMe && <span className="text-xs text-blue-500">(Kamu)</span>}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" /> {p.streak}h
                    </span>
                    <span className="text-xs text-gray-400">{p.modules} modul</span>
                    <span className="text-xs text-gray-400">{p.quizzes} kuis</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-800">{p.points.toLocaleString()}</p>
                  <p className={`text-xs flex items-center gap-0.5 justify-end ${p.trend > 0 ? "text-green-500" : p.trend < 0 ? "text-red-400" : "text-gray-400"}`}>
                    {p.trend > 0 ? <TrendingUp className="w-3 h-3" /> : p.trend < 0 ? "↓" : "→"}
                    {p.trend !== 0 ? Math.abs(p.trend) : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-gray-900 mb-4">Pencapaianmu</h3>
          <div className="space-y-3">
            {achievements.map((ach) => (
              <div key={ach.name} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${ach.earned ? "bg-yellow-50 border border-yellow-100" : "bg-gray-50 opacity-50"}`}>
                <span className="text-2xl">{ach.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{ach.name}</p>
                  <p className="text-xs text-gray-500">{ach.desc}</p>
                </div>
                {ach.earned && <div className="ml-auto w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>}
              </div>
            ))}
          </div>

          {/* Streak Challenge */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-medium text-orange-800">Tantangan Streak</p>
            </div>
            <p className="text-xs text-orange-700 mb-3">Pertahankan streak 14 hari untuk unlock badge <strong>Streak Master</strong>!</p>
            <div className="w-full bg-orange-100 rounded-full h-1.5">
              <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: "50%" }}></div>
            </div>
            <p className="text-xs text-orange-500 mt-1.5">7 / 14 hari</p>
          </div>
        </div>
      </div>
    </div>
  );
}
