import type { Lang } from "@/lib/i18n";

export type SacredEventKind =
  | "ekadashi"
  | "festival"
  | "appearance"
  | "disappearance"
  | "purnima"
  | "amavasya"
  | "vrata"
  | "sankranti";

export type SacredEvent = {
  name: string;
  nameHi: string;
  date: string;
  kind: SacredEventKind;
  note: string;
  noteHi: string;
};

// ------------------------------------------------------------------
//  Śrī Vaiṣṇava calendar — Gaurābda 540 (2026-2027).
//
//  Dates follow the Gauḍīya Vaiṣṇava calendar published by Gaudiya Vedanta
//  Publications (calculated per Śrī Hari-bhakti-vilāsa). Times are temple time
//  (IST, +05:30). This single reviewable list drives both the "Next Sacred Day"
//  countdown and the Daily Bhakti Companion's Vaiṣṇava Calendar card, so the
//  temple can update its observances in one place each year.
// ------------------------------------------------------------------
export const SACRED_EVENTS: SacredEvent[] = [
  {
    name: "Śayana Ekādaśī",
    nameHi: "शयनी एकादशी",
    date: "2026-07-25T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 25 July • Pāraṇa before 10:10 am on 26 July",
    noteHi: "25 जुलाई व्रत • 26 जुलाई सुबह 10:10 से पहले पारण",
  },
  {
    name: "Śrī Guru-pūrṇimā • Vyāsa-pūjā",
    nameHi: "श्री गुरु-पूर्णिमा • व्यास-पूजा",
    date: "2026-07-29T00:00:00+05:30",
    kind: "purnima",
    note: "Cāturmāsya begins • Disappearance of Śrīla Sanātana Gosvāmī",
    noteHi: "चातुर्मास्य आरंभ • श्रील सनातन गोस्वामी तिरोभाव",
  },
  {
    name: "Kāmikā Ekādaśī",
    nameHi: "कामिका एकादशी",
    date: "2026-08-09T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 9 August • Pāraṇa before 06:17 am on 10 August",
    noteHi: "9 अगस्त व्रत • 10 अगस्त सुबह 06:17 से पहले पारण",
  },
  {
    name: "Pavitrā Ekādaśī • Jhulan Utsav",
    nameHi: "पवित्रोपना एकादशी • झूलन उत्सव",
    date: "2026-08-23T00:00:00+05:30",
    kind: "ekadashi",
    note: "Beginning of Śrī Śrī Rādhā-Govinda's Jhulan Utsav • Fast on 23 August",
    noteHi: "श्री श्री राधा-गोविंद की झूलन उत्सव आरंभ • 23 अगस्त व्रत",
  },
  {
    name: "Śrī Baladeva Pūrṇimā",
    nameHi: "श्री बलदेव पूर्णिमा",
    date: "2026-08-28T00:00:00+05:30",
    kind: "festival",
    note: "Appearance of Lord Balarāma • End of Jhulana-yātrā • Rakṣā-bandhana",
    noteHi: "भगवान बलराम प्राकट्य • झूलन-यात्रा समाप्त • रक्षा-बंधन",
  },
  {
    name: "Śrī Kṛṣṇa Janmāṣṭamī",
    nameHi: "श्री कृष्ण जन्माष्टमी",
    date: "2026-09-04T00:00:00+05:30",
    kind: "festival",
    note: "Appearance of Lord Śrī Kṛṣṇa • Full fast till midnight",
    noteHi: "भगवान श्री कृष्ण प्राकट्य • अर्धरात्रि तक पूर्ण उपवास",
  },
  {
    name: "Śrī Nandotsava",
    nameHi: "श्री नंदोत्सव",
    date: "2026-09-05T00:00:00+05:30",
    kind: "festival",
    note: "Appearance of Śrīla A.C. Bhaktivedānta Svāmī Prabhupāda",
    noteHi: "श्रील ए.सी. भक्तिवेदांत स्वामी प्रभुपाद प्राकट्य",
  },
  {
    name: "Annadā Ekādaśī",
    nameHi: "अन्नदा एकादशी",
    date: "2026-09-07T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 7 September • Pāraṇa before 10:10 am on 8 September",
    noteHi: "7 सितंबर व्रत • 8 सितंबर सुबह 10:10 से पहले पारण",
  },
  {
    name: "Śrī Rādhāṣṭamī",
    nameHi: "श्री राधाष्टमी",
    date: "2026-09-19T00:00:00+05:30",
    kind: "festival",
    note: "Appearance of Śrīmatī Rādhārāṇī • No fasting",
    noteHi: "श्रीमती राधारानी प्राकट्य • उपवास नहीं",
  },
  {
    name: "Śrī Vāmana Dvādaśī",
    nameHi: "श्री वामन द्वादशी",
    date: "2026-09-23T00:00:00+05:30",
    kind: "festival",
    note: "Appearance of Lord Vāmanadeva • Appearance of Śrīla Jīva Gosvāmī",
    noteHi: "भगवान वामनदेव प्राकट्य • श्रील जीव गोस्वामी प्राकट्य",
  },
  {
    name: "Appearance of Śrīla Bhaktivinoda Ṭhākura",
    nameHi: "श्रील भक्तिविनोद ठाकुर प्राकट्य",
    date: "2026-09-24T00:00:00+05:30",
    kind: "appearance",
    note: "Pāraṇa before 10:08 am",
    noteHi: "सुबह 10:08 से पहले पारण",
  },
  {
    name: "Disappearance of Śrīla Haridāsa Ṭhākura",
    nameHi: "श्रील हरिदास ठाकुर तिरोभाव",
    date: "2026-09-25T00:00:00+05:30",
    kind: "disappearance",
    note: "Nāmācārya Śrīla Haridāsa Ṭhākura",
    noteHi: "नामाचार्य श्रील हरिदास ठाकुर",
  },
  {
    name: "Śrī Viśvarūpa Mahotsava • Pūrṇimā",
    nameHi: "श्री विश्वरूप महोत्सव • पूर्णिमा",
    date: "2026-09-26T00:00:00+05:30",
    kind: "purnima",
    note: "Third month of Cāturmāsya begins",
    noteHi: "चातुर्मास्य का तीसरा मास आरंभ",
  },
  {
    name: "Indirā Ekādaśī",
    nameHi: "इंदिरा एकादशी",
    date: "2026-10-06T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 6 October • Pāraṇa on 7 October",
    noteHi: "6 अक्टूबर व्रत • 7 अक्टूबर पारण",
  },
  {
    name: "Vijaya-daśamī",
    nameHi: "विजय-दशमी",
    date: "2026-10-21T00:00:00+05:30",
    kind: "festival",
    note: "Lord Śrī Rāmacandra Vijayotsava • Appearance of Śrīla Madhvācārya",
    noteHi: "भगवान श्री रामचंद्र विजयोत्सव • श्रील मध्वाचार्य प्राकट्य",
  },
  {
    name: "Pāpāṅkuśā Ekādaśī",
    nameHi: "पापांकुशा एकादशी",
    date: "2026-10-22T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 22 October • Pāraṇa before 10:05 am on 23 October",
    noteHi: "22 अक्टूबर व्रत • 23 अक्टूबर सुबह 10:05 से पहले पारण",
  },
  {
    name: "Śarada Pūrṇimā",
    nameHi: "शरद पूर्णिमा",
    date: "2026-10-26T00:00:00+05:30",
    kind: "purnima",
    note: "Śāradīya Rāsa-yātrā • Dāmodara / Kārtika / Ūrjā-vrata begins",
    noteHi: "शारदीय रास-यात्रा • दामोदर / कार्तिक / ऊर्जा-व्रत आरंभ",
  },
  {
    name: "Disappearance of Śrīla Narottama dāsa Ṭhākura",
    nameHi: "श्रील नरोत्तम दास ठाकुर तिरोभाव",
    date: "2026-11-01T00:00:00+05:30",
    kind: "disappearance",
    note: "A great ācārya of the Gauḍīya Vaiṣṇava sampradāya",
    noteHi: "गौड़ीय वैष्णव संप्रदाय के महान आचार्य",
  },
  {
    name: "Ramā Ekādaśī",
    nameHi: "रमा एकादशी",
    date: "2026-11-05T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 5 November • Pāraṇa before 10:05 am on 6 November",
    noteHi: "5 नवंबर व्रत • 6 नवंबर सुबह 10:05 से पहले पारण",
  },
  {
    name: "Dīpāvalī",
    nameHi: "दीपावली",
    date: "2026-11-09T00:00:00+05:30",
    kind: "festival",
    note: "Amāvasyā • Offering of ghee lamps in Śrī Viṣṇu temple",
    noteHi: "अमावस्या • श्री विष्णु मंदिर में घी के दीप अर्पण",
  },
  {
    name: "Śrī Govardhana Pūjā • Annakūṭa",
    nameHi: "श्री गोवर्धन पूजा • अन्नकूट",
    date: "2026-11-10T00:00:00+05:30",
    kind: "festival",
    note: "Go-pūjā and Annakūṭa Mahotsava",
    noteHi: "गो-पूजा एवं अन्नकूट महोत्सव",
  },
  {
    name: "Disappearance of Śrīla Prabhupāda",
    nameHi: "श्रील प्रभुपाद तिरोभाव",
    date: "2026-11-13T00:00:00+05:30",
    kind: "disappearance",
    note: "Śrīla A.C. Bhaktivedānta Svāmī Prabhupāda",
    noteHi: "श्रील ए.सी. भक्तिवेदांत स्वामी प्रभुपाद",
  },
  {
    name: "Gopāṣṭamī",
    nameHi: "गोपाष्टमी",
    date: "2026-11-17T00:00:00+05:30",
    kind: "festival",
    note: "Gopāṣṭamī and Goṣṭhāṣṭamī • Go-pūjā & sevā",
    noteHi: "गोपाष्टमी एवं गोष्ठाष्टमी • गो-पूजा एवं सेवा",
  },
  {
    name: "Utthāna Ekādaśī",
    nameHi: "उत्थान एकादशी",
    date: "2026-11-20T00:00:00+05:30",
    kind: "ekadashi",
    note: "Bhīṣma-pañcaka begins • Disapp. of Śrīla Gaura-kiśora dāsa Bābājī",
    noteHi: "भीष्म-पंचक आरंभ • श्रील गौर-किशोर दास बाबाजी तिरोभाव",
  },
  {
    name: "Kārtika Pūrṇimā • Rāsa-yātrā",
    nameHi: "कार्तिक पूर्णिमा • रास-यात्रा",
    date: "2026-11-24T00:00:00+05:30",
    kind: "purnima",
    note: "End of Cāturmāsya, Dāmodara, Kārtika & Ūrjā-vrata",
    noteHi: "चातुर्मास्य, दामोदर, कार्तिक एवं ऊर्जा-व्रत समाप्त",
  },
  {
    name: "Utpannā Ekādaśī",
    nameHi: "उत्पन्ना एकादशी",
    date: "2026-12-04T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 4 December • Pāraṇa on 5 December",
    noteHi: "4 दिसंबर व्रत • 5 दिसंबर पारण",
  },
  {
    name: "Mokṣadā Ekādaśī • Gītā Jayantī",
    nameHi: "मोक्षदा एकादशी • गीता जयंती",
    date: "2026-12-20T00:00:00+05:30",
    kind: "ekadashi",
    note: "Manifestation day of Śrīmad Bhagavad-gītā",
    noteHi: "श्रीमद् भगवद्गीता का प्राकट्य दिवस",
  },
  {
    name: "Disappearance of Śrīla Bhaktisiddhānta Sarasvatī",
    nameHi: "श्रील भक्तिसिद्धांत सरस्वती तिरोभाव",
    date: "2026-12-27T00:00:00+05:30",
    kind: "disappearance",
    note: "Śrīla Bhaktisiddhānta Sarasvatī Ṭhākura Prabhupāda",
    noteHi: "श्रील भक्तिसिद्धांत सरस्वती ठाकुर प्रभुपाद",
  },
  {
    name: "Disappearance of Śrīla Bhaktivedānta Nārāyaṇa Gosvāmī",
    nameHi: "श्रील भक्तिवेदांत नारायण गोस्वामी तिरोभाव",
    date: "2027-01-01T00:00:00+05:30",
    kind: "disappearance",
    note: "Disappearance anniversary of Śrīla Gurudeva",
    noteHi: "श्रील गुरुदेव का तिरोभाव तिथि",
  },
  {
    name: "Saphalā Ekādaśī",
    nameHi: "सफला एकादशी",
    date: "2027-01-03T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 3 January • Pāraṇa on 4 January",
    noteHi: "3 जनवरी व्रत • 4 जनवरी पारण",
  },
  {
    name: "Makara Saṅkrānti",
    nameHi: "मकर संक्रांति",
    date: "2027-01-15T00:00:00+05:30",
    kind: "sankranti",
    note: "The solar month of Māgha begins • Gaṅgā-sāgara Snāna",
    noteHi: "माघ सौर मास आरंभ • गंगा-सागर स्नान",
  },
  {
    name: "Putradā Ekādaśī",
    nameHi: "पुत्रदा एकादशी",
    date: "2027-01-19T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 19 January • Pāraṇa on 20 January",
    noteHi: "19 जनवरी व्रत • 20 जनवरी पारण",
  },
  {
    name: "Ṣaṭ-tilā Ekādaśī",
    nameHi: "षट्तिला एकादशी",
    date: "2027-02-02T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 2 February • Pāraṇa on 3 February",
    noteHi: "2 फरवरी व्रत • 3 फरवरी पारण",
  },
  {
    name: "Vasanta-pañcamī • Sarasvatī Pūjā",
    nameHi: "वसंत-पंचमी • सरस्वती पूजा",
    date: "2027-02-11T00:00:00+05:30",
    kind: "festival",
    note: "Appearance of Śrī Viṣṇupriyā devī and Śrī Puṇḍarīka Vidyānidhi",
    noteHi: "श्री विष्णुप्रिया देवी एवं श्री पुण्डरीक विद्यानिधि प्राकट्य",
  },
  {
    name: "Appearance of Śrī Advaita Ācārya",
    nameHi: "श्री अद्वैत आचार्य प्राकट्य",
    date: "2027-02-13T00:00:00+05:30",
    kind: "appearance",
    note: "Fast till noon • Ekādaśī preparations only",
    noteHi: "दोपहर तक उपवास • केवल एकादशी की तैयारी",
  },
  {
    name: "Bhaimī (Jayā) Ekādaśī",
    nameHi: "भैमी (जया) एकादशी",
    date: "2027-02-17T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 17 February • Pāraṇa on 18 February",
    noteHi: "17 फरवरी व्रत • 18 फरवरी पारण",
  },
  {
    name: "Śrī Nityānanda Trayodaśī",
    nameHi: "श्री नित्यानंद त्रयोदशी",
    date: "2027-02-19T00:00:00+05:30",
    kind: "festival",
    note: "Appearance of Lord Śrī Nityānanda • Fast till noon",
    noteHi: "भगवान श्री नित्यानंद प्राकट्य • दोपहर तक उपवास",
  },
  {
    name: "Māghī Pūrṇimā",
    nameHi: "माघी पूर्णिमा",
    date: "2027-02-20T00:00:00+05:30",
    kind: "purnima",
    note: "Appearance of Śrīla Narottama dāsa Ṭhākura",
    noteHi: "श्रील नरोत्तम दास ठाकुर प्राकट्य",
  },
  {
    name: "Appearance of Śrīla Bhaktisiddhānta Sarasvatī",
    nameHi: "श्रील भक्तिसिद्धांत सरस्वती प्राकट्य",
    date: "2027-02-25T00:00:00+05:30",
    kind: "appearance",
    note: "Śrīla Bhaktisiddhānta Sarasvatī Ṭhākura Prabhupāda",
    noteHi: "श्रील भक्तिसिद्धांत सरस्वती ठाकुर प्रभुपाद",
  },
  {
    name: "Vijayā Ekādaśī",
    nameHi: "विजया एकादशी",
    date: "2027-03-04T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 4 March • Pāraṇa before 10:00 am on 5 March",
    noteHi: "4 मार्च व्रत • 5 मार्च सुबह 10:00 से पहले पारण",
  },
  {
    name: "Śrī Śiva-rātri",
    nameHi: "श्री शिव-रात्रि",
    date: "2027-03-07T00:00:00+05:30",
    kind: "vrata",
    note: "Śrī Śiva-rātri vrata • Ekādaśī preparations only",
    noteHi: "श्री शिव-रात्रि व्रत • केवल एकादशी की तैयारी",
  },
  {
    name: "Āmalakī Ekādaśī",
    nameHi: "आमलकी एकादशी",
    date: "2027-03-18T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 18 March • Pāraṇa before 09:45 am on 19 March",
    noteHi: "18 मार्च व्रत • 19 मार्च सुबह 09:45 से पहले पारण",
  },
  {
    name: "Śrī Gaura-pūrṇimā",
    nameHi: "श्री गौर-पूर्णिमा",
    date: "2027-03-22T00:00:00+05:30",
    kind: "festival",
    note: "Appearance of Śrī Caitanya Mahāprabhu • Fast till moonrise",
    noteHi: "श्री चैतन्य महाप्रभु प्राकट्य • चंद्रोदय तक उपवास",
  },
];

// ------------------------------------------------------------------
//  Vaiṣṇava (Gauḍīya) lunar months — "māsa".
//
//  The Gauḍīya calendar divides the year into twelve lunar months, each
//  governed by a name of the Lord (the Cāturmāsya / Dāmodara ordering). This
//  metadata drives the full Vaiṣṇava Calendar page, which groups the curated
//  observances above by the māsa in which they fall.
// ------------------------------------------------------------------
export type VaishnavaMasa =
  | "vishnu"
  | "madhusudana"
  | "trivikrama"
  | "vamana"
  | "sridhara"
  | "hrsikesha"
  | "padmanabha"
  | "damodara"
  | "kesava"
  | "narayana"
  | "madhava"
  | "govinda";

export type VaishnavaMasaMeta = {
  /** Vaiṣṇava (Viṣṇu-name) month, IAST. */
  name: string;
  nameHi: string;
  /** The corresponding Vedic lunar month. */
  lunar: string;
  lunarHi: string;
  /** The presiding form of the Lord for the month. */
  deity: string;
  deityHi: string;
};

/** The twelve months in Gauḍīya sequence, beginning from Viṣṇu (Caitra). */
export const VAISHNAVA_MASA_ORDER: VaishnavaMasa[] = [
  "vishnu",
  "madhusudana",
  "trivikrama",
  "vamana",
  "sridhara",
  "hrsikesha",
  "padmanabha",
  "damodara",
  "kesava",
  "narayana",
  "madhava",
  "govinda",
];

export const VAISHNAVA_MASA_META: Record<VaishnavaMasa, VaishnavaMasaMeta> = {
  vishnu: { name: "Viṣṇu", nameHi: "विष्णु", lunar: "Caitra", lunarHi: "चैत्र", deity: "Śrī Viṣṇu", deityHi: "श्री विष्णु" },
  madhusudana: { name: "Madhusūdana", nameHi: "मधुसूदन", lunar: "Vaiśākha", lunarHi: "वैशाख", deity: "Śrī Madhusūdana", deityHi: "श्री मधुसूदन" },
  trivikrama: { name: "Trivikrama", nameHi: "त्रिविक्रम", lunar: "Jyeṣṭha", lunarHi: "ज्येष्ठ", deity: "Śrī Trivikrama", deityHi: "श्री त्रिविक्रम" },
  vamana: { name: "Vāmana", nameHi: "वामन", lunar: "Āṣāḍha", lunarHi: "आषाढ़", deity: "Śrī Vāmana", deityHi: "श्री वामन" },
  sridhara: { name: "Śrīdhara", nameHi: "श्रीधर", lunar: "Śrāvaṇa", lunarHi: "श्रावण", deity: "Śrī Śrīdhara", deityHi: "श्री श्रीधर" },
  hrsikesha: { name: "Hṛṣīkeśa", nameHi: "हृषीकेश", lunar: "Bhādra", lunarHi: "भाद्र", deity: "Śrī Hṛṣīkeśa", deityHi: "श्री हृषीकेश" },
  padmanabha: { name: "Padmanābha", nameHi: "पद्मनाभ", lunar: "Āśvina", lunarHi: "आश्विन", deity: "Śrī Padmanābha", deityHi: "श्री पद्मनाभ" },
  damodara: { name: "Dāmodara", nameHi: "दामोदर", lunar: "Kārtika", lunarHi: "कार्तिक", deity: "Śrī Dāmodara", deityHi: "श्री दामोदर" },
  kesava: { name: "Keśava", nameHi: "केशव", lunar: "Mārgaśīrṣa", lunarHi: "मार्गशीर्ष", deity: "Śrī Keśava", deityHi: "श्री केशव" },
  narayana: { name: "Nārāyaṇa", nameHi: "नारायण", lunar: "Pauṣa", lunarHi: "पौष", deity: "Śrī Nārāyaṇa", deityHi: "श्री नारायण" },
  madhava: { name: "Mādhava", nameHi: "माधव", lunar: "Māgha", lunarHi: "माघ", deity: "Śrī Mādhava", deityHi: "श्री माधव" },
  govinda: { name: "Govinda", nameHi: "गोविंद", lunar: "Phālguna", lunarHi: "फाल्गुन", deity: "Śrī Govinda", deityHi: "श्री गोविंद" },
};

// Purnimānta boundaries for the current Gaurābda: each Vaiṣṇava māsa ends on the
// listed Pūrṇimā (inclusive). Derived from the Pūrṇimā / Cāturmāsya anchors in
// SACRED_EVENTS above; the two mid-winter Pūrṇimās (Mārgaśīrṣa, Pauṣa), which
// carry no listed observance, use the published Gauḍīya dates. Dates are the
// IST calendar day (YYYY-MM-DD). Used only to bucket events by month.
type MasaBoundary = { masa: VaishnavaMasa; until: string };

export const MASA_BOUNDARIES: MasaBoundary[] = [
  { masa: "vamana", until: "2026-07-29" },
  { masa: "sridhara", until: "2026-08-28" },
  { masa: "hrsikesha", until: "2026-09-26" },
  { masa: "padmanabha", until: "2026-10-26" },
  { masa: "damodara", until: "2026-11-24" },
  { masa: "kesava", until: "2026-12-24" },
  { masa: "narayana", until: "2027-01-23" },
  { masa: "madhava", until: "2027-02-20" },
  { masa: "govinda", until: "2027-03-22" },
];

/** The Vaiṣṇava māsa an event falls within, by purnimānta reckoning. */
export function masaForDate(iso: string): VaishnavaMasa {
  const day = iso.slice(0, 10); // YYYY-MM-DD (authored in IST, +05:30)
  for (const boundary of MASA_BOUNDARIES) {
    if (day <= boundary.until) return boundary.masa;
  }
  return MASA_BOUNDARIES[MASA_BOUNDARIES.length - 1].masa;
}

/** The Gaurābda (Caitanya era) year label for the current calendar. */
export const GAURABDA_YEAR = 540;

/* ------------------------------------------------------------------ */
/*  End of the calendar's horizon.                                     */
/*                                                                     */
/*  SACRED_EVENTS covers one Gaurābda. Past its last entry, three       */
/*  return-visit surfaces used to go dark with no explanation and no    */
/*  signal to the maintainer: the Daily Bhakti calendar card showed     */
/*  "Preparing…" forever, SacredCountdown returned null, and the        */
/*  sadhana dock's next-event chip simply vanished.                     */
/*                                                                     */
/*  These helpers let each surface say something true instead. When the */
/*  horizon is reached, add next year's observances to SACRED_EVENTS —  */
/*  everything else follows automatically.                             */
/* ------------------------------------------------------------------ */

/** ISO date of the last observance currently in the calendar. */
export const CALENDAR_HORIZON: string =
  SACRED_EVENTS[SACRED_EVENTS.length - 1]?.date ?? "";

/**
 * True once every observance in the calendar has passed, i.e. the data needs
 * extending. Distinguishes "nothing scheduled" from "still loading".
 */
export function isCalendarExhausted(at: Date = new Date()): boolean {
  if (!CALENDAR_HORIZON) return true;
  return new Date(CALENDAR_HORIZON).getTime() < at.getTime();
}

/** The next observance from `at`, or null when the horizon has been passed. */
export function nextSacredEvent(at: Date = new Date()): SacredEvent | null {
  const t = at.getTime();
  return SACRED_EVENTS.find((event) => new Date(event.date).getTime() > t) ?? null;
}

export function getGoogleCalendarUrl(
  event: { name: string; nameHi?: string; date: string },
  lang: Lang,
): string {
  const titleName = lang === "hi" ? (event.nameHi ?? event.name) : event.name;
  const title = encodeURIComponent(`🌸 ${titleName} — Hariboll Mandir`);
  const details = encodeURIComponent(
    "Sacred observances & darshan at Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir (Pratap Bagh, Jalandhar, Punjab).\n\nDetails: https://hariboll-mandir.pages.dev/vaishnava-calendar",
  );
  const location = encodeURIComponent("Hariboll Mandir, Pratap Bagh, Jalandhar, Punjab");
  const cleanDate = event.date.replace(/-/g, "");
  const dates = `${cleanDate}/${cleanDate}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
}
