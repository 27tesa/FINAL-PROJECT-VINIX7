import { useState } from "react";
import { Sparkles, Upload, Play, RefreshCw, Copy, Check, ChevronRight, AlertCircle, BookOpen, X, Plus, Trash2 } from "lucide-react";

type QuizType = "pilihan_ganda" | "esai" | "campuran";
type Difficulty = "mudah" | "sedang" | "sulit";

interface Question {
  id: number;
  type: "pilihan_ganda" | "esai";
  question: string;
  options?: string[];
  answer?: string;
  explanation: string;
  difficulty: Difficulty;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    type: "pilihan_ganda",
    question: "Akar-akar persamaan kuadrat x² - 5x + 6 = 0 adalah...",
    options: ["x = 1 dan x = 6", "x = 2 dan x = 3", "x = -2 dan x = -3", "x = -1 dan x = 6"],
    answer: "x = 2 dan x = 3",
    explanation: "Dengan memfaktorkan: (x-2)(x-3) = 0, diperoleh x = 2 atau x = 3.",
    difficulty: "sedang",
  },
  {
    id: 2,
    type: "pilihan_ganda",
    question: "Nilai diskriminan (D) dari persamaan 2x² + 4x - 6 = 0 adalah...",
    options: ["D = 48", "D = 64", "D = 16", "D = 32"],
    answer: "D = 64",
    explanation: "D = b² - 4ac = 4² - 4(2)(-6) = 16 + 48 = 64.",
    difficulty: "mudah",
  },
  {
    id: 3,
    type: "esai",
    question: "Jelaskan apa yang dimaksud dengan persamaan kuadrat sempurna dan berikan satu contohnya!",
    explanation: "Persamaan kuadrat sempurna adalah persamaan yang nilai diskriminannya = 0, sehingga memiliki dua akar yang sama. Contoh: x² - 6x + 9 = 0 → (x-3)² = 0 → x = 3 (akar kembar).",
    difficulty: "sulit",
  },
  {
    id: 4,
    type: "pilihan_ganda",
    question: "Persamaan x² + bx + 9 = 0 memiliki akar-akar yang sama. Nilai b yang mungkin adalah...",
    options: ["b = 6 atau b = -6", "b = 3 atau b = -3", "b = 9 atau b = -9", "b = 4 atau b = -4"],
    answer: "b = 6 atau b = -6",
    explanation: "Akar sama berarti D=0: b² - 4(1)(9) = 0 → b² = 36 → b = ±6.",
    difficulty: "sulit",
  },
  {
    id: 5,
    type: "pilihan_ganda",
    question: "Jika x₁ dan x₂ adalah akar-akar x² - 7x + 10 = 0, maka nilai x₁ + x₂ adalah...",
    options: ["5", "7", "10", "2"],
    answer: "7",
    explanation: "Berdasarkan rumus Vieta: x₁ + x₂ = -b/a = -(-7)/1 = 7.",
    difficulty: "sedang",
  },
];

export function AIQuizMaker() {
  const [step, setStep] = useState<"input" | "generating" | "result">("input");
  const [inputText, setInputText] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizType, setQuizType] = useState<QuizType>("campuran");
  const [difficulty, setDifficulty] = useState<Difficulty>("sedang");
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [generatingProgress, setGeneratingProgress] = useState(0);

  const difficultyColor: Record<Difficulty, string> = {
    mudah: "bg-green-100 text-green-700",
    sedang: "bg-yellow-100 text-yellow-700",
    sulit: "bg-red-100 text-red-700",
  };

  const sampleText = `Persamaan kuadrat adalah persamaan yang berbentuk ax² + bx + c = 0,
dimana a ≠ 0. Persamaan ini memiliki paling banyak dua akar atau solusi.

Cara menyelesaikan persamaan kuadrat:
1. Pemfaktoran: Jika ax² + bx + c = (px + q)(rx + s) = 0
2. Melengkapkan kuadrat sempurna
3. Rumus ABC: x = (-b ± √(b² - 4ac)) / 2a

Diskriminan (D = b² - 4ac) menentukan jenis akar:
- D > 0: dua akar berbeda dan nyata
- D = 0: dua akar sama (akar kembar)
- D < 0: tidak ada akar nyata (akar imajiner)`;

  const handleGenerate = () => {
    if (!inputText.trim()) return;
    setStep("generating");
    setGeneratingProgress(0);
    const interval = setInterval(() => {
      setGeneratingProgress((p) => {
        if (p >= 95) { clearInterval(interval); return 95; }
        return p + Math.random() * 15;
      });
    }, 300);
    setTimeout(() => {
      clearInterval(interval);
      setGeneratingProgress(100);
      setTimeout(() => {
        setQuestions(sampleQuestions.slice(0, questionCount));
        setStep("result");
      }, 400);
    }, 3000);
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteQuestion = (id: number) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-gray-900">Pembuat Kuis AI</h2>
          <p className="text-gray-500 text-sm">Upload materi teks → AI buat soal otomatis</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {["Input Materi", "Proses AI", "Hasil Soal"].map((label, i) => {
          const stepKeys = ["input", "generating", "result"] as const;
          const isActive = step === stepKeys[i];
          const isDone = stepKeys.indexOf(step) > i;
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-all ${isDone ? "bg-green-500 text-white" : isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                {isDone ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${isActive ? "text-blue-700" : isDone ? "text-green-600" : "text-gray-400"}`}>{label}</span>
              {i < 2 && <div className={`flex-1 h-px ${isDone ? "bg-green-300" : "bg-gray-200"}`}></div>}
            </div>
          );
        })}
      </div>

      {/* Step 1: Input */}
      {step === "input" && (
        <div className="space-y-4">
          {/* Config Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Jenis Soal</label>
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                {(["pilihan_ganda", "esai", "campuran"] as QuizType[]).map((t) => (
                  <button key={t} onClick={() => setQuizType(t)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${quizType === t ? "bg-white shadow text-blue-700" : "text-gray-500"}`}>
                    {t === "pilihan_ganda" ? "PG" : t === "esai" ? "Esai" : "Campuran"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Tingkat Kesulitan</label>
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                {(["mudah", "sedang", "sulit"] as Difficulty[]).map((d) => (
                  <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${difficulty === d ? "bg-white shadow text-blue-700" : "text-gray-500"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Jumlah Soal: {questionCount}</label>
              <input
                type="range" min={3} max={20} value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full accent-blue-600 mt-2"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>3</span><span>20</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Judul Kuis (opsional)</label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Contoh: Kuis Persamaan Kuadrat Kelas 9"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teks Materi Pelajaran</label>
              <button onClick={() => setInputText(sampleText)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Gunakan contoh
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tempel atau ketik materi pelajaran di sini. AI akan menganalisis teks dan membuat soal-soal yang relevan secara otomatis..."
              rows={10}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">{inputText.length} karakter • Minimal 100 karakter</p>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 px-3 py-1.5 rounded-lg hover:border-gray-400 transition-colors">
                <Upload className="w-3.5 h-3.5" /> Upload File (.txt, .pdf)
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={inputText.length < 50}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-medium transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }}
            >
              <Sparkles className="w-5 h-5" />
              Buat Soal dengan AI
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              AI akan menganalisis teks materi dan membuat soal sesuai tingkat pemahaman literasi dan numerasi.
              Materi minimal 100 karakter untuk hasil terbaik. Soal yang dihasilkan dapat diedit sebelum diterbitkan.
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Generating */}
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-gray-900 mb-2">AI sedang membuat soal...</h3>
          <p className="text-gray-500 text-sm mb-8">Menganalisis teks dan menyesuaikan dengan level {difficulty}</p>
          <div className="w-full max-w-xs bg-gray-100 rounded-full h-2 overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${generatingProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">{Math.round(generatingProgress)}%</p>
          <div className="mt-8 space-y-2 text-xs text-gray-400 text-center">
            {["Membaca dan memahami teks materi...", "Mengidentifikasi konsep kunci...", "Membuat soal dan pilihan jawaban...", "Menambahkan penjelasan pembahasan..."].map((msg, i) => (
              <div key={i} className={`flex items-center gap-2 justify-center transition-all ${generatingProgress > i * 25 ? "text-purple-600" : ""}`}>
                {generatingProgress > i * 25 ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current"></div>}
                <span>{msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === "result" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900">{quizTitle || "Kuis Baru"}</h3>
              <p className="text-sm text-gray-500">{questions.length} soal berhasil dibuat • Tingkat {difficulty}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setStep("input"); setQuestions([]); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Buat Ulang
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
                <Play className="w-4 h-4" /> Terbitkan Kuis
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{q.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor[q.difficulty]}`}>{q.difficulty}</span>
                      <span className="text-xs text-gray-400">{q.type === "pilihan_ganda" ? "Pilihan Ganda" : "Esai"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy(q.id, q.question); }}
                      className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copiedId === q.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedQ === q.id ? "rotate-90" : ""}`} />
                  </div>
                </div>

                {expandedQ === q.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-800 mb-3 leading-relaxed">{q.question}</p>
                    {q.options && (
                      <div className="space-y-2 mb-3">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className={`flex items-center gap-3 p-2.5 rounded-xl text-sm ${opt === q.answer ? "bg-green-50 border border-green-200 text-green-800" : "bg-gray-50 text-gray-600"}`}>
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium flex-shrink-0 ${opt === q.answer ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                              {String.fromCharCode(65 + oi)}
                            </span>
                            {opt}
                            {opt === q.answer && <Check className="w-4 h-4 text-green-600 ml-auto" />}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <p className="text-xs font-medium text-amber-700 mb-1">💡 Pembahasan</p>
                      <p className="text-xs text-amber-800 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setQuestions(prev => [...prev, {
              id: Date.now(), type: "pilihan_ganda", question: "Soal baru (klik untuk edit)...",
              options: ["Opsi A", "Opsi B", "Opsi C", "Opsi D"], answer: "Opsi A",
              explanation: "Tambahkan penjelasan pembahasan.", difficulty: "sedang"
            }])}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <Plus className="w-4 h-4" /> Tambah Soal Manual
          </button>
        </div>
      )}
    </div>
  );
}
