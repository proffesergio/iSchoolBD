/**
 * Sworoborna + Bornomala dataset — NCTB-aligned, Bangla-first.
 * Each entry powers the "Talking Letters" UI: grid cell -> fullscreen expand -> TTS script.
 * Keep entries bite-sized for short-video attention spans.
 */

// স্বরবর্ণ (11 vowels)
export const SWOROBORNO = [
  { letter: "অ", word: "অজগর", meaning_bn: "অজগর — বড় সাপ", meaning_en: "python", emoji: "🐍", phonetic: "ô", tts: "আমি অ! অজগরে অ! আমি ধীরে ধীরে চলি। বলো আমার সাথে — অ!" },
  { letter: "আ", word: "আম", meaning_bn: "আম — মিষ্টি ফল", meaning_en: "mango", emoji: "🥭", phonetic: "a", tts: "আমি আ! আমে আ! গ্রীষ্মে পাকে মিষ্টি আম। বলো — আ!" },
  { letter: "ই", word: "ইঁদুর", meaning_bn: "ইঁদুর — ছোট প্রাণী", meaning_en: "mouse", emoji: "🐭", phonetic: "i", tts: "আমি ই! ইঁদুরে ই! আমি ছোট্ট, কুটকুট করি। বলো — ই!" },
  { letter: "ঈ", word: "ঈদ", meaning_bn: "ঈদ — খুশির উৎসব", meaning_en: "Eid festival", emoji: "🌙", phonetic: "ee", tts: "আমি ঈ! ঈদে ঈ! চাঁদ উঠলে খুশির ঈদ। বলো — ঈ!" },
  { letter: "উ", word: "উট", meaning_bn: "উট — মরুভূমির জাহাজ", meaning_en: "camel", emoji: "🐪", phonetic: "u", tts: "আমি উ! উটে উ! আমার লম্বা গলা। বলো — উ!" },
  { letter: "ঊ", word: "ঊষা", meaning_bn: "ঊষা — ভোরের আলো", meaning_en: "dawn", emoji: "🌅", phonetic: "oo", tts: "আমি ঊ! ঊষায় ঊ! ভোরে সূর্য হাসে। বলো — ঊ!" },
  { letter: "ঋ", word: "ঋষি", meaning_bn: "ঋষি — জ্ঞানী মানুষ", meaning_en: "sage", emoji: "🧙", phonetic: "ri", tts: "আমি ঋ! ঋষিতে ঋ! আমি গল্প বলি। বলো — ঋ!" },
  { letter: "এ", word: "একতারা", meaning_bn: "একতারা — বাদ্যযন্ত্র", meaning_en: "ektara instrument", emoji: "🎶", phonetic: "e", tts: "আমি এ! একতারায় এ! টুংটাং বাজাই। বলো — এ!" },
  { letter: "ঐ", word: "ঐরাবত", meaning_bn: "ঐরাবত — সাদা হাতি", meaning_en: "white elephant", emoji: "🐘", phonetic: "oi", tts: "আমি ঐ! ঐরাবতে ঐ! আমি বড় হাতি। বলো — ঐ!" },
  { letter: "ও", word: "ওজন", meaning_bn: "ওজন — মাপা", meaning_en: "weight", emoji: "⚖️", phonetic: "o", tts: "আমি ও! ওজনে ও! দাঁড়িপাল্লায় মাপি। বলো — ও!" },
  { letter: "ঔ", word: "ঔষধ", meaning_bn: "ঔষধ — অসুখ সারায়", meaning_en: "medicine", emoji: "💊", phonetic: "ou", tts: "আমি ঔ! ঔষধে ঔ! অসুখ সারিয়ে দিই। বলো — ঔ!" }
];

// ব্যঞ্জনবর্ণ sample (first 12 for MVP — full 39 in crowdsourced dataset)
export const BANJONBORNO_MVP = [
  { letter: "ক", word: "কাক", meaning_bn: "কাক — কা কা করে", meaning_en: "crow", emoji: "🐦‍⬛", phonetic: "kô", tts: "কা কা! আমি ক! কাকে ক! আমি কালো কাক, গাছে বসি। বলো — ক!" },
  { letter: "খ", word: "খরগোশ", meaning_bn: "খরগোশ — লাফায়", meaning_en: "rabbit", emoji: "🐰", phonetic: "khô", tts: "আমি খ! খরগোশে খ! আমি গাজর খাই, লাফাই। বলো — খ!" },
  { letter: "গ", word: "গরু", meaning_bn: "গরু — হাম্বা করে", meaning_en: "cow", emoji: "🐄", phonetic: "gô", tts: "হাম্বা! আমি গ! গরুতে গ! আমি ঘাস খাই। বলো — গ!" },
  { letter: "ঘ", word: "ঘোড়া", meaning_bn: "ঘোড়া — দৌড়ায়", meaning_en: "horse", emoji: "🐴", phonetic: "ghô", tts: "আমি ঘ! ঘোড়ায় ঘ! আমি টগবগ দৌড়াই। বলো — ঘ!" },
  { letter: "ঙ", word: "ব্যাঙ", meaning_bn: "ব্যাঙ — লাফায় (ঙ)", meaning_en: "frog", emoji: "🐸", phonetic: "ngô", tts: "আমি ঙ! রঙে ঙ! ব্যাং ডাকে ঘ্যাঙর ঘ্যাং। বলো — ঙ!" },
  { letter: "চ", word: "চাঁদ", meaning_bn: "চাঁদ — রাতে হাসে", meaning_en: "moon", emoji: "🌕", phonetic: "chô", tts: "আমি চ! চাঁদে চ! রাতে আলো দিই। বলো — চ!" },
  { letter: "ছ", word: "ছাতা", meaning_bn: "ছাতা — বৃষ্টিতে", meaning_en: "umbrella", emoji: "☂️", phonetic: "chhô", tts: "আমি ছ! ছাতায় ছ! বৃষ্টিতে ভিজি না। বলো — ছ!" },
  { letter: "জ", word: "জাহাজ", meaning_bn: "জাহাজ — পানিতে চলে", meaning_en: "ship", emoji: "🚢", phonetic: "jô", tts: "আমি জ! জাহাজে জ! বঙ্গোপসাগরে ভাসি। বলো — জ!" },
  { letter: "ঝ", word: "ঝর্ণা", meaning_bn: "ঝর্ণা — পাহাড়ি পানি", meaning_en: "waterfall", emoji: "💧", phonetic: "jhô", tts: "আমি ঝ! ঝর্ণায় ঝ! ঝরঝর পানি পড়ে। বলো — ঝ!" },
  { letter: "ট", word: "টমেটো", meaning_bn: "টমেটো — লাল সবজি", meaning_en: "tomato", emoji: "🍅", phonetic: "ṭô", tts: "আমি ট! টমেটোয় ট! আমি লাল টুকটুকে। বলো — ট!" },
  { letter: "ঠ", word: "ঠোঁট", meaning_bn: "ঠোঁট — হাসি", meaning_en: "lips", emoji: "😊", phonetic: "ṭhô", tts: "আমি ঠ! ঠোঁটে ঠ! হাসলে ঝকঝকে। বলো — ঠ!" },
  { letter: "ড", word: "ডাব", meaning_bn: "ডাব — মিষ্টি পানি", meaning_en: "green coconut", emoji: "🥥", phonetic: "ḍô", tts: "আমি ড! ডাবে ড! গরমে ঠান্ডা পানি। বলো — ড!" }
];

export const ALL_MVP_LETTERS = [...SWOROBORNO, ...BANJONBORNO_MVP];
