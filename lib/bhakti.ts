// ------------------------------------------------------------------
//  Data + helpers for the Daily Bhakti Companion.
//
//  Everything that rotates "per day" is chosen deterministically from the
//  Jalandhar (IST) date, so every visitor worldwide sees the same verse and
//  kīrtana on a given temple-day, and it advances at IST midnight. The Next
//  Aarti countdown is likewise anchored to temple time.
// ------------------------------------------------------------------

import {
  AARATI_TIMES,
  TEMPLE_TIME_ZONE,
  type AaratiTime,
} from "@/lib/temple";

export const JALANDHAR_TIME_ZONE = TEMPLE_TIME_ZONE;

export interface IstMoment {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number;
  second: number;
  secondsSinceMidnight: number;
  /** Whole days since the Unix epoch, in IST — advances by 1 each temple-day. */
  dayNumber: number;
}

/** Resolve the current moment in Jalandhar (IST), independent of the visitor's timezone. */
export function getIstMoment(now: Date = new Date()): IstMoment {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: JALANDHAR_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const map: Record<string, string> = {};
    for (const part of parts) {
      if (part.type !== "literal") map[part.type] = part.value;
    }

    let hour = Number(map.hour);
    if (hour === 24) hour = 0;
    const minute = Number(map.minute);
    const second = Number(map.second);
    const year = Number(map.year);
    const month = Number(map.month);
    const day = Number(map.day);
    const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);

    return {
      year,
      month,
      day,
      hour,
      minute,
      second,
      secondsSinceMidnight: hour * 3600 + minute * 60 + second,
      dayNumber,
    };
  } catch {
    const d = now;
    const dayNumber = Math.floor(
      Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000,
    );
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes(),
      second: d.getSeconds(),
      secondsSinceMidnight:
        d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(),
      dayNumber,
    };
  }
}

/** Deterministically pick one item for a given temple-day. */
export function pickForDay<T>(items: readonly T[], dayNumber: number): T {
  const length = items.length;
  const index = ((dayNumber % length) + length) % length;
  return items[index];
}

export function splitDuration(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return {
    days: Math.floor(safe / 86_400),
    hours: Math.floor((safe % 86_400) / 3600),
    minutes: Math.floor((safe % 3600) / 60),
    seconds: safe % 60,
  };
}

// ------------------------------------------------------------------
//  Verse of the Day
// ------------------------------------------------------------------
export interface Verse {
  sanskrit: string;
  transliteration: string;
  en: string;
  hi: string;
  reference: string;
}

export const VERSES: readonly Verse[] = [
  {
    sanskrit:
      "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे।\nहरे राम हरे राम राम राम हरे हरे॥",
    transliteration:
      "hare kṛṣṇa hare kṛṣṇa kṛṣṇa kṛṣṇa hare hare\nhare rāma hare rāma rāma rāma hare hare",
    en: "The mahā-mantra — the holy names of the Lord, given by Śrī Caitanya Mahāprabhu as the yuga-dharma, the one shelter for the heart in this age.",
    hi: "महामंत्र — भगवान के दिव्य नाम, जिन्हें श्री चैतन्य महाप्रभु ने इस युग का धर्म और हृदय का एकमात्र आश्रय बताया।",
    reference: "Kali-santaraṇa Upaniṣad",
  },
  {
    sanskrit:
      "मन्मना भव मद्भक्तो मद्याजी मां नमस्कुरु।\nमामेवैष्यसि युक्त्वैवमात्मानं मत्परायणः॥",
    transliteration:
      "man-manā bhava mad-bhakto mad-yājī māṁ namaskuru\nmām evaiṣyasi yuktvaivam ātmānaṁ mat-parāyaṇaḥ",
    en: "Fix your mind on Me, become My devotee, worship Me and bow to Me. Fully absorbed in Me, you will surely come to Me.",
    hi: "अपना मन मुझमें लगाओ, मेरे भक्त बनो, मेरी पूजा करो और मुझे नमस्कार करो। इस प्रकार मुझमें लीन होकर तुम अवश्य मुझे प्राप्त करोगे।",
    reference: "Bhagavad-gītā 9.34",
  },
  {
    sanskrit:
      "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥",
    transliteration:
      "sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja\nahaṁ tvāṁ sarva-pāpebhyo mokṣayiṣyāmi mā śucaḥ",
    en: "Give up all varieties of duty and simply surrender unto Me alone. I shall free you from all sins — do not fear.",
    hi: "समस्त धर्मों को त्यागकर केवल मेरी शरण में आओ। मैं तुम्हें समस्त पापों से मुक्त कर दूँगा, शोक मत करो।",
    reference: "Bhagavad-gītā 18.66",
  },
  {
    sanskrit:
      "चेतोदर्पणमार्जनं भवमहादावाग्निनिर्वापणं\nश्रेयःकैरवचन्द्रिकावितरणं विद्यावधूजीवनम्।\nआनन्दाम्बुधिवर्धनं प्रतिपदं पूर्णामृतास्वादनं\nसर्वात्मस्नपनं परं विजयते श्रीकृष्णसंकीर्तनम्॥",
    transliteration:
      "ceto-darpaṇa-mārjanaṁ bhava-mahā-dāvāgni-nirvāpaṇaṁ\nśreyaḥ-kairava-candrikā-vitaraṇaṁ vidyā-vadhū-jīvanam\nānandāmbudhi-vardhanaṁ prati-padaṁ pūrṇāmṛtāsvādanaṁ\nsarvātma-snapanaṁ paraṁ vijayate śrī-kṛṣṇa-saṅkīrtanam",
    en: "All glory to the chanting of Śrī Kṛṣṇa's name, which cleanses the mirror of the heart, quells the forest fire of material life, spreads the moonlight of good fortune, and bathes the soul in ever-rising bliss.",
    hi: "श्री कृष्ण-संकीर्तन की जय हो, जो हृदय-दर्पण को स्वच्छ करता है, भव-दावाग्नि को शांत करता है, कल्याण-चंद्रिका बिखेरता है और आत्मा को बढ़ते आनंद-सागर में स्नान कराता है।",
    reference: "Śrī Śikṣāṣṭaka 1",
  },
  {
    sanskrit:
      "तृणादपि सुनीचेन तरोरपि सहिष्णुना।\nअमानिना मानदेन कीर्तनीयः सदा हरिः॥",
    transliteration:
      "tṛṇād api sunīcena taror api sahiṣṇunā\namāninā mānadena kīrtanīyaḥ sadā hariḥ",
    en: "Humbler than a blade of grass, more tolerant than a tree, expecting no honour yet honouring all — in such a state one should always chant the name of Hari.",
    hi: "तृण से भी अधिक विनम्र, वृक्ष से भी अधिक सहनशील बनकर, स्वयं मान की इच्छा न रखते हुए और दूसरों को मान देते हुए सदैव हरि-नाम का कीर्तन करना चाहिए।",
    reference: "Śrī Śikṣāṣṭaka 3",
  },
  {
    sanskrit:
      "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥",
    transliteration:
      "yadā yadā hi dharmasya glānir bhavati bhārata\nabhyutthānam adharmasya tadātmānaṁ sṛjāmy aham",
    en: "Whenever dharma declines and adharma rises, O Bhārata, at that time I descend Myself.",
    hi: "हे भारत! जब-जब धर्म की हानि और अधर्म की वृद्धि होती है, तब-तब मैं स्वयं प्रकट होता हूँ।",
    reference: "Bhagavad-gītā 4.7",
  },
  {
    sanskrit:
      "बहूनां जन्मनामन्ते ज्ञानवान्मां प्रपद्यते।\nवासुदेवः सर्वमिति स महात्मा सुदुर्लभः॥",
    transliteration:
      "bahūnāṁ janmanām ante jñānavān māṁ prapadyate\nvāsudevaḥ sarvam iti sa mahātmā su-durlabhaḥ",
    en: "After many births the wise one surrenders to Me, knowing 'Vāsudeva is everything.' Such a great soul is very rare.",
    hi: "अनेक जन्मों के अंत में ज्ञानी पुरुष 'वासुदेव ही सब कुछ है' — ऐसा जानकर मेरी शरण में आता है। ऐसा महात्मा अत्यंत दुर्लभ है।",
    reference: "Bhagavad-gītā 7.19",
  },
  {
    sanskrit:
      "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    transliteration:
      "karmaṇy evādhikāras te mā phaleṣu kadācana\nmā karma-phala-hetur bhūr mā te saṅgo 'stv akarmaṇi",
    en: "You have a right to your work, never to its fruits. Let not the fruits be your motive, nor let attachment bind you to inaction.",
    hi: "तुम्हारा अधिकार केवल कर्म में है, फल में कभी नहीं। कर्मफल के हेतु मत बनो, और न ही अकर्म में तुम्हारी आसक्ति हो।",
    reference: "Bhagavad-gītā 2.47",
  },
  {
    sanskrit:
      "गोवर्धनधरं वन्दे गोपालं गोपरूपिणम्।\nगोकुलोत्सवमीशानं गोविन्दं गोपिकाप्रियम्॥",
    transliteration:
      "govardhana-dharaṁ vande gopālaṁ gopa-rūpiṇam\ngokulotsavam īśānaṁ govindaṁ gopikā-priyam",
    en: "I offer praise to Gopāla, the lifter of Govardhana, appearing as a cowherd — the festival of Gokula, the Supreme Govinda, beloved of the gopīs.",
    hi: "मैं गोवर्धनधारी गोपाल की वंदना करता हूँ, जो ग्वाल-रूप में प्रकट हैं — गोकुल के उत्सव, परमेश्वर गोविंद, गोपियों के प्रिय।",
    reference: "Nāradīya Purāṇa",
  },
  {
    sanskrit:
      "दामोदराय नभसि तुलायां लोलया सह।\nप्रदीपं ते प्रयच्छामि नमोऽनन्ताय वेधसे॥",
    transliteration:
      "dāmodarāya nabhasi tulāyāṁ lolayā saha\npradīpaṁ te prayacchāmi namo 'nantāya vedhase",
    en: "In Kārtika I offer this lamp in the sky to Lord Dāmodara, who is together with Rādhā; obeisance to the unlimited creator, Ananta.",
    hi: "कार्तिक मास में मैं आकाश में यह दीप श्री दामोदर को अर्पित करता हूँ, जो राधा-सहित हैं; उस अनंत विधाता को नमस्कार।",
    reference: "Śrī Hari-bhakti-vilāsa",
  },
];

// ------------------------------------------------------------------
//  Kīrtana of the Day
// ------------------------------------------------------------------
export interface Kirtan {
  title: string;
  titleHi: string;
  tradition: string;
  traditionHi: string;
  lines: string[];
  meaning: string;
  meaningHi: string;
  audioSrc?: string;
}

export const KIRTANS: readonly Kirtan[] = [
  {
    title: "Hare Kṛṣṇa Mahā-mantra",
    titleHi: "हरे कृष्ण महामंत्र",
    tradition: "The yuga-dharma of this age",
    traditionHi: "इस युग का युग-धर्म",
    lines: [
      "Hare Kṛṣṇa Hare Kṛṣṇa Kṛṣṇa Kṛṣṇa Hare Hare",
      "Hare Rāma Hare Rāma Rāma Rāma Hare Hare",
    ],
    meaning:
      "The great chant for deliverance — calling upon the Lord and His pleasure potency to be engaged in loving service.",
    meaningHi:
      "मुक्ति का महामंत्र — भगवान और उनकी आह्लादिनी शक्ति को प्रेममयी सेवा में पुकारना।",
    audioSrc: "/audio/mahamantra-bb-tirtha-gurudeva.mp3",
  },
  {
    title: "Jaya Rādhā-Mādhava",
    titleHi: "जय राधा-माधव",
    tradition: "Śrīla Bhaktivinoda Ṭhākura",
    traditionHi: "श्रील भक्तिविनोद ठाकुर",
    lines: [
      "(jaya) rādhā-mādhava (jaya) kuñja-bihārī",
      "gopī-jana-vallabha giri-vara-dhārī",
    ],
    meaning:
      "Kṛṣṇa is the lover of Rādhā, He sports in the groves of Vraja, is dear to the gopīs and lifts great Govardhana Hill.",
    meaningHi:
      "कृष्ण राधा के प्रियतम हैं, वे व्रज के कुंजों में विहार करते हैं, गोपियों के प्रिय हैं और गोवर्धन-गिरि को धारण करते हैं।",
  },
  {
    title: "Śrī Gaura-ārati",
    titleHi: "श्री गौर-आरती",
    tradition: "Śrīla Bhaktivinoda Ṭhākura",
    traditionHi: "श्रील भक्तिविनोद ठाकुर",
    lines: [
      "(kiba) jaya jaya gorācāṅder āratiko śobhā",
      "jāhnavī-taṭa-vane jaga-mana-lobhā",
    ],
    meaning:
      "All glories to the beautiful ārati of Lord Gaurāṅga, held in a grove on the banks of the Gaṅgā, enchanting the minds of all the world.",
    meaningHi:
      "श्री गौरांग की मनोहर आरती की जय हो, जो गंगा-तट के वन में होती है और समस्त जगत के मन को मोह लेती है।",
  },
  {
    title: "Śrī Guru-vandanā",
    titleHi: "श्री गुरु-वंदना",
    tradition: "Śrīla Narottama dāsa Ṭhākura",
    traditionHi: "श्रील नरोत्तम दास ठाकुर",
    lines: [
      "śrī-guru-caraṇa-padma, kevala-bhakati-sadma",
      "bando mui sāvadhāna mate",
    ],
    meaning:
      "The lotus feet of Śrī Guru are the sole abode of pure devotion; with great care I offer my worship unto them.",
    meaningHi:
      "श्री गुरु के चरण-कमल शुद्ध भक्ति के एकमात्र धाम हैं; मैं सावधानीपूर्वक उनकी वंदना करता हूँ।",
  },
  {
    title: "Hari Haraye Namaḥ",
    titleHi: "हरि हरये नमः",
    tradition: "Nāma-saṅkīrtana",
    traditionHi: "नाम-संकीर्तन",
    lines: [
      "hari haraye namaḥ kṛṣṇa yādavāya namaḥ",
      "yādavāya mādhavāya keśavāya namaḥ",
    ],
    meaning:
      "Obeisance again and again to Hari, Kṛṣṇa, Yādava, Mādhava and Keśava — a sweet, simple saṅkīrtana of the holy names.",
    meaningHi:
      "हरि, कृष्ण, यादव, माधव और केशव को बारंबार नमस्कार — दिव्य नामों का मधुर, सरल संकीर्तन।",
  },
  {
    title: "Śrī Pañca-tattva Mantra",
    titleHi: "श्री पंच-तत्त्व मंत्र",
    tradition: "Invoking Gaura and His associates",
    traditionHi: "गौर एवं उनके पार्षदों का आवाहन",
    lines: [
      "(jaya) śrī-kṛṣṇa-caitanya prabhu nityānanda",
      "śrī-advaita gadādhara śrīvāsādi-gaura-bhakta-vṛnda",
    ],
    meaning:
      "Glories to Śrī Caitanya Mahāprabhu, Nityānanda Prabhu, Advaita Ācārya, Gadādhara, Śrīvāsa and all the devotees of Gaura.",
    meaningHi:
      "श्री चैतन्य महाप्रभु, नित्यानंद प्रभु, अद्वैत आचार्य, गदाधर, श्रीवास एवं समस्त गौर-भक्तों की जय हो।",
  },
];

// ------------------------------------------------------------------
//  Aarti schedule (temple time / IST).
//
//  These times used to be declared here AND in lib/live-darshan.ts AND
//  printed as literal strings in two components — and the four copies
//  disagreed (18:30 here vs 19:30 everywhere else), so the countdown
//  could tick toward 6:30 PM under a label reading 7:30 PM. The schedule
//  now lives in lib/temple.ts and this is a re-export for compatibility.
// ------------------------------------------------------------------
export type Aarti = AaratiTime;

export const AARTIS: readonly Aarti[] = AARATI_TIMES;

export interface NextAarti {
  aarti: Aarti;
  live: boolean;
  /** Seconds until the next aarti begins (0 while live). */
  secondsUntilStart: number;
  /** Seconds until the current live window ends (0 when not live). */
  secondsUntilEnd: number;
}

/** Resolve the aarti happening now, or the next one coming up, from an IST moment. */
export function getNextAarti(moment: IstMoment): NextAarti {
  const nowSeconds = moment.secondsSinceMidnight;

  for (const aarti of AARTIS) {
    const start = aarti.minutes * 60;
    const end = start + aarti.durationMinutes * 60;
    if (nowSeconds >= start && nowSeconds < end) {
      const isLive = aarti.isLiveBroadcast !== false;
      return {
        aarti,
        live: isLive,
        secondsUntilStart: 0,
        secondsUntilEnd: isLive ? end - nowSeconds : 0,
      };
    }
  }

  const laterToday = AARTIS.map((aarti) => ({ aarti, start: aarti.minutes * 60 }))
    .filter((entry) => entry.start > nowSeconds)
    .sort((a, b) => a.start - b.start);

  if (laterToday.length > 0) {
    const next = laterToday[0];
    return {
      aarti: next.aarti,
      live: false,
      secondsUntilStart: next.start - nowSeconds,
      secondsUntilEnd: 0,
    };
  }

  const firstTomorrow = [...AARTIS].sort((a, b) => a.minutes - b.minutes)[0];
  return {
    aarti: firstTomorrow,
    live: false,
    secondsUntilStart: 86_400 - nowSeconds + firstTomorrow.minutes * 60,
    secondsUntilEnd: 0,
  };
}
