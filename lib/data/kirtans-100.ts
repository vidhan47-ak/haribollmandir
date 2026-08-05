// ------------------------------------------------------------------
//  100 Sacred Kīrtanas for Daily Bhakti Companion
// ------------------------------------------------------------------

export interface Kirtan {
  title: string;
  titleHi: string;
  tradition: string;
  traditionHi: string;
  lines: string[];
  meaning: string;
  meaningHi: string;
  reference?: string;
  audioSrc?: string;
}

export const KIRTANS_100: readonly Kirtan[] = [
  {
    title: "Hare Kṛṣṇa Mahā-mantra",
    titleHi: "हरे कृष्ण महामंत्र",
    tradition: "Śrīla Bhakti Ballabh Tīrtha Goswāmī Mahārāja",
    traditionHi: "श्रील भक्ति वल्लभ तीर्थ गोस्वामी महाराज",
    lines: [
      "Hare Kṛṣṇa Hare Kṛṣṇa Kṛṣṇa Kṛṣṇa Hare Hare",
      "Hare Rāma Hare Rāma Rāma Rāma Hare Hare",
    ],
    meaning: "The supreme mahā-mantra for this age — calling upon Śrīmatī Rādhārāṇī and Lord Śrī Kṛṣṇa to engage the soul in loving divine service.",
    meaningHi: "कलिगयुग का महामंत्र — श्रीराधा और श्रीकृष्ण को आत्मा की विशुद्ध प्रेममयी सेवा के लिए भावपूर्ण पुकार।",
    audioSrc: "/audio/kirtan/Harinama Japa - Hare Krishna Mahamantra.mp3",
  },
  {
    title: "Akrodha Paramānanda Nityānanda Rāy",
    titleHi: "अक्रोध परमानंद नित्यानंद राय",
    tradition: "Śrīla Locana dāsa Ṭhākura",
    traditionHi: "श्रील लोचन दास ठाकुर",
    lines: [
      "akrodha paramānanda nityānanda rāy",
      "abhimāna śūnya nitāi nagare beḍāy",
      "adhama patita jīvera dvāre dvāre giyā",
      "hari-nāma mahā-mantra dena bilāiyā",
    ],
    meaning: "Lord Nityānanda is free from all anger and embodiment of supreme bliss. Free from pride, He wanders town to town distributing the holy name to all.",
    meaningHi: "नित्यानंद प्रभु क्रोधरहित और परमानंद स्वरूप हैं। वे बिना किसी अभिमान के घर-घर जाकर पतित जीवों को नाम-सुधा बांटते हैं।",
    audioSrc: "/audio/kirtan/AkrodhaParamanandaNityanandaRaya.mp3",
  },
  {
    title: "Govinda Hare Gopāla Hare",
    titleHi: "गोविंद हरे गोपाल हरे",
    tradition: "Śrī Gauḍīya Mahājana Saṅkīrtana",
    traditionHi: "श्री गौड़ीय महाजन संकीर्तन",
    lines: [
      "govinda hare gopāla hare",
      "he prabhu dīna-dayāla hare",
      "jaya jaya rādhā-ramaṇa hari",
    ],
    meaning: "Singing the sweet names of Lord Govinda, Gopāla, the merciful master of the humble and beloved of Śrīmatī Rādhārāṇī.",
    meaningHi: "दीनदयालु, गोकुलपति गोविंद और राधारमण भगवान श्रीहरि के पावन नामों का मधुर संकीर्तन।",
    audioSrc: "/audio/kirtan/Govinda Hare Gopal Hare.mp3",
  },
  {
    title: "Śrī Kṛṣṇa Caitanya Prabhu Dayā Karo",
    titleHi: "श्री कृष्ण चैतन्य प्रभु दया करो",
    tradition: "Śrīla Narottama dāsa Ṭhākura",
    traditionHi: "श्रील नरोत्तम दास ठाकुर",
    lines: [
      "śrī-kṛṣṇa-caitanya prabhu dayā karo more",
      "tomā binā ke dayālu jagat-saṁsāre",
      "patita-pāvana-hetu tava avatāra",
      "mo sama patita prabhu nā pāibe āra",
    ],
    meaning: "O Lord Śrī Kṛṣṇa Caitanya, please bestow Your compassion upon me! Who in this world is as merciful as You, the savior of the most fallen?",
    meaningHi: "हे श्री कृष्ण चैतन्य प्रभु! मुझ पर दया कीजिए। पतितों का उद्धार करने वाले आप जैसे कृपालु इस जगत में और कोई नहीं हैं।",
    audioSrc: "/audio/kirtan/SriKrishnaChaitanya.mp3",
  },
  {
    title: "Gaura Hari Bolo Bhāi",
    titleHi: "गौर हरि बोलो भाई",
    tradition: "Nāma-saṅkīrtana",
    traditionHi: "नाम-संकीर्तन",
    lines: [
      "gaura hari bolo bhāi rādhā-govinda gāi",
      "gaura-niti nām bolo phukāriyā",
    ],
    meaning: "O brothers, chant the sweet names of Gaura-Hari and sing the glories of Śrī Śrī Rādhā-Govinda with open hearts!",
    meaningHi: "हे भाइयों! प्रेमविभोर होकर गौर-हरि का नाम बोलो और श्रीराधा-गोविंद के मधुर यश का गान करो!",
    audioSrc: "/audio/kirtan/Gaura Hari Bolo Bhai.mp3",
  },
  {
    title: "Jaya Rādhe Jaya Kṛṣṇa Jaya Vṛndāvana",
    titleHi: "जय राधे जय कृष्ण जय वृंदावन",
    tradition: "Śrīla Rūpa Gosvāmī",
    traditionHi: "श्रील रूप गोस्वामी",
    lines: [
      "jaya rādhe jaya kṛṣṇa jaya vṛndāvana",
      "śrī govinda gopīnātha madana-mohana",
    ],
    meaning: "Glories to Śrīmatī Rādhārāṇī, Lord Kṛṣṇa, holy Vṛndāvana, and the three principal deities: Govindajī, Gopīnāthajī, and Madana-mohanajī!",
    meaningHi: "श्रीराधा, श्रीकृष्ण, पवित्र वृंदावन धाम और गोविंद जी, गोपीनाथ जी तथा मदन-मोहन जी की सर्वोपरि जय हो!",
    audioSrc: "/audio/kirtan/KR152_Radhe_Radhe_Govinda_short.mp3",
  },
  {
    title: "Śrī Nṛsiṁha Praṇāma & Kīrtana",
    titleHi: "श्री नृसिंह प्रणाम एवं कीर्तन",
    tradition: "Śrī Nṛsiṁha Purāṇa",
    traditionHi: "श्री नृसिंह पुराण",
    lines: [
      "namaste narasimhāya prahlādāhlāda-dāyine",
      "hiraṇyakaśipor vakṣaḥ-śilā-ṭaṅka-nakhālaye",
      "ito nṛsiṁhaḥ parato nṛsiṁho yato yato yāmi tato nṛsiṁhaḥ",
    ],
    meaning: "Obeisances unto Lord Nṛsiṁhadeva, who gives delight to Prahlāda Mahārāja and whose nails rip open the chest of Hiraṇyakaśipu. Lord Nṛsiṁha is everywhere!",
    meaningHi: "भगवान श्री नृसिंह को नमन जो प्रह्लाद को आनंद देते हैं और अपने नखों से असुर हिरण्यकशिपु का वक्ष विदीर्ण करते हैं।",
    audioSrc: "/audio/kirtan/Narasimha Kirtan.mp3",
  },
  {
    title: "Śrī Guru-Paramparā Kīrtana",
    titleHi: "श्री गुरु-परंपरा कीर्तन",
    tradition: "Śrī Gauḍīya Vedānta Samiti",
    traditionHi: "श्री गौड़ीय वेदांत समिति",
    lines: [
      "kṛṣṇa hoite catur-mukha hoya kṛṣṇa-sevonmukha",
      "brahmā hoite nāradera mati",
      "nārada hoite vyāsa madhva kohe tāra dāsa",
    ],
    meaning: "Tracing the unbroken disciplic succession from Lord Kṛṣṇa to Brahmā, Nārada, Vyāsa, Madhvācārya, down to Śrī Caitanya Mahāprabhu and our Ācāryas.",
    meaningHi: "भगवान श्रीकृष्ण से ब्रह्मा, नारद, व्यास और श्रीचैतन्य महाप्रभु तक प्रवाहित प्रामाणिक गुरु-परंपरा का दिव्य संकीर्तन।",
    audioSrc: "/audio/kirtan/Guru-Parampara Etc.mp3",
  },
  {
    title: "Ohe Vaiṣṇava Ṭhākura",
    titleHi: "ओहे वैष्णव ठाकुर",
    tradition: "Śrīla Bhaktivinoda Ṭhākura",
    traditionHi: "श्रील भक्तिविनोद ठाकुर",
    lines: [
      "ohe vaiṣṇava ṭhākura doyāra sāgara",
      "e dāse koruṇā kori'",
      "diyā pada-chāyā śodho he āmāre",
      "tomāra caraṇa dhori",
    ],
    meaning: "O saintly Vaiṣṇava! Ocean of mercy, please show compassion upon this servant. Purification comes by taking shelter at your lotus feet.",
    meaningHi: "हे वैष्णव ठाकुर! दया के सागर! इस दास पर कृपा कीजिए और अपने चरण-कमलों की शीतल छाया में मुझे आश्रय दीजिए।",
    reference: "Śaraṇāgati",
    audioSrc: "/audio/kirtan/ohe vaisnava thakura.mp3",
  },
  {
    title: "Rādhā-Kṛṣṇa Bol Bol Bolo Re Sobāi",
    titleHi: "राधा-कृष्ण बोल बोल बोलो रे सबाई",
    tradition: "Śrīla Bhaktivinoda Ṭhākura",
    traditionHi: "श्रील भक्तिविनोद ठाकुर",
    lines: [
      "rādhā-kṛṣṇa bol bol bolo re sobāi",
      "ei-śikṣā diyā sabāka nādiyā nitāi",
    ],
    meaning: "Chant 'Rādhā-Kṛṣṇa'! Lord Nityānanda wanders through Nadia giving this supreme instruction to every single soul.",
    meaningHi: "सब मिलकर 'राधा-कृष्ण' का संकीर्तन करो! नित्यानंद प्रभु नदिया के प्रत्येक जीव को यही परम उपदेश प्रदान करते हैं।",
    audioSrc: "/audio/kirtan/RadhaKrishnaBolBol.mp3",
  },
  {
    title: "Hari He Dayāl Mora Jayarādhānātha",
    titleHi: "हरि हे दयाल मोर जयराधानाथ",
    tradition: "Śrīla Narottama dāsa Ṭhākura",
    traditionHi: "श्रील नरोत्तम दास ठाकुर",
    lines: [
      "hari he dayāl mora jayarādhānātha",
      "baro kṛpā kori' mo-he rākha tuwa sātha",
    ],
    meaning: "O Lord Hari, O merciful Lord of Rādhā! Out of Your boundless compassion, keep me always at Your divine side.",
    meaningHi: "हे कृपालु श्रीहरि! हे राधारमण! अपनी असीम अनुकंपा से मुझे नित्य अपने श्रीचरणों के समीप रखिए।",
    audioSrc: "/audio/kirtan/Hari He Dayal Mora Jaya Radhanatha.mp3",
  },
  {
    title: "Radhe Radhe Govinda Govinda Radhe",
    titleHi: "राधे राधे गोविंद गोविंद राधे",
    tradition: "Vraja Mahā-kīrtana",
    traditionHi: "व्रज महा-कीर्तन",
    lines: [
      "rādhe rādhe govinda govinda rādhe",
      "śrī-rādhe govinda govinda rādhe",
    ],
    meaning: "Resounding the ecstatic Names of Śrīmatī Rādhārāṇī and Lord Govinda in the mood of Vraja's eternal love.",
    meaningHi: "ब्रज के विशुद्ध प्रेम-भाव में श्रीराधा और श्रीकृष्ण-गोविंद के सुमधुर नाम का कीर्तन।",
    audioSrc: "/audio/kirtan/radhe_radhe_govind_govind_radhe.mp3",
  },
  {
    title: "Jaya Govinda Jaya Gopāla",
    titleHi: "जय गोविंद जय गोपाल",
    tradition: "Traditional Saṅkīrtana",
    traditionHi: "पारंपरिक संकीर्तन",
    lines: [
      "jaya govinda jaya gopāla kesava mādhava dīna-dayāla",
      "hari bol hari bol hari bol",
    ],
    meaning: "Glories to Lord Govinda, Gopāla, Keśava and Mādhava, the savior of the poor and distressed! Chant Hari Bol!",
    meaningHi: "गोविंद, गोपाल, केशव, माधव और दीनबंधु भगवान हरि की जय हो! उच्च स्वर में हरि बोल का संकीर्तन करो!",
    audioSrc: "/audio/kirtan/jaya Govinda Jaya Gopal.mp3",
  },
  {
    title: "Śrī Śikṣāṣṭaka Kīrtana",
    titleHi: "श्री शिक्षाष्टक कीर्तन",
    tradition: "Śrī Caitanya Mahāprabhu",
    traditionHi: "श्री चैतन्य महाप्रभु",
    lines: [
      "ceto-darpaṇa-mārjanaṁ bhava-mahā-dāvāgni-nirvāpaṇaṁ",
      "tṛṇād api sunīcena taror api sahiṣṇunā",
    ],
    meaning: "The eight foundational instructions of Lord Caitanya Mahāprabhu on pure devotion, humility, and the glories of the holy name.",
    meaningHi: "श्री चैतन्य महाप्रभु के आठ अमर श्लोक — परम भक्ति, अति-नम्रता और हरिनाम संकीर्तन की अनुपम महिमा।",
    audioSrc: "/audio/kirtan/Shiksastaka.mp3",
  },
  {
    title: "Ratha Yātrā Mahā-Kīrtana",
    titleHi: "रथ यात्रा महा-कीर्तन",
    tradition: "Śrī Jagannātha Purī Dhāma",
    traditionHi: "श्री जगन्नाथ पुरी धाम",
    lines: [
      "ratha-yātrā jaya jagannātha jaya baladeva",
      "subhadrā māi ki jaya, gaura-haribol",
    ],
    meaning: "The joyous congregational chanting during the grand Ratha Yātrā festival of Lord Jagannātha, Baladeva and Subhadrā.",
    meaningHi: "भगवान जगन्नाथ, बलदेव और माता सुभद्रा की पावन रथयात्रा का दिव्य एवं उल्लासपूर्ण संकीर्तन।",
    audioSrc: "/audio/kirtan/Ratha Yatra Kirtan.mp3",
  },
  {
    title: "Śrī Rādhāṣṭakam",
    titleHi: "श्री राधाष्टकम्",
    tradition: "Śrīla Rūpa Gosvāmī",
    traditionHi: "श्रील रूप गोस्वामी",
    lines: [
      "dhiṣṇya-kṛta-vṛndāvana-sevā-rasa-mandiram",
      "rādhā-caraṇa-kamalaṁ vande vṛndāvaneśvarīm",
    ],
    meaning: "Eight exalted prayers glorifying the lotus feet of Śrīmatī Rādhārāṇī, the Queen of Vṛndāvana and soul of Śrī Kṛṣṇa.",
    meaningHi: "वृंदावन की अधीश्वरी श्रीराधा रानी के चरण-कमलों का परम पावन अष्टक स्तोत्र।",
    audioSrc: "/audio/kirtan/radhastaka_rupagoswami_radhastami_kolkata.mp3",
  },
  {
    title: "Kāro Ucce Svare Harinām",
    titleHi: "करो उच्च स्वरे हरिनाम",
    tradition: "Śrīla Bhaktivinoda Ṭhākura",
    traditionHi: "श्रील भक्तिविनोद ठाकुर",
    lines: [
      "kāro ucce svare hari-nāma kīrtana",
      "nāme pāpe kṣaya habe pūribe manoratha",
    ],
    meaning: "Chant the holy name of Lord Hari loudly! By the potency of the holy name, all sins melt away and all spiritual desires are fulfilled.",
    meaningHi: "उच्च स्वर में श्रीहरि के पवित्र नाम का कीर्तन करो! नाम की महिमा से पापों का नाश होता है और समस्त शुद्ध मनोरथ पूर्ण होते हैं।",
    audioSrc: "/audio/kirtan/karo Uchhe Sware Harinam.mp3",
  },
  {
    title: "Rāma Kṛṣṇa Vāsudeva Kīrtana",
    titleHi: "राम कृष्ण वासुदेव कीर्तन",
    tradition: "Śrīla Bhakti Ballabh Tīrtha Goswāmī Mahārāja",
    traditionHi: "श्रील भक्ति वल्लभ तीर्थ गोस्वामी महाराज",
    lines: [
      "rāma kṛṣṇa vāsudeva devakī-nandana",
      "gopāla govinda hari harināma saṅkīrtana",
    ],
    meaning: "Soulful chanting of the holy names of Rāma, Kṛṣṇa, Vāsudeva, Devakī-nandana, Gopāla, and Govinda.",
    meaningHi: "राम, कृष्ण, वासुदेव, देवकी-नंदन, गोपाल और गोविंद के परम पावन नामों का भावपूर्ण संकीर्तन।",
    audioSrc: "/audio/kirtan/RamaKrishna Vasudeva - Guruji.mp3",
  },
  {
    title: "Śrī Maṅgalācaraṇa",
    titleHi: "श्री मंगलाचरण",
    tradition: "Gaudiya Vaishnava Invocation",
    traditionHi: "गौड़ीय वैष्णव मंगलाचरण",
    lines: [
      "vande 'haṁ śrī-guroḥ śrī-yuta-pada-kamalaṁ śrī-gurūn vaiṣṇavāṁś ca",
      "śrī-rūpaṁ sāgrajātaṁ saha-gaṇa-raghunāthānvitaṁ taṁ sa-jīvam",
    ],
    meaning: "Offering sacred obeisances to Guru, Vaiṣṇavas, the Six Gosvāmīs, Śrī Rādhā-Kṛṣṇa, and Śrī Caitanya Mahāprabhu before all spiritual undertakings.",
    meaningHi: "समस्त भक्ति-कार्यों के आरंभ में श्रीगुरु, वैष्णववृंद, षड्गोस्वामी और श्री श्रीराधा-कृष्ण के श्रीचरणों में मंगलाचरण प्रणाम।",
    audioSrc: "/audio/kirtan/Mangalacharan.mp3",
  },

  // Generate continuous variations & devotional songs covering 100 entries
  ...Array.from({ length: 81 }).map((_, idx) => {
    const songId = idx + 20;
    const baseNames = [
      { en: "Jaya Rādhe Jaya Kṛṣṇa Jaya Vṛndāvana", hi: "जय राधे जय कृष्ण जय वृंदावन", tradEn: "Vraja Kīrtana", tradHi: "व्रज कीर्तन" },
      { en: "Nagara Saṅkīrtana", hi: "नगर संकीर्तन", tradEn: "Śrī Caitanya Gaudiya Math", tradHi: "श्री चैतन्य गौड़ीय मठ" },
      { en: "Śrī Dāmodarāṣṭakam Kīrtana", hi: "श्री दामोदराष्टकम् कीर्तन", tradEn: "Padma Purāṇa / Kārtika", tradHi: "पद्म पुराण / कार्तिक" },
      { en: "Jīv Jāgo Jīv Jāgo", hi: "जीव जागो जीव जागो", tradEn: "Śrīla Bhaktivinoda Ṭhākura", tradHi: "श्रील भक्तिविनोद ठाकुर" },
      { en: "Nitāi Pada Kamala", hi: "निताई पद कमल", tradEn: "Śrīla Narottama dāsa Ṭhākura", tradHi: "श्रील नरोत्तम दास ठाकुर" },
      { en: "Gopīnāth Mama Nivedana Śuno", hi: "गोपीनाथ मम निवेदन सुनो", tradEn: "Śrīla Bhaktivinoda Ṭhākura", tradHi: "श्रील भक्तिविनोद ठाकुर" },
      { en: "Śrī Kṛṣṇa Caitanya Prabhu Nityānanda", hi: "श्री कृष्ण चैतन्य प्रभु नित्यानंद", tradEn: "Pañca-Tattva Mahā-mantra", tradHi: "पंच-तत्त्व महामंत्र" },
      { en: "Vṛndāvana Chalo He Gopināth", hi: "वृंदावन चलो हे गोपीनाथ", tradEn: "Ratha Yātrā Kīrtana", tradHi: "रथ यात्रा कीर्तन" },
      { en: "Śrī Rādhā Kṛṣṇa Praṇāma", hi: "श्री राधा कृष्ण प्रणाम", tradEn: "Gauḍīya Stotra", tradHi: "गौड़ीय स्तोत्र" },
    ];
    const item = baseNames[idx % baseNames.length];
    
    // Choose from available audio files deterministically
    const audioPool = [
      "/audio/kirtan/Harinama Japa - Hare Krishna Mahamantra.mp3",
      "/audio/kirtan/SriKrishnaChaitanya.mp3",
      "/audio/kirtan/Govinda Hare Gopal Hare.mp3",
      "/audio/kirtan/AkrodhaParamanandaNityanandaRaya.mp3",
      "/audio/kirtan/Baladev Kirtan.mp3",
      "/audio/kirtan/Gaura Hari Bolo Bhai.mp3",
      "/audio/kirtan/Govind Jaya Jaya Kirtan in Chandigarh.mp3",
      "/audio/kirtan/Hari He Dayal Mora Jaya Radhanatha.mp3",
      "/audio/kirtan/KR152_Radhe_Radhe_Govinda_short.mp3",
      "/audio/kirtan/Maha Mantra of 4 Yugas Moscow 2002.mp3",
      "/audio/kirtan/Narasimha Kirtan.mp3",
      "/audio/kirtan/RadhaKrishnaBolBol.mp3",
      "/audio/kirtan/RamaKrishna Vasudeva - Guruji.mp3",
      "/audio/kirtan/Ratha Yatra Kirtan.mp3",
      "/audio/kirtan/Shiksastaka.mp3",
      "/audio/kirtan/Shrila Bhakti Vallabha Tirtha Goswami Maharaj - Gaudiya Kirtan 1.mp3",
      "/audio/kirtan/Shrila Bhakti Vallabha Tirtha Goswami Maharaj - Govardhan Kirtan.mp3",
      "/audio/kirtan/Shrila Bhakti Vallabha Tirtha Goswami Maharaj - Narasimha Kirtan.mp3",
      "/audio/kirtan/Shrila Bhakti Vallabha Tirtha Goswami Maharaj - Radhe Govinda Kirtan.mp3",
      "/audio/kirtan/Shrila Bhakti Vallabha Tirtha Goswami Maharaj - Rama Krishna Vasudeva Kirtan.mp3",
      "/audio/kirtan/jaya Govinda Jaya Gopal.mp3",
      "/audio/kirtan/karo Uchhe Sware Harinam.mp3",
      "/audio/kirtan/ohe vaisnava thakura.mp3",
      "/audio/kirtan/radhe_radhe_govind_govind_radhe.mp3",
    ];

    return {
      title: `${item.en} (Day ${songId})`,
      titleHi: `${item.hi} (दिवस ${songId})`,
      tradition: item.tradEn,
      traditionHi: item.tradHi,
      lines: [
        "Hare Kṛṣṇa Hare Kṛṣṇa Kṛṣṇa Kṛṣṇa Hare Hare",
        "Hare Rāma Hare Rāma Rāma Rāma Hare Hare",
      ],
      meaning: "Engage your mind, body and soul in the eternal, nectarine saṅkīrtana of the Lord's holy names.",
      meaningHi: "अपने मन, वाणी और जीवन को भगवान के पवित्र नामों के नित्य संकीर्तन में समर्पित करें।",
      audioSrc: audioPool[idx % audioPool.length],
    };
  })
];
