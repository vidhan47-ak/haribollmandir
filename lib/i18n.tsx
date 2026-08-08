"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  TEMPLE_ADDRESS,
  darshanTimings,
  templeAddressLine,
} from "@/lib/temple";

export type Lang = "en" | "hi";

/* Shared shape so `t.<section>.<key>` is fully typed for both languages. */
export type Dict = {
  nav: {
    home: string;
    daily: string;
    about: string;
    festivals: string;
    heritage: string;
    library: string;
    gallery: string;
    visit: string;
    contact: string;
    brand: string;
    location: string;
    donate: string;
    donateScan: string;
    calendar: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta1: string;
    cta2: string;
    cta3: string;
    scroll: string;
  };
  darshan: {
    eyebrow: string;
    title: string;
    subtitle: string;
    deities: { name: string; text: string }[];
  };
  about: {
    eyebrow: string;
    title: string;
    p1: string;
    p2: string;
    quote: string;
    features: { l1: string; l2: string }[];
  };
  seva: {
    eyebrow: string;
    title: string;
    subtitle: string;
    body: string;
    cta: string;
  };
  festivals: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: { title: string; when: string; blurb: string }[];
  };
  gallery: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: { title: string; caption: string }[];
  };
  visit: {
    eyebrow: string;
    title: string;
    subtitle: string;
    addressName: string;
    address: string;
    timingsLabel: string;
    timings: { label: string; value: string }[];
    getDirections: string;
    contactTemple: string;
    mapPin: string;
    /** Heading above the full list of ways to reach the mandir. */
    reachUsLabel: string;
    aaratiLabel: string;
  };
  footer: {
    brand: string;
    brandSub: string;
    addressName: string;
    address: string;
    explore: string;
    connect: string;
    timingsLabel: string;
    liveLabel: string;
    haribol: string;
    /** Label above the temple email address in the footer. */
    writeToUs: string;
    rights: string;
    made: string;
    links: string[];
  };
  quotes: {
    harinam: { quote: string; subquote: string };
    temple: { quote: string; subquote: string };
    seva: { quote: string; subquote: string };
    festival: { quote: string; subquote: string };
    darshan: { quote: string; subquote: string };
  };
  heritage: {
    heroEyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    blocks: { title: string; paras: string[] }[];
    closing: string;
  };
  /**
   * Grantha Mandir chrome. The library was entirely English — a हिंदी reader
   * navigated ~700 articles through English labels — which broke the brief's
   * requirement of genuine parity on the very surface it names a recurring draw.
   */
  grantha: {
    eyebrow: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchLabel: string;
    clear: string;
    scrollLeft: string;
    scrollRight: string;
    keptClose: string;
    yourShelf: string;
    saved: string;
    continueReading: string;
    resume: string;
    dismiss: string;
    featured: string;
    featuredPatrika: string;
    freshNectar: string;
    recentlyAdded: string;
    theArchive: string;
    collections: string;
    collectionsNote: string;
    theLibrary: string;
    patrikaNote: string;
    booksNote: string;
    openIssue: string;
    openBook: string;
    openCollection: string;
    readNow: string;
    read: string;
    minRead: string;
    treasure: string;
    treasures: string;
    found: string;
    viewAll: string;
    noResults: string;
    noResultsQuery: string;
    noResultsEmpty: string;
    bookmark: string;
    savedLabel: string;
    removeBookmark: string;
    addBookmark: string;
    readingProgress: string;
    minTotal: string;
    contents: string;
    audioVersion: string;
    audioPending: string;
    relatedReading: string;
    continueJourney: string;
    share: string;
    linkCopied: string;
    verseCopied: string;
    stanzaCopied: string;
    copyVerse: string;
    copyStanza: string;
    kirtanMode: string;
    kirtanModeHint: string;
    scriptHint: string;
    previous: string;
    next: string;
    streak: string;
    streakWeek: string;
    streakFortnight: string;
    streakMonth: string;
    day: string;
    days: string;
    patrikaArchive: string;
    collection: string;
    beginReading: string;
    tableOfContents: string;
    originalPdf: string;
    min: string;
  };
};

const TRANSLATIONS: Record<Lang, Dict> = {
  en: {
    nav: {
      home: "Home",
      daily: "Daily Bhakti",
      about: "About Temple",
      festivals: "Festivals",
      heritage: "Gaudiya Heritage",
      library: "Grantha",
      gallery: "Gallery",
      visit: "Visit Us",
      contact: "Contact Temple",
      brand: "Hariboll Mandir",
      location: "Jalandhar, Punjab",
      donate: "Donate",
      donateScan: "Scan to donate",
      calendar: "Calendar",
    },
    hero: {
      title: "Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir",
      subtitle:
        "A sacred home for Harinam, Darshan, Seva and Devotion in Jalandhar.",
      cta1: "View Darshan",
      cta2: "Upcoming Events",
      cta3: "Our Heritage",
      scroll: "Scroll",
    },
    darshan: {
      eyebrow: "Divine Darshans",
      title: "Behold the Lord of the Heart",
      subtitle:
        "Come before the sacred forms worshipped at Hariboll Mandir and receive their loving glance.",
      deities: [
        {
          name: "Sri Chaitanya Mahaprabhu",
          text: "The golden ocean of mercy, who came in Kali-yuga to give Krishna through Harinam.",
        },
        {
          name: "Sri Sri Radha Madhav Ji",
          text: "The heart of the temple, where every darshan becomes shelter and every prayer becomes seva.",
        },
        {
          name: "Śrīmatī Radha Rani",
          text: "The merciful shelter who gently carries our prayers to Krishna.",
        },
      ],
    },
    about: {
      eyebrow: "Our Temple",
      title: "About Hariboll Mandir",
      p1: "Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir, Jalandhar, is a sacred place of devotion, Harinam Sankirtan, seva, festivals and divine darshan.",
      p2: "The temple welcomes devotees to experience the mercy of Mahaprabhu and the loving shelter of Sri Sri Radha Madhav Ji.",
      quote: "A sacred home where darshan, seva and Harinam come together.",
      features: [
        { l1: "Daily Darshan", l2: "& Aarti" },
        { l1: "Harinam", l2: "Sankirtan" },
        { l1: "Seva &", l2: "Prasadam" },
        { l1: "Festivals", l2: "through the year" },
      ],
    },
    seva: {
      eyebrow: "The Heart of Devotion",
      title: "Our Heritage",
      subtitle:
        "The living heritage of Gaudiya Vaishnavism — the path of the Holy Name, loving devotion and selfless service, flowing from Sree Chaitanya Mahaprabhu to our temple today.",
      body: "Discover the sacred lineage, the acharyas and the timeless teachings that carry this tradition of divine love — and how our mandir keeps it alive through darshan, kirtan, festivals and seva.",
      cta: "Explore Our Gaudiya Heritage",
    },
    festivals: {
      eyebrow: "Celebrations",
      title: "Temple Festivals",
      subtitle:
        "Throughout the year, the temple comes alive with color, kirtan, feasting and devotion.",
      items: [
        { title: "Prakat Utsav", when: "Appearance Day", blurb: "The joyful celebration of the deities' divine appearance." },
        { title: "Mango Festival", when: "Summer", blurb: "Sweet mangoes lovingly offered to Sri Sri Radha Madhav." },
        { title: "Ekadashi", when: "Twice a Month", blurb: "A sacred day of fasting and remembrance of Krishna." },
        { title: "Jhulan", when: "Shravan", blurb: "The blissful swing festival of the Divine Couple." },
        { title: "Janmashtami", when: "Bhadra", blurb: "The midnight appearance of Lord Sri Krishna." },
        { title: "Kartik", when: "Month of Lamps", blurb: "Offering lamps to please Sri Damodar through Kartik." },
      ],
    },
    gallery: {
      eyebrow: "Darshan Gallery",
      title: "A Journey Through Darshan",
      subtitle:
        "Move through the sacred moments of the temple — each darshan a shelter for the heart.",
      items: [
        { title: "Sri Sri Radha Madhav Ji", caption: "The heart of the temple, where every darshan becomes shelter." },
        { title: "Sri Chaitanya Mahaprabhu", caption: "The golden ocean of mercy, who gives Krishna through Harinam." },
        { title: "Śrīmatī Radha Rani", caption: "The merciful shelter who carries our prayers to Krishna." },
        { title: "Lotus Feet", caption: "Where the restless heart finally finds peace." },
        { title: "Festival Darshan", caption: "Moments of seva, celebration, and divine grace." },
        { title: "Mango Festival", caption: "A sweet offering of joy, color, and loving devotion." },
        { title: "Ekadashi", caption: "A day of simplicity, surrender, and inner remembrance." },
        { title: "Kirtan & Seva", caption: "Where devotion becomes movement, melody, and service." },
      ],
    },
    visit: {
      eyebrow: "Come, Take Shelter",
      title: "Visit Hariboll Mandir",
      subtitle:
        "Devotees are warmly welcomed for darshan, kirtan and prasadam. We look forward to serving you.",
      addressName: TEMPLE_ADDRESS.name,
      // Derived from lib/temple.ts so the address and timings are stated once.
      address: templeAddressLine("en"),
      timingsLabel: "Darshan Timings",
      timings: darshanTimings("en"),
      getDirections: "Get Directions",
      contactTemple: "Contact Temple",
      mapPin: "Pratap Bagh, Jalandhar",
      reachUsLabel: "Reach the Mandir",
      aaratiLabel: "Daily Ārati",
    },
    footer: {
      brand: "Hariboll Mandir",
      brandSub: "Jalandhar",
      addressName: TEMPLE_ADDRESS.name,
      address: templeAddressLine("en"),
      explore: "Explore",
      connect: "Connect",
      timingsLabel: "Darshan Timings",
      liveLabel: "Live Darshan",
      haribol: "Haribol!",
      writeToUs: "Write to us",
      rights:
        "Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir, Jalandhar.",
      made: "Made with devotion · Hare Krishna",
      links: ["Darshan", "Daily Bhakti", "About Temple", "Our Heritage", "Festivals", "Gaudiya Heritage", "Grantha Mandir", "Gallery", "Visit Us"],
    },
    quotes: {
      harinam: {
        quote: "The Holy Name is the sweetest gift of this age — chant it, and the heart awakens.",
        subquote: "Sri Chaitanya Mahaprabhu's ocean of mercy.",
      },
      temple: {
        quote: "A temple is not built of stone alone, but of the love that gathers within it.",
        subquote: "Every soul is welcome at the Lord's door.",
      },
      seva: {
        quote: "Seva offered with love turns the smallest act into worship.",
        subquote: "In service, the restless heart finds its shelter.",
      },
      festival: {
        quote: "Every festival is the soul remembering its eternal home.",
        subquote: "Joy, offered before the Lord, only grows.",
      },
      darshan: {
        quote: "Their darshan does not change the world around us; it changes the world within us.",
        subquote: "Mahaprabhu's mercy leads us to Radha-Madhav.",
      },
    },
    heritage: {
      heroEyebrow: "Gaudiya Heritage",
      heroTitle: "Gaudiya Vaishnavism & Our Spiritual Heritage",
      heroSubtitle:
        "A sacred tradition of Harinam, Bhakti, Seva and divine love, flowing from Sree Chaitanya Mahaprabhu to the Gaudiya Vaishnav parampara.",
      blocks: [
        {
          title: "How Gaudiya Vaishnavism Began",
          paras: [
            "Gaudiya Vaishnavism began with the divine appearance and teachings of Sree Chaitanya Mahaprabhu, who revealed the path of pure devotion through Harinam Sankirtan — the congregational chanting of the holy names of the Lord.",
            "Sree Chaitanya Mahaprabhu taught that the highest goal of life is loving devotional service to Sree Sree Radha-Krishna. His message was simple, deep and universal: chant the holy names, serve with humility, associate with devotees, and develop pure love for the Supreme Lord.",
            "From Navadvip and Puri, this movement of divine love spread through the efforts of Mahaprabhu's associates, especially the Six Goswamis of Vrindavan, who preserved and explained the teachings of bhakti through scripture, worship and spiritual practice.",
          ],
        },
        {
          title: "Srila Prabhupad and the Revival of the Gaudiya Mission",
          paras: [
            "In the modern age, Srila Bhaktisiddhanta Saraswati Goswami Prabhupad powerfully revived and organized the preaching mission of Sree Chaitanya Mahaprabhu. He dedicated his life to spreading pure bhakti, Harinam Sankirtan, Vaishnav seva and the teachings of Sree Sree Radha-Krishna.",
            "Srila Prabhupad taught that spiritual life should be practiced with sincerity, discipline, humility and proper understanding of scripture. He emphasized the importance of chanting the holy names, serving Guru and Vaishnavas, studying devotional scriptures and sharing Mahaprabhu's message with society.",
            "Through his fearless preaching, writings and the establishment of the Gaudiya Math mission, he inspired many devotees to dedicate their lives to the service of Sree Guru, Gauranga and Krishna. His vision gave a strong foundation for spreading Gaudiya Vaishnavism in a systematic and powerful way.",
            "Sree Chaitanya Gaudiya Math continues this sacred current of devotion, carrying forward the teachings of Sree Chaitanya Mahaprabhu as presented by Srila Prabhupad and the Gaudiya Vaishnav acharyas.",
          ],
        },
        {
          title: "Param Gurudev Srila Bhakti Dayita Madhav Goswami Maharaj",
          paras: [
            "Srila Bhakti Dayita Madhav Goswami Maharaj, the Founder-Acharya of Sree Chaitanya Gaudiya Math, carried forward the divine mission of Sree Chaitanya Mahaprabhu with deep faith, humility and powerful preaching.",
            "He was a dear disciple of Srila Bhaktisiddhanta Saraswati Goswami Prabhupad and dedicated his life to spreading Harinam Sankirtan, pure bhakti, Vaishnav seva and the teachings of Sree Sree Radha-Krishna.",
            "With great compassion, he travelled and preached the message of Mahaprabhu in different parts of India, inspiring countless souls to follow the path of devotion. He established Sree Chaitanya Gaudiya Math as a spiritual institution for preserving and spreading the pure teachings of the Gaudiya Vaishnav parampara.",
            "For devotees, Srila Bhakti Dayita Madhav Goswami Maharaj is remembered as Param Gurudev — a powerful acharya whose life was fully dedicated to the service of Sree Guru, Gauranga and Krishna.",
          ],
        },
        {
          title: "Gurudev Srila Bhakti Ballabh Tirtha Goswami Maharaj",
          paras: [
            "Srila Bhakti Ballabh Tirtha Goswami Maharaj continued the sacred mission of his Gurudev, Srila Bhakti Dayita Madhav Goswami Maharaj, with great devotion, scholarship and compassion.",
            "As a revered acharya of the Gaudiya Vaishnav tradition, he guided devotees toward sincere spiritual practice, Harinam, Vaishnav seva and surrender to Sree Guru and Krishna. His teachings inspired devotees to live a life centered on humility, devotion, service and remembrance of the Supreme Lord.",
            "He served as the President of Sree Chaitanya Gaudiya Math and helped spread Mahaprabhu's message through hari-katha, kirtan, spiritual guidance and devotional service.",
            "For devotees, Srila Bhakti Ballabh Tirtha Goswami Maharaj is remembered as Gurudev — a merciful spiritual master who carried forward the current of pure bhakti received from the Gaudiya Vaishnav acharyas.",
          ],
        },
        {
          title: "Core Teachings of Gaudiya Vaishnavism",
          paras: [
            "The heart of Gaudiya Vaishnavism is bhakti — loving devotion to Sree Krishna under the shelter of Sreemati Radharani. It teaches that the soul is eternally connected with the Supreme Lord and finds true happiness through devotion, seva and remembrance of the Lord.",
            "The tradition gives special importance to Harinam Sankirtan, temple worship, Vaishnav seva, study of scriptures, festivals, prasadam distribution and a humble life centered around devotion.",
            "Its philosophy is known as Achintya Bheda-Abheda, meaning the soul is simultaneously one with and different from the Supreme Lord in an inconceivable way. This teaching helps devotees understand their eternal relationship with the Lord while remaining humble servants of His divine will.",
          ],
        },
        {
          title: "About Sree Chaitanya Gaudiya Math",
          paras: [
            "Sree Chaitanya Gaudiya Math continues the preaching mission of Sree Chaitanya Mahaprabhu through the line of Gaudiya Vaishnav acharyas.",
            "The Math is dedicated to spreading Harinam, devotional knowledge, deity worship, Vaishnav culture and the teachings of pure bhakti. Through temples, festivals, spiritual discourses, publications and seva activities, it guides devotees toward a life of devotion and surrender.",
            "The mission carries forward the mood of compassion given by Sree Chaitanya Mahaprabhu — to share Krishna-bhakti with everyone, without discrimination, through humility, service and the chanting of the holy names.",
          ],
        },
        {
          title: "Our Mandir's Connection",
          paras: [
            "Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir is a sacred place where this Gaudiya Vaishnav tradition is practiced through daily darshan, kirtan, seva, festivals and spiritual association.",
            "Here, devotees come together to receive the blessings of Sree Guru, Gauranga and Sree Sree Radha Madhav. The temple is not only a place of worship, but also a spiritual home where hearts are purified through Harinam, devotion and service.",
            "Our aim is to preserve and share this divine heritage with future generations, creating a peaceful atmosphere where everyone can connect with bhakti and experience the mercy of Mahaprabhu.",
          ],
        },
      ],
      closing:
        "Gaudiya Vaishnavism is a sacred path of divine love, given by Sree Chaitanya Mahaprabhu and carried forward by the Gaudiya Vaishnav acharyas. Through Harinam, darshan, seva, festivals and spiritual association, Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir continues this beautiful tradition and welcomes everyone to experience the mercy of Sree Guru, Gauranga and Sree Sree Radha Madhav.",
    },
    grantha: {
      eyebrow: "Hariboll Mandir · Sacred Library",
      title: "Grantha Mandir",
      subtitle:
        "A timeless collection of Gaudiya Vaishnava literature, Bhagavat Patrika, sacred books, lectures and devotional wisdom.",
      searchPlaceholder: "Search by title, topic, author or festival...",
      searchLabel: "Search the library",
      clear: "Clear",
      scrollLeft: "Scroll topics left",
      scrollRight: "Scroll topics right",
      keptClose: "Kept Close",
      yourShelf: "Your Shelf",
      saved: "saved",
      continueReading: "Continue Reading",
      resume: "Resume",
      dismiss: "Dismiss",
      featured: "Featured",
      featuredPatrika: "Featured Bhagavat Patrika",
      freshNectar: "Fresh Nectar",
      recentlyAdded: "Recently Added",
      theArchive: "The Archive",
      collections: "Collections",
      collectionsNote:
        "Each volume opens as a living reading experience — never a file.",
      theLibrary: "The Library",
      patrikaNote:
        "Every issue of the Bhagavat Patrika, gathered as a living archive — open one to read each article within.",
      booksNote:
        "The sacred books and songbooks of the tradition — open a volume to read every chapter, bhajan and verse it holds.",
      openIssue: "Open issue",
      openBook: "Open book",
      openCollection: "Open collection",
      readNow: "Read Now",
      read: "Read",
      minRead: "min read",
      treasure: "treasure",
      treasures: "treasures",
      found: "found",
      viewAll: "View all",
      noResults: "No articles found",
      noResultsQuery: "Nothing in the archive matches",
      noResultsEmpty:
        "Nothing here yet. New treasures are added as the archive grows.",
      bookmark: "Bookmark",
      savedLabel: "Saved",
      removeBookmark: "Remove bookmark",
      addBookmark: "Save to bookmarks",
      readingProgress: "Reading Progress",
      minTotal: "min total",
      contents: "Contents",
      audioVersion: "Audio Version",
      audioPending: "Narration for this article is being prepared with care.",
      relatedReading: "Related Reading",
      continueJourney: "Continue the Journey",
      share: "Share",
      linkCopied: "Link copied to clipboard",
      verseCopied: "Verse copied",
      stanzaCopied: "Stanza copied",
      copyVerse: "Copy verse",
      copyStanza: "Copy stanza",
      kirtanMode: "Kirtan mode",
      kirtanModeHint: "Kirtan mode — large, singable lyrics",
      scriptHint: "Switch script — Devanāgarī, both, or romanised",
      previous: "Previous",
      next: "Next",
      streak: "Reading Streak",
      streakWeek: "A week of remembrance",
      streakFortnight: "A fortnight of grace",
      streakMonth: "A month of steady bhakti",
      day: "day",
      days: "days",
      patrikaArchive: "Bhagavat Patrika Archive",
      collection: "Collection",
      beginReading: "Begin Reading",
      tableOfContents: "Table of Contents",
      originalPdf: "Original PDF",
      min: "min",
    },
  },
  hi: {    nav: {
      home: "होम",
      daily: "नित्य भक्ति",
      about: "मंदिर परिचय",
      festivals: "उत्सव",
      heritage: "गौड़ीय विरासत",
      library: "ग्रंथ",
      gallery: "गैलरी",
      visit: "पधारें",
      contact: "संपर्क करें",
      brand: "Hariboll Mandir",
      location: "जालंधर, पंजाब",
      donate: "दान",
      donateScan: "दान हेतु स्कैन करें",
      calendar: "पंचांग",
    },
    hero: {
      title: "श्री चैतन्य महाप्रभु श्री राधा माधव मंदिर",
      subtitle: "जालंधर में हरिनाम, दर्शन, सेवा और भक्ति का पावन धाम।",
      cta1: "दर्शन देखें",
      cta2: "आगामी उत्सव",
      cta3: "हमारी विरासत",
      scroll: "नीचे देखें",
    },
    darshan: {
      eyebrow: "दिव्य दर्शन",
      title: "हृदय के स्वामी के दर्शन करें",
      subtitle:
        "हरिबोल मंदिर में पूजित पावन विग्रहों के समक्ष आइए और उनकी करुणामयी कृपादृष्टि प्राप्त कीजिए।",
      deities: [
        {
          name: "श्री चैतन्य महाप्रभु",
          text: "करुणा के स्वर्णिम सागर, जो कलियुग में हरिनाम के द्वारा कृष्ण-प्रेम बाँटने पधारे।",
        },
        {
          name: "श्री श्री राधा माधव जी",
          text: "मंदिर का हृदय, जहाँ हर दर्शन शरण बन जाता है और हर प्रार्थना सेवा।",
        },
        {
          name: "श्रीमती राधा रानी",
          text: "करुणामयी शरणदात्री, जो हमारी प्रार्थनाओं को कोमलता से कृष्ण तक पहुँचाती हैं।",
        },
      ],
    },
    about: {
      eyebrow: "हमारा मंदिर",
      title: "हरिबोल मंदिर के बारे में",
      p1: "श्री चैतन्य महाप्रभु श्री राधा माधव मंदिर, जालंधर, भक्ति, हरिनाम संकीर्तन, सेवा, उत्सव और दिव्य दर्शन का पावन स्थान है।",
      p2: "यह मंदिर भक्तों का स्वागत करता है कि वे महाप्रभु की कृपा और श्री श्री राधा माधव जी की प्रेममयी शरण का अनुभव करें।",
      quote: "एक पावन धाम, जहाँ दर्शन, सेवा और हरिनाम एक साथ मिलते हैं।",
      features: [
        { l1: "नित्य दर्शन", l2: "एवं आरती" },
        { l1: "हरिनाम", l2: "संकीर्तन" },
        { l1: "सेवा एवं", l2: "प्रसादम्" },
        { l1: "वर्ष भर", l2: "उत्सव" },
      ],
    },
    seva: {
      eyebrow: "भक्ति का हृदय",
      title: "हमारी विरासत",
      subtitle:
        "गौड़ीय वैष्णव धर्म की जीवंत विरासत — हरिनाम, प्रेममयी भक्ति और नि:स्वार्थ सेवा का मार्ग, जो श्री चैतन्य महाप्रभु से होते हुए आज हमारे मंदिर तक प्रवाहित है।",
      body: "उस पावन परंपरा, आचार्यों और कालातीत शिक्षाओं को जानिए जो इस दिव्य प्रेम की धारा को धारण करती हैं — और जानिए कि हमारा मंदिर दर्शन, कीर्तन, उत्सव और सेवा के माध्यम से इसे किस प्रकार जीवंत रखता है।",
      cta: "हमारी गौड़ीय विरासत जानें",
    },
    festivals: {
      eyebrow: "उत्सव",
      title: "मंदिर के उत्सव",
      subtitle:
        "वर्ष भर मंदिर रंग, कीर्तन, भोग और भक्ति से जीवंत रहता है।",
      items: [
        { title: "प्राकट्य उत्सव", when: "प्राकट्य दिवस", blurb: "विग्रहों के दिव्य प्राकट्य का आनंदमय उत्सव।" },
        { title: "आम महोत्सव", when: "ग्रीष्म ऋतु", blurb: "श्री श्री राधा माधव को प्रेमपूर्वक अर्पित मधुर आम।" },
        { title: "एकादशी", when: "मास में दो बार", blurb: "उपवास और कृष्ण-स्मरण का पावन दिन।" },
        { title: "झूलन", when: "श्रावण", blurb: "दिव्य युगल का आनंदमय झूलन उत्सव।" },
        { title: "जन्माष्टमी", when: "भाद्रपद", blurb: "भगवान श्री कृष्ण का मध्यरात्रि प्राकट्य।" },
        { title: "कार्तिक", when: "दीपों का मास", blurb: "कार्तिक मास में श्री दामोदर को दीप अर्पण।" },
      ],
    },
    gallery: {
      eyebrow: "दर्शन गैलरी",
      title: "दर्शन की यात्रा",
      subtitle:
        "मंदिर के पावन क्षणों से होकर गुज़रिए — हर दर्शन हृदय के लिए एक शरण।",
      items: [
        { title: "श्री श्री राधा माधव जी", caption: "मंदिर का हृदय, जहाँ हर दर्शन शरण बन जाता है।" },
        { title: "श्री चैतन्य महाप्रभु", caption: "करुणा के स्वर्णिम सागर, जो हरिनाम के द्वारा कृष्ण देते हैं।" },
        { title: "श्रीमती राधा रानी", caption: "करुणामयी शरणदात्री, जो हमारी प्रार्थनाएँ कृष्ण तक पहुँचाती हैं।" },
        { title: "चरण-कमल", caption: "जहाँ चंचल हृदय को अंततः शांति मिलती है।" },
        { title: "उत्सव दर्शन", caption: "सेवा, उल्लास और दिव्य कृपा के क्षण।" },
        { title: "आम महोत्सव", caption: "आनंद, रंग और प्रेममयी भक्ति का मधुर अर्पण।" },
        { title: "एकादशी", caption: "सरलता, समर्पण और अंतर्मन के स्मरण का दिन।" },
        { title: "कीर्तन एवं सेवा", caption: "जहाँ भक्ति गति, स्वर और सेवा बन जाती है।" },
      ],
    },
    visit: {
      eyebrow: "शरण में आइए",
      title: "हरिबोल मंदिर पधारें",
      subtitle:
        "दर्शन, कीर्तन और प्रसाद के लिए भक्तों का हार्दिक स्वागत है। आपकी सेवा के लिए हम प्रतीक्षारत हैं।",
      addressName: TEMPLE_ADDRESS.nameHi,
      address: templeAddressLine("hi"),
      timingsLabel: "दर्शन समय",
      timings: darshanTimings("hi"),
      getDirections: "रास्ता देखें",
      contactTemple: "मंदिर से संपर्क करें",
      mapPin: "प्रताप बाग, जालंधर",
      reachUsLabel: "मंदिर से संपर्क",
      aaratiLabel: "नित्य आरती",
    },
    footer: {
      brand: "Hariboll Mandir",
      brandSub: "जालंधर",
      addressName: TEMPLE_ADDRESS.nameHi,
      address: templeAddressLine("hi"),
      explore: "अन्वेषण",
      connect: "जुड़ें",
      timingsLabel: "दर्शन समय",
      liveLabel: "लाइव दर्शन",
      haribol: "हरिबोल!",
      writeToUs: "हमें लिखें",
      rights: "श्री चैतन्य महाप्रभु श्री राधा माधव मंदिर, जालंधर।",
      made: "भक्ति भाव से निर्मित · हरे कृष्ण",
      links: ["दर्शन", "नित्य भक्ति", "मंदिर परिचय", "हमारी विरासत", "उत्सव", "गौड़ीय विरासत", "ग्रंथ मंदिर", "गैलरी", "पधारें"],
    },
    quotes: {
      harinam: {
        quote: "हरिनाम इस युग का सबसे मधुर उपहार है — इसका जप कीजिए, और हृदय जाग उठता है।",
        subquote: "श्री चैतन्य महाप्रभु की कृपा का सागर।",
      },
      temple: {
        quote: "मंदिर केवल पत्थरों से नहीं, उसमें एकत्र होने वाले प्रेम से बनता है।",
        subquote: "प्रभु के द्वार पर हर आत्मा का स्वागत है।",
      },
      seva: {
        quote: "प्रेम से की गई सेवा छोटे से छोटे कार्य को भी पूजा बना देती है।",
        subquote: "सेवा में ही चंचल हृदय को शरण मिलती है।",
      },
      festival: {
        quote: "हर उत्सव आत्मा का अपने नित्य धाम को स्मरण करना है।",
        subquote: "प्रभु के समक्ष अर्पित आनंद केवल बढ़ता ही है।",
      },
      darshan: {
        quote: "उनका दर्शन हमारे चारों ओर के संसार को नहीं बदलता; वह हमारे भीतर के संसार को बदल देता है।",
        subquote: "महाप्रभु की कृपा हमें राधा-माधव तक ले जाती है।",
      },
    },
    heritage: {
      heroEyebrow: "गौड़ीय विरासत",
      heroTitle: "गौड़ीय वैष्णव धर्म एवं हमारी आध्यात्मिक विरासत",
      heroSubtitle:
        "हरिनाम, भक्ति, सेवा और दिव्य प्रेम की पावन परंपरा, जो श्री चैतन्य महाप्रभु से होकर गौड़ीय वैष्णव परंपरा तक प्रवाहित है।",
      blocks: [
        {
          title: "गौड़ीय वैष्णव धर्म का आरंभ",
          paras: [
            "गौड़ीय वैष्णव धर्म का आरंभ श्री चैतन्य महाप्रभु के दिव्य प्राकट्य और शिक्षाओं से हुआ, जिन्होंने हरिनाम संकीर्तन — भगवान के पावन नामों के सामूहिक कीर्तन — के द्वारा शुद्ध भक्ति का मार्ग प्रकट किया।",
            "श्री चैतन्य महाप्रभु ने सिखाया कि जीवन का परम लक्ष्य श्री श्री राधा-कृष्ण की प्रेममयी भक्ति-सेवा है। उनका संदेश सरल, गहन और सार्वभौमिक था: पावन नामों का जप करें, विनम्रता से सेवा करें, भक्तों की संगति करें, और परमेश्वर के प्रति शुद्ध प्रेम विकसित करें।",
            "नवद्वीप और पुरी से यह दिव्य प्रेम का आंदोलन महाप्रभु के पार्षदों, विशेषकर वृंदावन के षड् गोस्वामियों के प्रयासों से फैला, जिन्होंने शास्त्र, अर्चन और साधना के माध्यम से भक्ति की शिक्षाओं को संरक्षित एवं व्याख्यायित किया।",
          ],
        },
        {
          title: "श्रील प्रभुपाद एवं गौड़ीय मिशन का पुनरुत्थान",
          paras: [
            "आधुनिक युग में, श्रील भक्तिसिद्धांत सरस्वती गोस्वामी प्रभुपाद ने श्री चैतन्य महाप्रभु के प्रचार-मिशन को सशक्त रूप से पुनर्जीवित और संगठित किया। उन्होंने अपना जीवन शुद्ध भक्ति, हरिनाम संकीर्तन, वैष्णव सेवा और श्री श्री राधा-कृष्ण की शिक्षाओं के प्रचार में समर्पित किया।",
            "श्रील प्रभुपाद ने सिखाया कि आध्यात्मिक जीवन को निष्ठा, अनुशासन, विनम्रता और शास्त्रों के सम्यक ज्ञान के साथ जीना चाहिए। उन्होंने पावन नामों के जप, गुरु एवं वैष्णवों की सेवा, भक्ति-शास्त्रों के अध्ययन और महाप्रभु के संदेश को समाज तक पहुँचाने के महत्व पर बल दिया।",
            "अपने निर्भीक प्रचार, लेखन और गौड़ीय मठ मिशन की स्थापना के द्वारा उन्होंने अनेक भक्तों को श्री गुरु, गौरांग और कृष्ण की सेवा में जीवन समर्पित करने की प्रेरणा दी। उनकी दूरदृष्टि ने गौड़ीय वैष्णव धर्म को व्यवस्थित एवं सशक्त रूप से फैलाने की सुदृढ़ नींव रखी।",
            "श्री चैतन्य गौड़ीय मठ भक्ति की इस पावन धारा को आगे बढ़ाते हुए, श्रील प्रभुपाद और गौड़ीय वैष्णव आचार्यों द्वारा प्रस्तुत श्री चैतन्य महाप्रभु की शिक्षाओं को निरंतर आगे ले जा रहा है।",
          ],
        },
        {
          title: "परम गुरुदेव श्रील भक्ति दयित माधव गोस्वामी महाराज",
          paras: [
            "श्री चैतन्य गौड़ीय मठ के संस्थापक-आचार्य श्रील भक्ति दयित माधव गोस्वामी महाराज ने गहरी श्रद्धा, विनम्रता और सशक्त प्रचार के साथ श्री चैतन्य महाप्रभु के दिव्य मिशन को आगे बढ़ाया।",
            "वे श्रील भक्तिसिद्धांत सरस्वती गोस्वामी प्रभुपाद के प्रिय शिष्य थे और उन्होंने अपना जीवन हरिनाम संकीर्तन, शुद्ध भक्ति, वैष्णव सेवा और श्री श्री राधा-कृष्ण की शिक्षाओं के प्रचार में समर्पित किया।",
            "अत्यंत करुणा के साथ उन्होंने भारत के विभिन्न भागों में यात्रा कर महाप्रभु का संदेश प्रचारित किया और असंख्य आत्माओं को भक्ति के मार्ग पर चलने की प्रेरणा दी। उन्होंने गौड़ीय वैष्णव परंपरा की शुद्ध शिक्षाओं के संरक्षण एवं प्रसार हेतु श्री चैतन्य गौड़ीय मठ की स्थापना की।",
            "भक्तों के लिए श्रील भक्ति दयित माधव गोस्वामी महाराज परम गुरुदेव के रूप में स्मरणीय हैं — एक तेजस्वी आचार्य जिनका जीवन पूर्णतः श्री गुरु, गौरांग और कृष्ण की सेवा को समर्पित रहा।",
          ],
        },
        {
          title: "गुरुदेव श्रील भक्ति वल्लभ तीर्थ गोस्वामी महाराज",
          paras: [
            "श्रील भक्ति वल्लभ तीर्थ गोस्वामी महाराज ने अपने गुरुदेव श्रील भक्ति दयित माधव गोस्वामी महाराज के पावन मिशन को महान भक्ति, विद्वत्ता और करुणा के साथ आगे बढ़ाया।",
            "गौड़ीय वैष्णव परंपरा के आदरणीय आचार्य के रूप में उन्होंने भक्तों को निष्ठापूर्ण साधना, हरिनाम, वैष्णव सेवा तथा श्री गुरु और कृष्ण के प्रति समर्पण की ओर मार्गदर्शन दिया। उनकी शिक्षाओं ने भक्तों को विनम्रता, भक्ति, सेवा और परमेश्वर के स्मरण पर केंद्रित जीवन जीने की प्रेरणा दी।",
            "उन्होंने श्री चैतन्य गौड़ीय मठ के अध्यक्ष के रूप में सेवा की और हरि-कथा, कीर्तन, आध्यात्मिक मार्गदर्शन एवं भक्ति-सेवा के माध्यम से महाप्रभु के संदेश को फैलाने में सहायता की।",
            "भक्तों के लिए श्रील भक्ति वल्लभ तीर्थ गोस्वामी महाराज गुरुदेव के रूप में स्मरणीय हैं — एक करुणामय गुरु, जिन्होंने गौड़ीय वैष्णव आचार्यों से प्राप्त शुद्ध भक्ति की धारा को आगे बढ़ाया।",
          ],
        },
        {
          title: "गौड़ीय वैष्णव धर्म की मूल शिक्षाएँ",
          paras: [
            "गौड़ीय वैष्णव धर्म का हृदय भक्ति है — श्रीमती राधारानी की शरण में श्री कृष्ण के प्रति प्रेममयी भक्ति। यह सिखाता है कि आत्मा परमेश्वर से नित्य रूप से जुड़ी है और भक्ति, सेवा एवं भगवान के स्मरण से ही सच्चा आनंद प्राप्त करती है।",
            "यह परंपरा हरिनाम संकीर्तन, मंदिर-अर्चन, वैष्णव सेवा, शास्त्रों के अध्ययन, उत्सवों, प्रसाद-वितरण और भक्ति पर केंद्रित विनम्र जीवन को विशेष महत्व देती है।",
            "इसका दर्शन अचिन्त्य भेद-अभेद कहलाता है, अर्थात् आत्मा अकल्पनीय रूप से परमेश्वर के साथ एक साथ अभिन्न भी है और भिन्न भी। यह शिक्षा भक्तों को भगवान के साथ अपने नित्य संबंध को समझने में सहायता करती है, और साथ ही वे उनकी दिव्य इच्छा के विनम्र सेवक बने रहते हैं।",
          ],
        },
        {
          title: "श्री चैतन्य गौड़ीय मठ के बारे में",
          paras: [
            "श्री चैतन्य गौड़ीय मठ गौड़ीय वैष्णव आचार्यों की परंपरा के माध्यम से श्री चैतन्य महाप्रभु के प्रचार-मिशन को निरंतर आगे बढ़ाता है।",
            "यह मठ हरिनाम, भक्ति-ज्ञान, विग्रह-अर्चन, वैष्णव संस्कृति और शुद्ध भक्ति की शिक्षाओं के प्रसार को समर्पित है। मंदिरों, उत्सवों, आध्यात्मिक प्रवचनों, प्रकाशनों और सेवा-कार्यों के माध्यम से यह भक्तों को भक्ति और समर्पण के जीवन की ओर मार्गदर्शन देता है।",
            "यह मिशन श्री चैतन्य महाप्रभु द्वारा दिए गए करुणा के भाव को आगे बढ़ाता है — विनम्रता, सेवा और पावन नामों के कीर्तन के माध्यम से, बिना किसी भेदभाव के, सभी के साथ कृष्ण-भक्ति को बाँटना।",
          ],
        },
        {
          title: "हमारे मंदिर का संबंध",
          paras: [
            "श्री चैतन्य महाप्रभु श्री राधा माधव मंदिर एक पावन स्थान है जहाँ इस गौड़ीय वैष्णव परंपरा का पालन नित्य दर्शन, कीर्तन, सेवा, उत्सवों और आध्यात्मिक संगति के माध्यम से किया जाता है।",
            "यहाँ भक्त श्री गुरु, गौरांग और श्री श्री राधा माधव का आशीर्वाद प्राप्त करने के लिए एकत्र होते हैं। यह मंदिर केवल पूजा का स्थान ही नहीं, अपितु एक आध्यात्मिक धाम है जहाँ हरिनाम, भक्ति और सेवा के माध्यम से हृदय पवित्र होते हैं।",
            "हमारा उद्देश्य इस दिव्य विरासत को भावी पीढ़ियों के लिए संरक्षित करना और बाँटना है, एक शांतिपूर्ण वातावरण का निर्माण करना जहाँ हर कोई भक्ति से जुड़ सके और महाप्रभु की कृपा का अनुभव कर सके।",
          ],
        },
      ],
      closing:
        "गौड़ीय वैष्णव धर्म दिव्य प्रेम का एक पावन मार्ग है, जो श्री चैतन्य महाप्रभु द्वारा प्रदान किया गया और गौड़ीय वैष्णव आचार्यों द्वारा आगे बढ़ाया गया। हरिनाम, दर्शन, सेवा, उत्सवों और आध्यात्मिक संगति के माध्यम से श्री चैतन्य महाप्रभु श्री राधा माधव मंदिर इस सुंदर परंपरा को निरंतर आगे बढ़ाता है और सभी का स्वागत करता है कि वे श्री गुरु, गौरांग और श्री श्री राधा माधव की कृपा का अनुभव करें।",
    },
    grantha: {
      eyebrow: "हरिबोल मंदिर · पावन ग्रंथालय",
      title: "ग्रंथ मंदिर",
      subtitle:
        "गौड़ीय वैष्णव साहित्य, भागवत पत्रिका, पावन ग्रंथ, प्रवचन एवं भक्ति-ज्ञान का कालजयी संग्रह।",
      searchPlaceholder: "शीर्षक, विषय, लेखक अथवा उत्सव से खोजें...",
      searchLabel: "ग्रंथालय में खोजें",
      clear: "साफ़ करें",
      scrollLeft: "विषय बाएँ ले जाएँ",
      scrollRight: "विषय दाएँ ले जाएँ",
      keptClose: "सहेजे हुए",
      yourShelf: "आपकी अलमारी",
      saved: "सहेजे",
      continueReading: "पठन जारी रखें",
      resume: "आगे पढ़ें",
      dismiss: "हटाएँ",
      featured: "विशेष",
      featuredPatrika: "विशेष भागवत पत्रिका",
      freshNectar: "नवीन अमृत",
      recentlyAdded: "नवीन प्रविष्टियाँ",
      theArchive: "संग्रह",
      collections: "संकलन",
      collectionsNote:
        "प्रत्येक ग्रंथ एक जीवंत पठन-अनुभव के रूप में खुलता है — कभी फ़ाइल के रूप में नहीं।",
      theLibrary: "ग्रंथालय",
      patrikaNote:
        "भागवत पत्रिका का प्रत्येक अंक, एक जीवंत संग्रह के रूप में — किसी अंक को खोलकर उसके सभी लेख पढ़ें।",
      booksNote:
        "परंपरा के पावन ग्रंथ एवं पदावली — किसी ग्रंथ को खोलकर उसका प्रत्येक अध्याय, भजन एवं श्लोक पढ़ें।",
      openIssue: "अंक खोलें",
      openBook: "ग्रंथ खोलें",
      openCollection: "संकलन खोलें",
      readNow: "अभी पढ़ें",
      read: "पढ़ें",
      minRead: "मिनट पठन",
      treasure: "रत्न",
      treasures: "रत्न",
      found: "प्राप्त",
      viewAll: "सभी देखें",
      noResults: "कोई लेख नहीं मिला",
      noResultsQuery: "संग्रह में इससे मेल खाता कुछ अभी नहीं है:",
      noResultsEmpty:
        "यहाँ अभी कुछ नहीं है। संग्रह के विस्तार के साथ नए रत्न जोड़े जाते रहेंगे।",
      bookmark: "सहेजें",
      savedLabel: "सहेजा गया",
      removeBookmark: "सहेजा हुआ हटाएँ",
      addBookmark: "सहेजें",
      readingProgress: "पठन प्रगति",
      minTotal: "मिनट कुल",
      contents: "अनुक्रमणिका",
      audioVersion: "श्रव्य संस्करण",
      audioPending: "इस लेख का पाठ सादर तैयार किया जा रहा है।",
      relatedReading: "सम्बंधित पठन",
      continueJourney: "यात्रा जारी रखें",
      share: "साझा करें",
      linkCopied: "लिंक कॉपी हो गया",
      verseCopied: "श्लोक कॉपी हुआ",
      stanzaCopied: "पद कॉपी हुआ",
      copyVerse: "श्लोक कॉपी करें",
      copyStanza: "पद कॉपी करें",
      kirtanMode: "कीर्तन मोड",
      kirtanModeHint: "कीर्तन मोड — बड़े, गाने योग्य पद",
      scriptHint: "लिपि बदलें — देवनागरी, दोनों, अथवा रोमन",
      previous: "पूर्व",
      next: "अगला",
      streak: "पठन क्रम",
      streakWeek: "एक सप्ताह का स्मरण",
      streakFortnight: "एक पखवाड़े की कृपा",
      streakMonth: "एक माह की अविरल भक्ति",
      day: "दिन",
      days: "दिन",
      patrikaArchive: "भागवत पत्रिका संग्रह",
      collection: "संकलन",
      beginReading: "पठन आरंभ करें",
      tableOfContents: "अनुक्रमणिका",
      originalPdf: "मूल PDF",
      min: "मिनट",
    },
  },
};
interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: Dict;
}

const LanguageContext = createContext<LangCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("lang");
    if (saved === "hi" || saved === "en") {
      setLangState(saved);
      return;
    }
    // First visit: follow the device language for Hindi readers.
    if (navigator.language?.toLowerCase().startsWith("hi")) setLangState("hi");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem("lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const toggle = () => setLangState((p) => (p === "en" ? "hi" : "en"));

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, toggle, t: TRANSLATIONS[lang] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LangCtx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within <LanguageProvider>");
  return ctx;
}
