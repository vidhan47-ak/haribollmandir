/* ------------------------------------------------------------------ */
/*  Automatic categorisation.                                          */
/*                                                                     */
/*  Maps article text to the fixed tag vocabulary and a single primary */
/*  category, using weighted keyword matching. Deterministic, so the   */
/*  same source always produces the same tags.                         */
/* ------------------------------------------------------------------ */

/** tag -> keywords/phrases that imply it (lowercase, matched as words). */
const TAG_KEYWORDS = {
  "Guru Tattva": ["guru", "spiritual master", "diksa", "siksa", "acharya", "gurudeva"],
  Krishna: ["krishna", "krsna", "govinda", "gopala", "syamasundara", "vrndavana", "vraja"],
  Radha: ["radha", "radhika", "radharani", "srimati"],
  Mahaprabhu: ["mahaprabhu", "chaitanya", "caitanya", "gauranga", "gaura", "nimai", "gaura lila"],
  Nityananda: ["nityananda", "nityananda", "nitai"],
  Harinam: ["harinam", "holy name", "nama", "chanting", "sankirtana", "kirtana", "maha-mantra"],
  Bhakti: ["bhakti", "devotion", "devotional service", "sadhana", "prema", "bhajana"],
  Rasa: ["rasa", "mellow", "madhurya", "vatsalya", "sakhya", "dasya", "gopi"],
  Jagannath: ["jagannatha", "jagannath", "puri", "baladeva", "subhadra"],
  "Rath Yatra": ["ratha-yatra", "rath yatra", "ratha yatra", "chariot"],
  Ekadashi: ["ekadasi", "ekadashi", "fasting", "vrata"],
  Festivals: ["festival", "utsava", "janmastami", "gaura-purnima", "kartika", "vyasa-puja", "appearance day", "disappearance day"],
  "Srimad Bhagavatam": ["srimad-bhagavatam", "srimad bhagavatam", "bhagavata", "bhagavatam"],
  "Bhagavad Gita": ["bhagavad-gita", "bhagavad gita", "gita"],
  "Chaitanya Charitamrita": ["caitanya-caritamrta", "chaitanya charitamrita", "caritamrta"],
  "Gaudiya History": ["gaudiya", "gosvami", "six gosvamis", "parampara", "lineage", "history", "vrndavana dasa"],
  "Vaisnava Etiquette": ["etiquette", "vaisnava aparadha", "offense", "sadhu-sanga", "association", "humility"],
  "Questions & Answers": ["question", "answer", "q&a", "questions and answers", "reader asks", "reply"],
};

/** Priority order when choosing the single primary category. */
const CATEGORY_PRIORITY = [
  "Questions & Answers",
  "Guru Tattva",
  "Harinam",
  "Rath Yatra",
  "Jagannath",
  "Ekadashi",
  "Festivals",
  "Mahaprabhu",
  "Nityananda",
  "Radha",
  "Krishna",
  "Rasa",
  "Srimad Bhagavatam",
  "Bhagavad Gita",
  "Chaitanya Charitamrita",
  "Gaudiya History",
  "Vaisnava Etiquette",
  "Bhakti",
];

function countMatches(haystack, keyword) {
  // Word-ish boundary match so "gita" doesn't match "digital".
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, "g");
  let count = 0;
  while (re.exec(haystack) !== null) count += 1;
  return count;
}

/** Raw keyword scores for a text blob. */
function scoreText(text) {
  const haystack = ` ${String(text).toLowerCase()} `;
  const scores = {};
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) score += countMatches(haystack, kw);
    if (score > 0) scores[tag] = score;
  }
  return scores;
}

/** Pick the single primary category from a score map. */
function categoryFrom(scores) {
  let category = "Bhakti";
  let best = -1;
  for (const tag of Object.keys(scores)) {
    const priorityRank = CATEGORY_PRIORITY.indexOf(tag);
    const weighted =
      scores[tag] * 100 - (priorityRank < 0 ? 999 : priorityRank);
    if (weighted > best) {
      best = weighted;
      category = tag;
    }
  }
  return category;
}

/**
 * Full classification of a text blob.
 * @param {string} text  full article text (title + body)
 * @returns {{ tags: string[], category: string, scores: Record<string, number> }}
 */
export function classify(text) {
  const scores = scoreText(text);
  const tags = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
    .slice(0, 6);
  return {
    tags: tags.length ? tags : ["Bhakti"],
    category: categoryFrom(scores),
    scores,
  };
}

/** Just the ordered tag list for a text blob. */
export function autoTag(text) {
  return classify(text).tags;
}

/** Join an article's title + block text into one searchable blob. */
function articleText({ title = "", blocks = [] }) {
  const body = blocks
    .map((b) =>
      Array.isArray(b.lines)
        ? b.lines.join("\n")
        : b.text || b.translation || b.transliteration || "",
    )
    .join("\n");
  return `${title}\n${body}`;
}

/**
 * Classify a structured article, honouring any curator-supplied hints.
 * @param {{ title?: string, blocks?: any[], hintTags?: string[], hintCategory?: string }} article
 * @returns {{ category: string, tags: string[] }}
 */
export function classifyArticle(article) {
  const auto = classify(articleText(article));
  const tags =
    Array.isArray(article.hintTags) && article.hintTags.length
      ? article.hintTags
      : auto.tags;
  const category = article.hintCategory || auto.category;
  return { category, tags };
}
