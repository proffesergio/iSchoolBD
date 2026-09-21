/**
 * Digital Talking-Book registry — ZAYAN-parity content model.
 * Physical book primitives mapped to the PWA:
 *  touch button  -> tap card (spell-first TTS, staged word on 2nd tap)
 *  language keys -> per-page বাংলা / English / عربي toggle
 *  question key  -> page-level ❓ quiz mode (gated by listens, like খেলা)
 *  rhymes button -> rhyme rows that recite full lines
 *  marker/trace  -> tracing canvas (Sprint 2, see docs/AGILE.md)
 *  rechargeable  -> PWA offline pack (our "battery")
 */

export type BookLang = "bn" | "en" | "ar";

export const TTS_LANG: Record<BookLang, string> = {
  bn: "bn-BD",
  en: "en-US",
  ar: "ar-SA",
};

export interface BookItem {
  /** globally unique (also the listen-tracking key) */
  id: string;
  emoji: string;
  /** shown + spoken per UI language (falls back to page default) */
  name: Partial<Record<BookLang, string>>;
  /** 2nd-tap sentence / rhyme lines / meaning */
  detail?: Partial<Record<BookLang, string>>;
  /** rhyme rows carry their own language; others follow the page toggle */
  lang?: BookLang;
  /** letter books: tapping opens the rich TalkingLetterSheet instead */
  sheetLetter?: string;
}

export type BookKind = "cards" | "rhymes";

export interface BookPageDef {
  id: string;
  titleBn: string;
  titleEn: string;
  titleAr?: string;
  cover: string;
  langs: BookLang[];
  defaultLang: BookLang;
  kind: BookKind;
  /** quiz (❓ button). Rhymes pages recite only. */
  quiz: boolean;
  /** parent-gate required (Islamic section) */
  gated?: boolean;
  /** Tier 2/3 study tracks open TrackSheet instead of BookPage */
  trackId?: string;
  /** letter books delegate taps to TalkingLetterSheet */
  sheet?: "talking-letter";
  items: BookItem[];
}

function bnItem(
  id: string,
  emoji: string,
  name: string,
  detail?: string,
  sheetLetter?: string
): BookItem {
  return {
    id,
    emoji,
    name: { bn: name },
    detail: detail ? { bn: detail } : undefined,
    sheetLetter,
  };
}

const SWORO: BookItem[] = [
  bnItem("অ", "🐍", "অ", "অজগর", "অ"),
  bnItem("আ", "🥭", "আ", "আম", "আ"),
  bnItem("ই", "🐭", "ই", "ইঁদুর", "ই"),
  bnItem("ঈ", "🌙", "ঈ", "ঈদ", "ঈ"),
  bnItem("উ", "🐪", "উ", "উট", "উ"),
  bnItem("ঊ", "🌅", "ঊ", "ঊষা", "ঊ"),
  bnItem("ঋ", "🧙", "ঋ", "ঋষি", "ঋ"),
  bnItem("এ", "🎶", "এ", "একতারা", "এ"),
  bnItem("ঐ", "🐘", "ঐ", "ঐরাবত", "ঐ"),
  bnItem("ও", "⚖️", "ও", "ওজন", "ও"),
  bnItem("ঔ", "💊", "ঔ", "ঔষধ", "ঔ"),
];

const BANJON: BookItem[] = [
  bnItem("ক", "🐦‍⬛", "ক", "কাক", "ক"),
  bnItem("খ", "🐰", "খ", "খরগোশ", "খ"),
  bnItem("গ", "🐄", "গ", "গরু", "গ"),
  bnItem("ঘ", "🐴", "ঘ", "ঘোড়া", "ঘ"),
  bnItem("ঙ", "🐸", "ঙ", "ব্যাঙ"),
  bnItem("চ", "🌙", "চ", "চাঁদ"),
  bnItem("ছ", "☂️", "ছ", "ছাতা"),
  bnItem("জ", "🚢", "জ", "জাহাজ"),
  bnItem("ঝ", "🧺", "ঝ", "ঝুড়ি"),
  bnItem("ট", "🍅", "ট", "টমেটো"),
  bnItem("ঠ", "👄", "ঠ", "ঠোঁট"),
  bnItem("ড", "🥚", "ড", "ডিম"),
  bnItem("ঢ", "🥁", "ঢ", "ঢোল"),
  bnItem("ণ", "🔔", "ণ", "ঘণ্টা"),
  bnItem("ত", "🌴", "ত", "তাল"),
  bnItem("থ", "🍽️", "থ", "থালা"),
  bnItem("দ", "🚪", "দ", "দরজা"),
  bnItem("ধ", "🌾", "ধ", "ধান"),
  bnItem("ন", "⛵", "ন", "নৌকা"),
  bnItem("প", "🐦", "প", "পাখি"),
  bnItem("ফ", "🌸", "ফ", "ফুল"),
  bnItem("ব", "📚", "ব", "বই"),
  bnItem("ভ", "🐻", "ভ", "ভালুক"),
  bnItem("ম", "🐟", "ম", "মাছ"),
  bnItem("য", "🌊", "য", "যমুনা"),
  bnItem("র", "🎨", "র", "রং"),
  bnItem("ল", "🍋", "ল", "লেবু"),
  bnItem("শ", "🪷", "শ", "শাপলা"),
  bnItem("ষ", "🐂", "ষ", "ষাঁড়"),
  bnItem("স", "☀️", "স", "সূর্য"),
  bnItem("হ", "🐘", "হ", "হাতি"),
  bnItem("ড়", "🚗", "ড়", "গাড়ি"),
  bnItem("ঢ়", "🌧️", "ঢ়", "আষাঢ়"),
  bnItem("য়", "🦜", "য়", "ময়না"),
  bnItem("ৎ", "⚡", "ৎ", "হঠাৎ"),
  bnItem("ং", "🦁", "ং", "সিংহ"),
  bnItem("ঃ", "😔", "ঃ", "দুঃখ"),
  bnItem("ঁ", "🍈", "ঁ", "কাঁঠাল"),
];

const EN_WORDS: [string, string, string][] = [
  ["A", "Apple", "🍎"], ["B", "Ball", "⚽"], ["C", "Cat", "🐱"],
  ["D", "Dog", "🐶"], ["E", "Egg", "🥚"], ["F", "Fish", "🐟"],
  ["G", "Grapes", "🍇"], ["H", "Hat", "🎩"], ["I", "Ice-cream", "🍨"],
  ["J", "Jug", "🏺"], ["K", "Kite", "🪁"], ["L", "Lion", "🦁"],
  ["M", "Mango", "🥭"], ["N", "Nest", "🪹"], ["O", "Owl", "🦉"],
  ["P", "Parrot", "🦜"], ["Q", "Queen", "👑"], ["R", "Rabbit", "🐰"],
  ["S", "Sun", "☀️"], ["T", "Tiger", "🐯"], ["U", "Umbrella", "☂️"],
  ["V", "Van", "🚐"], ["W", "Watch", "⌚"], ["X", "Xylophone", "🎵"],
  ["Y", "Yacht", "🛥️"], ["Z", "Zebra", "🦓"],
];

const AR_LETTERS: [string, string, string][] = [
  ["ا", "ألف", "ا"], ["ب", "باء", "ب"], ["ت", "تاء", "ت"],
  ["ث", "ثاء", "ث"], ["ج", "جيم", "ج"], ["ح", "حاء", "ح"],
  ["خ", "خاء", "خ"], ["د", "دال", "د"], ["ذ", "ذال", "ذ"],
  ["ر", "راء", "ر"], ["ز", "زاي", "ز"], ["س", "سين", "س"],
  ["ش", "شين", "ش"], ["ص", "صاد", "ص"], ["ض", "ضاد", "ض"],
  ["ط", "طاء", "ط"], ["ظ", "ظاء", "ظ"], ["ع", "عين", "ع"],
  ["غ", "غين", "غ"], ["ف", "فاء", "ف"], ["ق", "قاف", "ق"],
  ["ك", "كاف", "ك"], ["ل", "لام", "ل"], ["م", "ميم", "م"],
  ["ن", "نون", "ن"], ["ه", "هاء", "ه"], ["و", "واو", "و"],
  ["ي", "ياء", "ي"],
];

const BN_NUMBERS: [string, string, string][] = [
  ["১", "এক", "1"], ["২", "দুই", "2"], ["৩", "তিন", "3"],
  ["৪", "চার", "4"], ["৫", "পাঁচ", "5"], ["৬", "ছয়", "6"],
  ["৭", "সাত", "7"], ["৮", "আট", "8"],   ["৯", "নয়", "9"],
  ["১০", "দশ", "10"],
  ["১১", "এগারো", "11"],
  ["১২", "বারো", "12"],
  ["১৩", "তেরো", "13"],
  ["১৪", "চৌদ্দ", "14"],
  ["১৫", "পনেরো", "15"],
  ["১৬", "ষোলো", "16"],
  ["১৭", "সতেরো", "17"],
  ["১৮", "আঠারো", "18"],
  ["১৯", "উনিশ", "19"],
  ["২০", "বিশ", "20"],
];

const EN_NUMBERS = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty"];

const ANIMALS: [string, string, string, string][] = [
  ["tiger", "🐯", "বাঘ", "Tiger"],
  ["elephant", "🐘", "হাতি", "Elephant"],
  ["bird", "🐦", "পাখি", "Bird"],
  ["fish", "🐟", "মাছ", "Fish"],
  ["cow", "🐄", "গরু", "Cow"],
  ["cat", "🐈", "বিড়াল", "Cat"],
  ["dog", "🐕", "কুকুর", "Dog"],
  ["butterfly", "🦋", "প্রজাপতি", "Butterfly"],
];

export const BOOK_PAGES: BookPageDef[] = [
  {
    id: "sworoborna",
    titleBn: "স্বরবর্ণ",
    titleEn: "Vowels",
    cover: "🎈",
    langs: ["bn"],
    defaultLang: "bn",
    kind: "cards",
    quiz: true,
    sheet: "talking-letter",
    items: SWORO,
  },
  {
    id: "banjonborna",
    titleBn: "ব্যঞ্জনবর্ণ",
    titleEn: "Consonants",
    cover: "🐦‍⬛",
    langs: ["bn"],
    defaultLang: "bn",
    kind: "cards",
    quiz: true,
    sheet: "talking-letter",
    items: BANJON,
  },
  {
    id: "english",
    titleBn: "ইংরেজি বর্ণমালা",
    titleEn: "English Alphabet",
    cover: "🔤",
    langs: ["en"],
    defaultLang: "en",
    kind: "cards",
    quiz: true,
    items: EN_WORDS.map(([letter, word, emoji]) => ({
      id: `en-${letter}`,
      emoji,
      name: { en: letter },
      detail: { en: `${letter} for ${word}` },
    })),
  },
  {
    id: "arabic",
    titleBn: "আরবি হরফ",
    titleEn: "Arabic Alphabet",
    titleAr: "الحروف العربية",
    cover: "🌙",
    langs: ["ar"],
    defaultLang: "ar",
    kind: "cards",
    quiz: true,
    items: AR_LETTERS.map(([letter, name], i) => ({
      id: `ar-${i}`,
      emoji: letter,
      name: { ar: name },
    })),
  },
  {
    id: "numbers",
    titleBn: "সংখ্যা",
    titleEn: "Numbers",
    cover: "🔢",
    langs: ["bn", "en"],
    defaultLang: "bn",
    kind: "cards",
    quiz: true,
    items: BN_NUMBERS.map(([bnNum, bnWord, enNum], i) => ({
      id: `num-${i + 1}`,
      emoji: bnNum,
      name: { bn: bnWord, en: EN_NUMBERS[i] ?? `Number ${i + 1}` },
      detail: { bn: `${bnWord} — ${bnNum} / ${enNum}`, en: `${EN_NUMBERS[i]} — ${enNum} / ${bnNum}` },
    })),
  },
  {
    id: "animals",
    titleBn: "পশুপাখি",
    titleEn: "Animals",
    cover: "🦁",
    langs: ["bn", "en"],
    defaultLang: "bn",
    kind: "cards",
    quiz: true,
    items: ANIMALS.map(([id, emoji, bn, en]) => ({
      id: `animal-${id}`,
      emoji,
      name: { bn, en },
    })),
  },
  {
    id: "karfola",
    titleBn: "কার ও ফলা",
    titleEn: "Vowel Signs",
    cover: "✏️",
    langs: ["bn"],
    defaultLang: "bn",
    kind: "cards",
    quiz: true,
    items: [
      bnItem("kar-a", "🥭", "া", "আ-কার — আম"),
      bnItem("kar-i", "🥚", "ি", "হ্রস্ব ই-কার — ডিম"),
      bnItem("kar-ii", "🌊", "ী", "দীর্ঘ ঈ-কার — নদী"),
      bnItem("kar-u", "🌸", "ু", "হ্রস্ব উ-কার — ফুল"),
      bnItem("kar-uu", "☀️", "ূ", "দীর্ঘ ঊ-কার — সূর্য"),
      bnItem("kar-ri", "🧑‍🌾", "ৃ", "ঋ-কার — কৃষক"),
      bnItem("kar-e", "🍋", "ে", "এ-কার — লেবু"),
      bnItem("kar-oi", "🎏", "ৈ", "ঐ-কার — বৈশাখ"),
      bnItem("kar-o", "⛵", "ো", "ও-কার — নৌকা"),
      bnItem("kar-ou", "🐝", "ৌ", "ঔ-কার — মৌমাছি"),
    ],
  },
  {
    id: "rhymes",
    titleBn: "ছড়া ও গান",
    titleEn: "Rhymes & Songs",
    cover: "🎶",
    langs: ["bn", "en"],
    defaultLang: "bn",
    kind: "rhymes",
    quiz: false,
    items: [
      {
        id: "rhyme-chad",
        emoji: "🌙",
        name: { bn: "আয় আয় চাঁদ মামা" },
        detail: { bn: "আয় আয় চাঁদ মামা, টিপ দিয়ে যা। চাঁদের কপালে চাঁদ টিপ দিয়ে যা।" },
        lang: "bn",
      },
      {
        id: "rhyme-tal",
        emoji: "🌴",
        name: { bn: "তাল গাছ" },
        detail: { bn: "ঐ দেখা যায় তাল গাছ, ঐ আমাদের গাঁ। ঐখানেতে বাস করে কানা বগির ছা।" },
        lang: "bn",
      },
      {
        id: "rhyme-haat",
        emoji: "🐦",
        name: { bn: "পাখি সব করে রব" },
        detail: { bn: "পাখি সব করে রব, রাতি পোহাইল। কাননে কুসুমকলি, সকলি ফুটিল।" },
        lang: "bn",
      },
      {
        id: "rhyme-twinkle",
        emoji: "⭐",
        name: { en: "Twinkle Twinkle" },
        detail: { en: "Twinkle twinkle little star. How I wonder what you are." },
        lang: "en",
      },
      {
        id: "rhyme-humpty",
        emoji: "🥚",
        name: { en: "Humpty Dumpty" },
        detail: { en: "Humpty Dumpty sat on a wall. Humpty Dumpty had a great fall." },
        lang: "en",
      },
      {
        id: "rhyme-brishti",
        emoji: "🌧️",
        name: { bn: "আয় বৃষ্টি ঝেঁপে" },
        detail: { bn: "আয় বৃষ্টি ঝেঁপে, ধান দেবো মেপে। লেবুর পাতা করমচা, যা বৃষ্টি ঝরে যা।" },
        lang: "bn",
      },
      {
        id: "rhyme-hattima",
        emoji: "🦆",
        name: { bn: "হাট্টিমা টিম" },
        detail: { bn: "হাট্টিমাটিম টিম, তারা মাঠে পাড়ে ডিম। তাদের খাড়া দুটো শিং, তারা হাট্টিমাটিম টিম।" },
        lang: "bn",
      },
      {
        id: "rhyme-baa",
        emoji: "🐑",
        name: { en: "Baa Baa Black Sheep" },
        detail: { en: "Baa baa black sheep, have you any wool? Yes sir, yes sir, three bags full." },
        lang: "en",
      },
    ],
  },
  {
    id: "islamic",
    titleBn: "ইসলামিক শিক্ষা",
    titleEn: "Islamic Learning",
    titleAr: "التعليم الإسلامي",
    cover: "🕌",
    langs: ["bn", "ar"],
    defaultLang: "bn",
    kind: "cards",
    quiz: true,
    gated: true,
    items: [
      { id: "isl-shahada", emoji: "☝️", name: { bn: "শাহাদাহ", ar: "الشهادة" }, detail: { bn: "আল্লাহ ছাড়া কোনো ইলাহ নেই, মুহাম্মদ (সা.) আল্লাহর রাসূল।" } },
      { id: "isl-salat", emoji: "🤲", name: { bn: "সালাত", ar: "الصلاة" }, detail: { bn: "দিনে পাঁচ ওয়াক্ত নামাজ।" } },
      { id: "isl-zakat", emoji: "🤝", name: { bn: "যাকাত", ar: "الزكاة" }, detail: { bn: "গরিবদের হক — সম্পদের যাকাত।" } },
      { id: "isl-sawm", emoji: "🌙", name: { bn: "সাওম", ar: "الصوم" }, detail: { bn: "রমজান মাসে রোজা।" } },
      { id: "isl-hajj", emoji: "🕋", name: { bn: "হজ্জ", ar: "الحج" }, detail: { bn: "সামর্থ্য থাকলে কাবা শরীফে হজ্জ।" } },
      { id: "dua-ilm", emoji: "📖", name: { bn: "ইলমের দোয়া", ar: "رَبِّ زِدْنِي عِلْمًا" }, detail: { bn: "হে আমার রব, আমার জ্ঞান বাড়িয়ে দিন।" } },
      { id: "dua-ghum", emoji: "😴", name: { bn: "ঘুমের দোয়া", ar: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا" }, detail: { bn: "হে আল্লাহ, তোমার নামে মরি ও বাঁচি।" } },
      { id: "dua-khabar", emoji: "🍽️", name: { bn: "খাবারের দোয়া", ar: "بِسْمِ اللَّهِ" }, detail: { bn: "আল্লাহর নামে শুরু করছি।" } },
      { id: "names-allah", emoji: "✨", name: { bn: "আল্লাহর নাম", ar: "أسماء الله" }, detail: { bn: "আর-রহমান পরম দয়ালু, আর-রহীম অতি দয়ালু, আল-মালিক বাদশাহ, আল-কুদ্দূস পবিত্র, আস-সালাম শান্তিদাতা, আল-মুমিন নিরাপত্তাদাতা, আল-আযীয পরাক্রমশালী, আল-খালিক স্রষ্টা, আল-গাফফার ক্ষমাশীল, আল-ওয়াদূদ প্রেমময়, আস-সামী সর্বশ্রোতা, আল-বাসীর সর্বদ্রষ্টা, আল-হাকীম প্রজ্ঞাময়, আল-ওয়াকীল কর্মবিধায়ক, আস-সাবূর ধৈর্যশীল।" } },
      { id: "surah-fatiha", emoji: "📖", name: { bn: "সূরা ফাতিহা", ar: "سورة الفاتحة" }, detail: { ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ، الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، الرَّحْمَٰنِ الرَّحِيمِ، مَالِكِ يَوْمِ الدِّينِ، إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ، اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ، صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", bn: "সমস্ত প্রশংসা আল্লাহর — সোজা পথে চালাও আমাদের।" } },
      { id: "surah-ikhlas", emoji: "💎", name: { bn: "সূরা ইখলাস", ar: "سورة الإخلاص" }, detail: { ar: "قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", bn: "বলো, তিনিই আল্লাহ, এক। আল্লাহ কারো মুখাপেক্ষী নন।" } },
      { id: "surah-kawsar", emoji: "🌊", name: { bn: "সূরা কাওসার", ar: "سورة الكوثر" }, detail: { ar: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ، فَصَلِّ لِرَبِّكَ وَانْحَرْ، إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", bn: "আমি তোমাকে কাওসার দিয়েছি — রবের জন্য নামাজ পড়ো।" } },
      { id: "surah-falaq", emoji: "🌅", name: { bn: "সূরা ফালাক", ar: "سورة الفلق" }, detail: { ar: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", bn: "ভোরের রবের আশ্রয় চাই — সব অনিষ্ট থেকে।" } },
      { id: "surah-nas", emoji: "🤲", name: { bn: "সূরা নাস", ar: "سورة الناس" }, detail: { ar: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَٰهِ النَّاسِ، مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَالنَّاسِ", bn: "মানুষের রবের আশ্রয় চাই — কুমন্ত্রণা থেকে।" } },
    ],
  },
];

export const TRACK_BOOKS: { pageId: string; trackId: string; titleBn: string; titleEn: string; cover: string }[] = [
  { pageId: "track-math", trackId: "math-3-addition", titleBn: "অঙ্ক (৩য় শ্রেণি)", titleEn: "Math Class 3", cover: "➕" },
  { pageId: "track-phy", trackId: "phy-9-motion", titleBn: "পদার্থবিজ্ঞান", titleEn: "Physics Class 9", cover: "🚀" },
  { pageId: "track-chem", trackId: "chem-9-atom", titleBn: "রসায়ন", titleEn: "Chemistry Class 9", cover: "🧪" },
  { pageId: "track-ict", trackId: "ict-8-computer", titleBn: "তথ্য ও যোগাযোগ", titleEn: "ICT Class 8", cover: "💻" },
  { pageId: "track-ai", trackId: "ai-intro", titleBn: "AI চেনো", titleEn: "Intro to AI", cover: "🤖" },
];

export const TOTAL_BOOK_ITEMS = BOOK_PAGES.reduce((n, p) => n + p.items.length, 0);

export function getPage(id: string): BookPageDef | undefined {
  return BOOK_PAGES.find((p) => p.id === id);
}

export function pageTitle(page: BookPageDef, lang: BookLang): string {
  if (lang === "ar" && page.titleAr) return page.titleAr;
  if (lang === "en") return page.titleEn;
  return page.titleBn;
}

/** "X কোথায়?" — the physical ❓ question-key, per language. */
export function questionPrompt(lang: BookLang, name: string): string {
  if (lang === "en") return `Where is ${name}?`;
  if (lang === "ar") return `أين ${name}؟`;
  return `${name} কোথায়?`;
}

export function praiseText(lang: BookLang): string {
  if (lang === "en") return "Great job! 🎉";
  if (lang === "ar") return "أحسنت! 🎉";
  return "শাবাশ! 🎉";
}

export function retryText(lang: BookLang): string {
  if (lang === "en") return "Try again! 💪";
  if (lang === "ar") return "حاول مرة أخرى! 💪";
  return "আবার চেষ্টা করো! 💪";
}
