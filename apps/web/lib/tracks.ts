/**
 * Tier 2/3 track registry — one track per tier (agile rule).
 * math-3-addition → Tier 2 (Apu/Bhaiya tone, ৳ contexts)
 * physics/chemistry/ict/ai → Tier 3 (Banglish coach, Socratic hints)
 *
 * Socratic contract: hints guide but NEVER contain the answer.
 * Enforced by validateTrack() + tests (token-equality leak check).
 */

export type TrackTier = "tier_2" | "tier_3";
export type TrackSubject = "math" | "physics" | "chemistry" | "ict" | "ai" | "bangla";

export interface TrackLesson {
  id: string;
  topic: string;
  instruction: string;
  audioScript?: string;
  prompt: string;
  choices: string[];
  correctChoiceIndex: number;
  hints: string[];
  onSuccess: string;
  onFailure: string;
}

export interface TrackDef {
  id: string;
  subject: TrackSubject;
  tier: TrackTier;
  titleBn: string;
  titleEn: string;
  cover: string;
  mascot: string;
  theme: string;
  coachLine: string;
  baseXp: number;
  streak: number;
  lessons: TrackLesson[];
}

const BN_DIGITS: Record<string, string> = {
  "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
  "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
};

export function normalizeAnswer(s: string): string {
  return s
    .split("")
    .map((ch) => BN_DIGITS[ch] ?? ch)
    .join("")
    .toLowerCase();
}

/** Leak = the answer appears as a standalone token in the hint. */
export function hintLeaksAnswer(hint: string, answer: string): boolean {
  const target = normalizeAnswer(answer).trim();
  if (!target) return false;
  const tokens = normalizeAnswer(hint).split(/[\s,.;:!?()+=×÷*/—–\-"“”'‘]+/);
  return tokens.some((t) => t === target);
}

export function validateTrack(track: TrackDef): string[] {
  const issues: string[] = [];
  if (track.lessons.length === 0) issues.push(`${track.id}: no lessons`);
  if (track.baseXp < 0 || track.baseXp > 500) issues.push(`${track.id}: baseXp out of range`);
  if (track.streak < 1.0 || track.streak > 5.0) issues.push(`${track.id}: streak out of range`);
  for (const l of track.lessons) {
    const tag = `${track.id}/${l.id}`;
    if (l.choices.length < 2 || l.choices.length > 6) issues.push(`${tag}: choices must be 2-6`);
    if (l.correctChoiceIndex < 0 || l.correctChoiceIndex >= l.choices.length) {
      issues.push(`${tag}: correctChoiceIndex out of range`);
    }
    if (l.hints.length === 0) issues.push(`${tag}: at least one hint required`);
    const answer = l.choices[l.correctChoiceIndex] ?? "";
    for (const h of l.hints) {
      if (hintLeaksAnswer(h, answer)) issues.push(`${tag}: hint leaks answer ("${h}")`);
    }
  }
  return issues;
}

export const TRACKS: TrackDef[] = [
  {
    id: "math-3-addition",
    subject: "math",
    tier: "tier_2",
    titleBn: "যোগ-বিয়োগ",
    titleEn: "Addition (Class 3)",
    cover: "➕",
    mascot: "apu_mentor",
    theme: "shahid_minar_dawn",
    coachLine: "ভয় নেই, Apu সাথে আছে — এক ধাপ করে ভাবো!",
    baseXp: 20,
    streak: 1.2,
    lessons: [
      {
        id: "m1", topic: "jog_12_9",
        instruction: "তাজিমের কাছে ১২টি লিচু, লামিয়া দিল আরও ৯টি। মোট কয়টি? 🍒",
        audioScript: "চলো ধাপে ধাপে যোগ করি, ভাইয়া সাথে আছি!",
        prompt: "১২ + ৯ = ?",
        choices: ["২০", "২১", "২২", "১৯"], correctChoiceIndex: 1,
        hints: ["১২ + ৮ = ২০, তাহলে আর ১ যোগ করলে কত?", "এককের ঘর দেখো: ২ আর ৯ মিলে দশ পেরোয় — হাতে থাকে ১"],
        onSuccess: "শাবাশ, গণিতবিদ! 🌟", onFailure: "ভুল হলেও শেখা হয়! আবার দেখো 👀",
      },
      {
        id: "m2", topic: "jog_25_17",
        instruction: "Anika-র কাছে ৳২৫ ছিল, Fahim দিল আরও ৳১৭। মোট কত? 💰",
        audioScript: "টাকার হিসাব — এককের ঘর আগে!",
        prompt: "২৫ + ১৭ = ?",
        choices: ["৪১", "৪৩", "৪২", "৪০"], correctChoiceIndex: 2,
        hints: ["৫ আর ৭ মিলে দশ পেরোয় — হাতের ১ মনে রেখো", "দশকের ঘরে হাতের ১ যোগ করতে ভুলো না"],
        onSuccess: "শাবাশ, গণিতবিদ! 🌟", onFailure: "ভুল হলেও শেখা হয়! আবার দেখো 👀",
      },
      {
        id: "m3", topic: "jog_34_29",
        instruction: "Fahim ৩৪টি আম পাড়ল, Anika পাড়ল ২৯টি। মোট আম? 🥭",
        audioScript: "বড় সংখ্যা — ঘর ধরে ধরে!",
        prompt: "৩৪ + ২৯ = ?",
        choices: ["৬২", "৬৩", "৬৪", "৬১"], correctChoiceIndex: 1,
        hints: ["৪ আর ৯ মিলে দশ পেরোয় কিনা দেখো", "হাতের ১ দশকের ঘরে যোগ করো"],
        onSuccess: "শাবাশ, গণিতবিদ! 🌟", onFailure: "ভুল হলেও শেখা হয়! আবার দেখো 👀",
      },
      {
        id: "m4", topic: "jog_48_36",
        instruction: "Cox's Bazar থেকে ৪৮টি ঝিনুক, কুয়াকাটা থেকে ৩৬টি। মোট? 🐚",
        audioScript: "ঝিনুক গুনি এক এক করে!",
        prompt: "৪৮ + ৩৬ = ?",
        choices: ["৮৩", "৮৪", "৮৫", "৭৪"], correctChoiceIndex: 1,
        hints: ["৮ আর ৬ মিলে কত? দশ পেরোলে হাতে ১", "দশকের ঘর: ৪, ৩ আর হাতের ১"],
        onSuccess: "শাবাশ, গণিতবিদ! 🌟", onFailure: "ভুল হলেও শেখা হয়! আবার দেখো 👀",
      },
      {
        id: "m5", topic: "jog_56_27",
        instruction: "Pohela Boishakh মেলায় খরচ ৳৫৬ + ৳২৭। মোট খরচ? 🎏",
        audioScript: "মেলার হিসাব — মজায় মজায়!",
        prompt: "৫৬ + ২৭ = ?",
        choices: ["৮২", "৭৩", "৮৩", "৯৩"], correctChoiceIndex: 2,
        hints: ["৬ আর ৭ মিলে দশ পেরোয়", "হাতের ১ নিয়ে দশকের ঘর মিলাও"],
        onSuccess: "শাবাশ, গণিতবিদ! 🌟", onFailure: "ভুল হলেও শেখা হয়! আবার দেখো 👀",
      },
      {
        id: "m6", topic: "jog_67_25",
        instruction: "Sundarbans-এ ৬৭টি চারা, আরও লাগানো হলো ২৫টি। মোট চারা? 🌱",
        audioScript: "গাছ লাগাই, সংখ্যা বাড়াই!",
        prompt: "৬৭ + ২৫ = ?",
        choices: ["৯১", "৯২", "৯৩", "৮২"], correctChoiceIndex: 1,
        hints: ["৭ আর ৫ মিলে দশ পেরোয় কিনা দেখো", "হাতের ১ সহ দশকের ঘর"],
        onSuccess: "শাবাশ, গণিতবিদ! 🌟", onFailure: "ভুল হলেও শেখা হয়! আবার দেখো 👀",
      },
      {
        id: "m7", topic: "jog_89_13",
        instruction: "লাইব্রেরিতে ৮৯টি বই, নতুন এলো ১৩টি। এখন কয়টি? 📚",
        audioScript: "তিন অঙ্কের যোগ — ভয় কী!",
        prompt: "৮৯ + ১৩ = ?",
        choices: ["১০১", "১১২", "১০২", "৯২"], correctChoiceIndex: 2,
        hints: ["৯ আর ৩ মিলে দশ পেরোয় — শতকের ঘরে ১", "দশকের ঘরে হাতের ১ যোগ করো"],
        onSuccess: "শাবাশ, গণিতবিদ! 🌟", onFailure: "ভুল হলেও শেখা হয়! আবার দেখো 👀",
      },
      {
        id: "m8", topic: "jog_76_28",
        instruction: "স্কুলে ৭৬ জন ছাত্র, ২৮ জন ছাত্রী। মোট শিক্ষার্থী? 🏫",
        audioScript: "শেষ অঙ্ক — full focus!",
        prompt: "৭৬ + ২৮ = ?",
        choices: ["১০৩", "৯৪", "১১৪", "১০৪"], correctChoiceIndex: 3,
        hints: ["৬ আর ৮ মিলে দশ পেরোয় — শতক আসছে", "শতক, দশক, একক — তিন ঘরেই চোখ"],
        onSuccess: "শাবাশ, গণিতবিদ! 🌟", onFailure: "ভুল হলেও শেখা হয়! আবার দেখো 👀",
      },
    ],
  },
  {
    id: "phy-9-motion",
    subject: "physics",
    tier: "tier_3",
    titleBn: "গতি",
    titleEn: "Motion (Class 9)",
    cover: "🚀",
    mascot: "tech_coach_robo",
    theme: "hilsha_river_blue",
    coachLine: "Straight মুখস্থ না — derive করি!",
    baseXp: 30,
    streak: 1.5,
    lessons: [
      {
        id: "p1", topic: "s_vt",
        instruction: "Sundarbans-এ ট্রলার 10 m/s বেগে 5s চলল। দূরত্ব? 🛶",
        audioScript: "s = vt মনে আছে? v=10, t=5 — তাহলে s=?",
        prompt: "s = v × t = 10 × 5 = ___ m",
        choices: ["15", "50", "2", "105"], correctChoiceIndex: 1,
        hints: ["unit check করো: m/s × s = m", "গুণটা ভাঙো: 10+10+10+10+10"],
        onSuccess: "Boom! Physics sorted 🔥", onFailure: "Almost there! Formula-টা আবার check করো",
      },
      {
        id: "p2", topic: "v_st",
        instruction: "রিকশা 100 m গেল 20 s-এ। বেগ কত? 🛺",
        audioScript: "v = s ÷ t — ভাগ করো!",
        prompt: "v = 100 ÷ 20 = ___ m/s",
        choices: ["5", "20", "2000", "120"], correctChoiceIndex: 0,
        hints: ["শূন্য কাটাকাটি করো: 10 ÷ 2", "বড় সংখ্যাকে ছোট ভাগে ভাঙো"],
        onSuccess: "Boom! Physics sorted 🔥", onFailure: "Almost there! Formula-টা আবার check করো",
      },
      {
        id: "p3", topic: "t_sv",
        instruction: "ট্রেন 120 km যাবে 60 km/h বেগে। সময়? 🚂",
        audioScript: "t = s ÷ v — unit দেখো!",
        prompt: "t = 120 ÷ 60 = ___ h",
        choices: ["2", "60", "180", "120"], correctChoiceIndex: 0,
        hints: ["ঘণ্টার unit আসে: km ÷ km/h", "12 আর 6-এর সম্পর্ক ভাবো"],
        onSuccess: "Boom! Physics sorted 🔥", onFailure: "Almost there! Formula-টা আবার check করো",
      },
      {
        id: "p4", topic: "unit_speed",
        instruction: "বেগের একক কোনটি? Board-এ বারবার আসে! 📝",
        prompt: "বেগের SI একক ___",
        choices: ["m/s", "m", "s", "kg"], correctChoiceIndex: 0,
        hints: ["বেগ = দূরত্ব ÷ সময়", "দূরত্ব মিটার, সময় সেকেন্ড — ভাগফলের unit?"],
        onSuccess: "Boom! Physics sorted 🔥", onFailure: "Almost there! Formula-টা আবার check করো",
      },
      {
        id: "p5", topic: "graph_st",
        instruction: "s-t গ্রাফে সরলরেখা মানে কী? 📈",
        prompt: "s-t গ্রাফ সরলরেখা → ___",
        choices: ["সমান বেগ", "বেগ বাড়ছে", "থেমে আছে", "পেছনে যাচ্ছে"], correctChoiceIndex: 0,
        hints: ["সরলরেখা = steady", "line যত খাড়া, বেগ তত বেশি — কিন্তু shape-টা?"],
        onSuccess: "Boom! Physics sorted 🔥", onFailure: "Almost there! Formula-টা আবার check করো",
      },
    ],
  },
  {
    id: "chem-9-atom",
    subject: "chemistry",
    tier: "tier_3",
    titleBn: "পরমাণু",
    titleEn: "Atom (Class 9)",
    cover: "🧪",
    mascot: "tech_coach_robo",
    theme: "jackfruit_garden",
    coachLine: "ছোট্ট জিনিস, বড় ধারণা — step by step!",
    baseXp: 30,
    streak: 1.5,
    lessons: [
      {
        id: "c1", topic: "nucleus",
        instruction: "পরমাণুর ভারী কেন্দ্রের নাম কী? ⚛️",
        prompt: "পরমাণুর কেন্দ্র = ___",
        choices: ["নিউক্লিয়াস", "ইলেকট্রন মেঘ", "শেল", "নিউট্রন একা"], correctChoiceIndex: 0,
        hints: ["ভারী অংশ থাকে মাঝখানে", "প্রোটন আর নিউট্রন থাকে যেখানে"],
        onSuccess: "Boom! Chemistry sorted 🧪", onFailure: "Almost! মডেলটা কল্পনা করো",
      },
      {
        id: "c2", topic: "h2o",
        instruction: "H₂O মানে কী? প্রতিদিন খাও! 💧",
        audioScript: "H = হাইড্রোজেন, O = অক্সিজেন — মিলাও!",
        prompt: "H₂O = ___",
        choices: ["লবণ", "অক্সিজেন", "পানি", "হাইড্রোজেন"], correctChoiceIndex: 2,
        hints: ["দিনে কয় গ্লাস খাও? 😉", "দুই H আর এক O মিলে যা হয়"],
        onSuccess: "Boom! Chemistry sorted 🧪", onFailure: "Almost! Formula-টা ভাঙো",
      },
      {
        id: "c3", topic: "atomic_number",
        instruction: "পারমাণবিক সংখ্যা মানে কী? Board favorite! 📝",
        prompt: "পারমাণবিক সংখ্যা = ___ সংখ্যা",
        choices: ["নিউট্রন", "ভর", "শেল", "প্রোটন"], correctChoiceIndex: 3,
        hints: ["যেটা বদলালে মৌলই বদলে যায়", "positive charge যাদের — তাদের গোনো"],
        onSuccess: "Boom! Chemistry sorted 🧪", onFailure: "Almost! পর্যায় সারণি মনে করো",
      },
    ],
  },
  {
    id: "ict-8-computer",
    subject: "ict",
    tier: "tier_3",
    titleBn: "কম্পিউটার",
    titleEn: "Computer (Class 8 ICT)",
    cover: "💻",
    mascot: "tech_coach_robo",
    theme: "shahid_minar_dawn",
    coachLine: "যে device-এ শিখছো, সেটাকেই চেনো!",
    baseXp: 30,
    streak: 1.5,
    lessons: [
      {
        id: "i1", topic: "cpu",
        instruction: "CPU-কে কম্পিউটারের কী বলা হয়? 🧠",
        prompt: "CPU = কম্পিউটারের ___",
        choices: ["মস্তিষ্ক", "মনিটর", "কিবোর্ড", "মাউস"], correctChoiceIndex: 0,
        hints: ["সব হিসাব যেখানে হয়", "মানুষের brain-এর মতো কাজ করে যেটা"],
        onSuccess: "Nice! ICT sorted 💻", onFailure: "Almost! Parts গুলো ভাবো",
      },
      {
        id: "i2", topic: "kb",
        instruction: "1 KB = কত বাইট? Memory math! 💾",
        prompt: "1 KB = ___ বাইট",
        choices: ["1000", "1024 বিট", "1024", "1"], correctChoiceIndex: 2,
        hints: ["কম্পিউটার 2-এর ঘাতে গোনে", "2^10 = ?"],
        onSuccess: "Nice! ICT sorted 💻", onFailure: "Almost! 1000 না, আরেকটু বেশি",
      },
      {
        id: "i3", topic: "input",
        instruction: "কোনটি input device? হাত দিয়ে যা ধরো! ⌨️",
        prompt: "Input device = ___",
        choices: ["মনিটর", "প্রিন্টার", "স্পিকার", "কিবোর্ড"], correctChoiceIndex: 3,
        hints: ["তথ্য ভেতরে ঢোকে যেটা দিয়ে", "output দেয় যেগুলো — সেগুলো বাদ দাও"],
        onSuccess: "Nice! ICT sorted 💻", onFailure: "Almost! Input মানে ভেতরে যাওয়া",
      },
    ],
  },
  {
    id: "ai-intro",
    subject: "ai",
    tier: "tier_3",
    titleBn: "AI চেনো",
    titleEn: "Intro to AI",
    cover: "🤖",
    mascot: "tech_coach_robo",
    theme: "hilsha_river_blue",
    coachLine: "AI ভয় না — tool! Smart consumer হও!",
    baseXp: 30,
    streak: 1.5,
    lessons: [
      {
        id: "a1", topic: "what_is_ai",
        instruction: "AI আসলে কী? Spotify-এর গানের suggestion মনে করো! 🎵",
        prompt: "AI মানে ___",
        choices: ["প্যাটার্ন থেকে শেখা সফটওয়্যার", "রোবট-মানুষ", "যাদু", "ইন্টারনেট"], correctChoiceIndex: 0,
        hints: ["data দেখে শেখে — মুখস্থ করে না", "YouTube recommendation কীভাবে আসে ভাবো"],
        onSuccess: "AI mindset unlocked 🤖", onFailure: "Again ভাবো — magic না, math!",
      },
      {
        id: "a2", topic: "ai_data",
        instruction: "AI ভালো শিখতে কী দরকার? Practice makes perfect! 📊",
        prompt: "AI শেখে ___ দিয়ে",
        choices: ["বেশি বোতাম", "বেশি আওয়াজ", "বেশি ভালো উদাহরণ", "বেশি রং"], correctChoiceIndex: 2,
        hints: ["মানুষ যেমন practice-এ শেখে", "example-এর ভালো নাম কী? data!"],
        onSuccess: "AI mindset unlocked 🤖", onFailure: "Again ভাবো — বোতাম না, উদাহরণ!",
      },
      {
        id: "a3", topic: "ai_safety",
        instruction: "অচেনা AI app-এ কী কখনো দেবে না? 🔒",
        prompt: "Share করবো না: ___",
        choices: ["অঙ্কের প্রশ্ন", "নিজের ছবি/ঠিকানা", "ছড়া", "গানের নাম"], correctChoiceIndex: 1,
        hints: ["personal info = private, always", "নাম-ঠিকানা-ছবি — তিনটেই লাল পতাকা"],
        onSuccess: "Safe user badge! 🔒", onFailure: "Careful! Private জিনিস চেনো",
      },
    ],
  },
  {
    id: "nctb-1-bn-path",
    subject: "bangla",
    tier: "tier_2",
    titleBn: "NCTB পাঠ ১–৯",
    titleEn: "Amar Bangla Boi (Path 1-9)",
    cover: "📖",
    mascot: "apu_mentor",
    theme: "shahid_minar_dawn",
    coachLine: "ভয় নেই, Apu সাথে আছে — বইয়ের পাতা ধরে শিখি!",
    baseXp: 15,
    streak: 1.2,
    lessons: [
      {
        id: "n1", topic: "path1_porichoy",
        instruction: "পাঠ ১: আমার পরিচয় — নাম, শ্রেণি, রোল, বিদ্যালয়ের নাম লেখো।",
        audioScript: "নিজের নাম বলো!",
        prompt: "নিজের পরিচয়ে কী কী লিখি?",
        choices: ["নাম, শ্রেণি, রোল, বিদ্যালয়", "শুধু নাম", "শুধু ছবি", "কিছু না"], correctChoiceIndex: 0,
        hints: ["চারটা জিনিস লাগে", "তুমি কোন ক্লাসে পড়ো — সেটাও লেখো"],
        onSuccess: "শাবাশ! 🎉", onFailure: "বইয়ের ১ নম্বর পাতা দেখো 👀",
      },
      {
        id: "n2", topic: "path2_rong",
        instruction: "পাঠ ২: এসো রং করি ও আঁকি — পতাকায় রং দাও।",
        audioScript: "লাল-সবুজ রং করো!",
        prompt: "পাঠ ২-এ কী করি?",
        choices: ["রং করি ও আঁকি", "গান গাই", "দৌড়াই", "ঘুমাই"], correctChoiceIndex: 0,
        hints: ["পতাকায় লাল-সবুজ দাও", "খাতায় ছবি আঁকো"],
        onSuccess: "শাবাশ! 🎉", onFailure: "বইয়ের ২ নম্বর পাতা দেখো 👀",
      },
      {
        id: "n3", topic: "path3_bidyaloy",
        instruction: "পাঠ ৩: আমি ও আমার বিদ্যালয় — খুশি আপার সাথে কথা বলি।",
        audioScript: "খুশি আপা কে?",
        prompt: "খুশি আপা কে?",
        choices: ["শিক্ষক", "ডাক্তার", "রাখাল", "মাঝি"], correctChoiceIndex: 0,
        hints: ["ক্লাসে পড়ান যিনি", "বিদ্যালয়ে থাকেন"],
        onSuccess: "শাবাশ! 🎉", onFailure: "বইয়ের ৩ নম্বর পাতা দেখো 👀",
      },
      {
        id: "n4", topic: "path4_sohopathi",
        instruction: "পাঠ ৪: আমি ও আমার সহপাঠীরা — তুলি, রাফি, মিলি, অভি।",
        audioScript: "বন্ধুদের নাম বলো!",
        prompt: "তুলি-রাফি-মিলি-অভি কারা?",
        choices: ["সহপাঠী", "শিক্ষক", "রাখাল", "মাছ"], correctChoiceIndex: 0,
        hints: ["একসাথে পড়ে যারা", "তোমার ক্লাসের বন্ধুরা"],
        onSuccess: "শাবাশ! 🎉", onFailure: "বইয়ের ৪ নম্বর পাতা দেখো 👀",
      },
      {
        id: "n5", topic: "path5_anka",
        instruction: "পাঠ ৫: আঁকাআঁকি — দাগ টেনে রং করি।",
        audioScript: "দাগ টানো!",
        prompt: "দাগ টানার খেলায় কী শিখি?",
        choices: ["হাতের নিয়ন্ত্রণ", "সাঁতার", "গান", "রান্না"], correctChoiceIndex: 0,
        hints: ["পেন্সিল সোজা চলে", "বেলুনের গায়ে দাগ দাও"],
        onSuccess: "শাবাশ! 🎉", onFailure: "আবার দাগ টানো 💪",
      },
      {
        id: "n6", topic: "path6_kaj",
        instruction: "পাঠ ৬: আমরা কী কী করি — হাতমুখ ধুই, দাঁত মাজি, বই গোছাই।",
        audioScript: "সকালে কী করো?",
        prompt: "সকালে উঠে প্রথমে কী করি?",
        choices: ["হাতমুখ ধুই", "খেলি", "ঘুমাই", "টিভি দেখি"], correctChoiceIndex: 0,
        hints: ["পরিষ্কার হই", "দাঁত মাজার আগে"],
        onSuccess: "শাবাশ! 🎉", onFailure: "বইয়ের ৬ নম্বর পাতা দেখো 👀",
      },
      {
        id: "n7", topic: "path8_chora",
        instruction: "পাঠ ৮: ছড়া — আতা গাছে তোতা পাখি।",
        audioScript: "ছড়া বলো!",
        prompt: "আতা গাছে কে?",
        choices: ["তোতা পাখি", "দোয়েল", "কাক", "ময়না"], correctChoiceIndex: 0,
        hints: ["সবুজ পাখি", "কথা বলতে পারে"],
        onSuccess: "শাবাশ! 🎉", onFailure: "বইয়ের ১১ নম্বর পাতা দেখো 👀",
      },
      {
        id: "n8", topic: "path9_rakhal",
        instruction: "পাঠ ৯: বাঘ ও রাখাল — মজা করে মিথ্যা বলল।",
        audioScript: "গল্পটা মনে করো!",
        prompt: "শেষে কী শিখলাম?",
        choices: ["মিথ্যা বলতে নেই", "বাঘ পোষা যায়", "বাঁশি বাজানো", "গরু গোনা"], correctChoiceIndex: 0,
        hints: ["সত্যি বলাই ভালো", "বারবার বোকা বানালে সাহায্য আসে না"],
        onSuccess: "শাবাশ! 🎉", onFailure: "গল্পটা আবার পড়ো 📖",
      },
      {
        id: "n9", topic: "path7_dag",
        instruction: "পাঠ ৭: আঁকাআঁকি — পেন্সিলে দাগ টানি।",
        audioScript: "পেন্সিল ধরো!",
        prompt: "দাগ টানতে কী লাগে?",
        choices: ["পেন্সিল", "বাঁশি", "গরু", "মেঘ"], correctChoiceIndex: 0,
        hints: ["হাতে ধরে লিখি", "খাতায় দাগ দাও"],
        onSuccess: "শাবাশ! 🎉", onFailure: "আবার চেষ্টা করো 💪",
      },
    ],
  },
];

export function getTrack(id: string): TrackDef | undefined {
  return TRACKS.find((t) => t.id === id);
}

export const TOTAL_TRACK_LESSONS = TRACKS.reduce((n, t) => n + t.lessons.length, 0);
