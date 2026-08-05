"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { spring } from "@/lib/springs";
import { useLang } from "@/lib/i18n";
import { createPortal } from "react-dom";

export type KirtanaTrack = {
  id: string;
  title: string;
  titleHi: string;
  artist: string;
  artistHi: string;
  src: string;
  embedId: string;
  youtubeUrl: string;
};

export const KIRTANA_PLAYLIST: KirtanaTrack[] = [
  {
    id: "govinda-hare-gopal-hare",
    title: "Govinda Hare Gopāla Hare",
    titleHi: "गोविन्द हरे गोपाल हरे",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Govinda Hare Gopal Hare.mp3",
    embedId: "czkk_WVuCXM",
    youtubeUrl: "https://www.youtube.com/watch?v=czkk_WVuCXM",
  },
  {
    id: "harinama-japa-mahamantra",
    title: "Harinām Japa — Hare Kṛṣṇa Mahāmantra",
    titleHi: "हरिनाम जप — हरे कृष्ण महामंत्र",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Harinama Japa - Hare Krishna Mahamantra.mp3",
    embedId: "zEVmE6OuKew",
    youtubeUrl: "https://www.youtube.com/watch?v=zEVmE6OuKew",
  },
  {
    id: "radhe-radhe-govinda",
    title: "Rādhe Rādhe Govinda",
    titleHi: "राधे राधे गोविन्द",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/RadheRadheGovida-short.mp3",
    embedId: "GBzhc8QNumE",
    youtubeUrl: "https://www.youtube.com/watch?v=GBzhc8QNumE",
  },
  {
    id: "narasimha-mantra-kirtan",
    title: "Śrī Narsiṁha Mantra & Kīrtana",
    titleHi: "श्री नृसिंह मंत्र एवं कीर्तन",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Narasingha Mantra & Kirtan.mp3",
    embedId: "enj6QXnZyK8",
    youtubeUrl: "https://www.youtube.com/watch?v=enj6QXnZyK8",
  },
  {
    id: "gaura-hari-bolo-bhai",
    title: "Gaura Hari Bolo Bhāi",
    titleHi: "गौर हरि बोलो भाई",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Gaura Hari Bolo Bhai.mp3",
    embedId: "xhifiCXoz1I",
    youtubeUrl: "https://www.youtube.com/watch?v=xhifiCXoz1I",
  },
  {
    id: "jai-dao-gurudev",
    title: "Jaya Dao Jaya Dao",
    titleHi: "जय दो जय दो",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Jai Dao- Gurudev kirtan.mp3",
    embedId: "czkk_WVuCXM",
    youtubeUrl: "https://www.youtube.com/watch?v=czkk_WVuCXM",
  },
  {
    id: "radha-krishna-bol-bol",
    title: "Rādhā-Kṛṣṇa Bol Bol",
    titleHi: "राधा-कृष्ण बोल बोल",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/RadhaKrishnaBolBol.mp3",
    embedId: "3v9RNHj6bz8",
    youtubeUrl: "https://www.youtube.com/watch?v=3v9RNHj6bz8",
  },
  {
    id: "akrodha-paramananda",
    title: "Akrodha Paramānanda Nityānanda Rāya",
    titleHi: "अक्रोध परमानन्द नित्यानन्द राय",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/AkrodhaParamanandaNityanandaRaya.mp3",
    embedId: "h8kPy_gfO70",
    youtubeUrl: "https://www.youtube.com/watch?v=h8kPy_gfO70",
  },
  {
    id: "baladev-kirtan",
    title: "Śrī Baladeva Kīrtana",
    titleHi: "श्री बलदेव कीर्तन",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Baladev Kirtan.mp3",
    embedId: "UmqlSeQsUFA",
    youtubeUrl: "https://www.youtube.com/watch?v=UmqlSeQsUFA",
  },
  {
    id: "govind-jaya-jaya-chandigarh",
    title: "Govinda Jaya Jaya (Chandigarh 1990s)",
    titleHi: "गोविन्द जय जय (चंडीगढ़)",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Govind Jaya Jaya Kirtan in Chandigarh.mp3",
    embedId: "czkk_WVuCXM",
    youtubeUrl: "https://www.youtube.com/watch?v=czkk_WVuCXM",
  },
  {
    id: "guru-parampara-vandana",
    title: "Gurvaṣṭaka, Guru-Paramparā & Vaiṣṇava Vandanā",
    titleHi: "गुर्वष्टक, गुरु-परंपरा एवं वैष्णव वंदना",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Guru-Parampara Etc.mp3",
    embedId: "zOoEuWAvX8A",
    youtubeUrl: "https://www.youtube.com/watch?v=zOoEuWAvX8A",
  },
  {
    id: "hari-he-dayal-mora",
    title: "Hari He Dayāl Mora Jaya Rādhānātha",
    titleHi: "हरि हे दयाल मोर जय राधनाथ",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Hari He Dayal Mora Jaya Radhanatha.mp3",
    embedId: "zOoEuWAvX8A",
    youtubeUrl: "https://www.youtube.com/watch?v=zOoEuWAvX8A",
  },
  {
    id: "hari-he-dayal-more",
    title: "Hari He Dayāl More",
    titleHi: "हरि हे दयाल मोरे",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Hari He Dayal More.mp3",
    embedId: "zOoEuWAvX8A",
    youtubeUrl: "https://www.youtube.com/watch?v=zOoEuWAvX8A",
  },
  {
    id: "jaya-dhvani",
    title: "Śrī Jaya Dhvanī Kīrtana",
    titleHi: "श्री जय ध्वनी कीर्तन",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Jaya Dhvani.mp3",
    embedId: "czkk_WVuCXM",
    youtubeUrl: "https://www.youtube.com/watch?v=czkk_WVuCXM",
  },
  {
    id: "jaya-govinda-jaya-gopal",
    title: "Jaya Govinda Jaya Gopāla",
    titleHi: "जय गोविन्द जय गोपाल",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/jay_govinda_jay_gopal.mp3",
    embedId: "czkk_WVuCXM",
    youtubeUrl: "https://www.youtube.com/watch?v=czkk_WVuCXM",
  },
  {
    id: "karo-uchhe-sware-harinam",
    title: "Karo Uccaiḥ Svare Harinām",
    titleHi: "करो उच्चैः स्वरे हरिनाम",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/karo Uchhe Sware Harinam.mp3",
    embedId: "czkk_WVuCXM",
    youtubeUrl: "https://www.youtube.com/watch?v=czkk_WVuCXM",
  },
  {
    id: "kirtan-in-dauji",
    title: "Ecstatic Kīrtana in Dauji",
    titleHi: "दाऊजी में भावविभोर कीर्तन",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Kirtan In Dauji.mp3",
    embedId: "Rmt_7g2woUc",
    youtubeUrl: "https://www.youtube.com/watch?v=Rmt_7g2woUc",
  },
  {
    id: "mahamantra-4-yugas-moscow",
    title: "Mahāmantra of 4 Yugas (Moscow 2002)",
    titleHi: "चार युगों का महामंत्र (मॉस्को 2002)",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Maha Mantra of 4 Yugas Moscow 2002.mp3",
    embedId: "ujWkuwRvadA",
    youtubeUrl: "https://www.youtube.com/watch?v=ujWkuwRvadA",
  },
  {
    id: "mahamantra-with-gurudev",
    title: "Hare Kṛṣṇa Mahāmantra Kīrtana",
    titleHi: "हरे कृष्ण महामंत्र कीर्तन",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Mahamantra with Gurudev.mp3",
    embedId: "GBzhc8QNumE",
    youtubeUrl: "https://www.youtube.com/watch?v=GBzhc8QNumE",
  },
  {
    id: "mangalacharan",
    title: "Śrī Maṅgalācaraṇa & Praṇāma Mantra",
    titleHi: "श्री मंगलाचरण एवं प्रणाम मंत्र",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Mangalacharan.mp3",
    embedId: "zOoEuWAvX8A",
    youtubeUrl: "https://www.youtube.com/watch?v=zOoEuWAvX8A",
  },
  {
    id: "ohe-vaisnava-thakura",
    title: "Ohe Vaiṣṇava Ṭhākura",
    titleHi: "ओहे वैष्णव ठाकुर",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/ohe vaisnava thakura.mp3",
    embedId: "zOoEuWAvX8A",
    youtubeUrl: "https://www.youtube.com/watch?v=zOoEuWAvX8A",
  },
  {
    id: "purusottama-kirtan",
    title: "Śrī Puruṣottama Māsa Kīrtana",
    titleHi: "श्री पुरुषोत्तम मास कीर्तन",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Purusottama Kirtan.mp3",
    embedId: "czkk_WVuCXM",
    youtubeUrl: "https://www.youtube.com/watch?v=czkk_WVuCXM",
  },
  {
    id: "radhastaka-kolkata",
    title: "Śrī Rādhāṣṭakam (Kolkata)",
    titleHi: "श्री राधाष्टकम् (कोलकाता)",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/radhastaka_rupagoswami_radhastami_kolkata.mp3",
    embedId: "7q6n4c6iNls",
    youtubeUrl: "https://www.youtube.com/watch?v=7q6n4c6iNls",
  },
  {
    id: "radhastami-kirtan-kolkata-2005",
    title: "Rādhāṣṭamī Kīrtana (Kolkata 2005)",
    titleHi: "राधाष्टमी कीर्तन (कोलकाता 2005)",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Radhastami KirtanKolkata 2005.mp3",
    embedId: "7q6n4c6iNls",
    youtubeUrl: "https://www.youtube.com/watch?v=7q6n4c6iNls",
  },
  {
    id: "radhe-radhe-govinda-radhastami",
    title: "Rādhe Rādhe Govinda (Rādhāṣṭamī)",
    titleHi: "राधे राधे गोविन्द (राधाष्टमी)",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Radhe Radhe Govinda - Radhastami Kirtan.mp3",
    embedId: "GBzhc8QNumE",
    youtubeUrl: "https://www.youtube.com/watch?v=GBzhc8QNumE",
  },
  {
    id: "rama-krishna-vasudeva",
    title: "Rāma Kṛṣṇa Vāsudeva Jagannātha Hari",
    titleHi: "राम कृष्ण वासुदेव जगन्नाथ हरि",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/RamaKrishna Vasudeva - Guruji.mp3",
    embedId: "YgV7pALxqmk",
    youtubeUrl: "https://www.youtube.com/watch?v=YgV7pALxqmk",
  },
  {
    id: "ratha-yatra-kirtan",
    title: "Śrī Ratha Yātrā Saṅkīrtana",
    titleHi: "श्री रथ यात्रा संकीर्तन",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Ratha Yatra Kirtan.mp3",
    embedId: "Rmt_7g2woUc",
    youtubeUrl: "https://www.youtube.com/watch?v=Rmt_7g2woUc",
  },
  {
    id: "siksastaka-kirtan",
    title: "Śrī Śikṣāṣṭakam Kīrtana",
    titleHi: "श्री शिक्षाष्टकम् कीर्तन",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Shiksastaka.mp3",
    embedId: "czkk_WVuCXM",
    youtubeUrl: "https://www.youtube.com/watch?v=czkk_WVuCXM",
  },
  {
    id: "govardhan-kirtan",
    title: "Śrī Govardhana Parikramā Kīrtana",
    titleHi: "श्री गोवर्धन परिक्रमा कीर्तन",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Shrila Bhakti Vallabha Tirtha Goswami Maharaj - Govardhan Kirtan.mp3",
    embedId: "czkk_WVuCXM",
    youtubeUrl: "https://www.youtube.com/watch?v=czkk_WVuCXM",
  },
  {
    id: "nagar-sankirtan-odessa",
    title: "Nagar Saṅkīrtana (Odessa 1999)",
    titleHi: "नगर संकीर्तन (ओडेसा 1999)",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Shrila Bhakti Vallabha Tirtha Goswami Maharaj - Nagar Sankirtana, Odessa, 19.06.99.mp3",
    embedId: "h8kPy_gfO70",
    youtubeUrl: "https://www.youtube.com/watch?v=h8kPy_gfO70",
  },
  {
    id: "sri-krishna-caitanya-prabhu-jaya-dao",
    title: "Śrī Kṛṣṇa Chaitanya Prabhu Jaya Dao",
    titleHi: "श्री कृष्ण चैतन्य प्रभु जय दो",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Sri Krishna Caitanya Prabhu Jaya Dao.mp3",
    embedId: "ryS_ZU8t4MA",
    youtubeUrl: "https://www.youtube.com/watch?v=ryS_ZU8t4MA",
  },
  {
    id: "tumi-to-dayara-sindhu",
    title: "Tumi To Dayāra Sindhu",
    titleHi: "तुम्ही तो दयार सिन्धु",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/TumiToDayaraSindhu.mp3",
    embedId: "zOoEuWAvX8A",
    youtubeUrl: "https://www.youtube.com/watch?v=zOoEuWAvX8A",
  },
  {
    id: "vrindavana-chalo-he-gopinath",
    title: "Vṛndāvana Chalo He Gopīnātha (Ratha Yātrā 2002)",
    titleHi: "वृंदावन चलो हे गोपीनाथ (रथ यात्रा)",
    artist: "Śrīla B. B. Tīrtha Gosvāmī Mahārāja",
    artistHi: "श्रील बी. बी. तीर्थ गोस्वामी महाराज",
    src: "/audio/kirtan/Vrindavana Chalo He Gopinath Ratha Yatra 2002.mp3",
    embedId: "Rmt_7g2woUc",
    youtubeUrl: "https://www.youtube.com/watch?v=Rmt_7g2woUc",
  },
];

export default function KirtanaPlayer({ hideDockButton = false }: { hideDockButton?: boolean }) {
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"audio" | "video">("audio");
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [miniDismissed, setMiniDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const openFromEvent = () => setOpen(true);
    window.addEventListener("hariboll:open-kirtan", openFromEvent);
    return () => window.removeEventListener("hariboll:open-kirtan", openFromEvent);
  }, []);

  const track = KIRTANA_PLAYLIST[trackIndex];
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      setHasStarted(true);
      setMiniDismissed(false);
      audioRef.current.play().catch(() => setPlaying(false));
    }
  };

  const playTrack = () => {
    if (!audioRef.current) return;
    setHasStarted(true);
    setMiniDismissed(false);
    audioRef.current.play().catch(() => setPlaying(false));
  };

  const nextTrack = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextIdx = (trackIndex + 1) % KIRTANA_PLAYLIST.length;
    setTrackIndex(nextIdx);
    setPlaying(false);
    setHasStarted(true);
    setMiniDismissed(false);
    setTimeout(() => {
      if (audioRef.current && mode === "audio") {
        audioRef.current.play().catch(() => setPlaying(false));
      }
    }, 150);
  };

  return (
    <>
      {!hideDockButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className="sadhana-dock-btn relative"
          aria-label={lang === "hi" ? "कीर्तन प्लेयर खोलें" : "Open kirtan player"}
          aria-haspopup="dialog"
          aria-expanded={open}
          title={lang === "hi" ? "कीर्तन संगीत" : "Kīrtana Player"}
          style={{ cursor: "pointer" }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#f3d78e" strokeWidth="1.5" aria-hidden="true">
            <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="18" r="3" fill="#f3d78e" stroke="none" />
            <circle cx="18" cy="16" r="3" fill="#f3d78e" stroke="none" />
          </svg>
          <span className="hidden whitespace-nowrap font-body text-[10px] font-semibold uppercase tracking-[0.15em] sm:block">
            {lang === "hi" ? "कीर्तन" : "Kirtan"}
          </span>
          {playing && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      )}

      <audio
        ref={audioRef}
        src={track.src}
        onPlay={() => {
          setPlaying(true);
          setHasStarted(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => nextTrack()}
        preload="metadata"
      />

      {mounted &&
        createPortal(
          <>
            {/* ── 1. Compact Draggable Floating Mini-Player ── */}
            <AnimatePresence>
              {hasStarted && !open && !miniDismissed && (
                <motion.div
                  key="kirtan-mini-player"
                  drag
                  dragMomentum={false}
                  dragElastic={0.1}
                  whileDrag={{ scale: 1.03, cursor: "grabbing" }}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="fixed bottom-6 right-6 z-[99990] flex items-center gap-3 rounded-full border border-gold/40 bg-[radial-gradient(circle_at_50%_0%,#3d141b_0%,#1a060a_100%)] px-3.5 py-2.5 text-cream shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-md select-none touch-none"
                  style={{ cursor: "grab" }}
                  onClick={() => setOpen(true)}
                >
                  {/* Drag Handle Grip */}
                  <div className="flex flex-col gap-0.5 opacity-50 hover:opacity-80 transition cursor-grab">
                    <div className="h-1 w-1 rounded-full bg-gold-light" />
                    <div className="h-1 w-1 rounded-full bg-gold-light" />
                    <div className="h-1 w-1 rounded-full bg-gold-light" />
                  </div>

                  {/* Equalizer Visualizer / Spinning Disc */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-maroon-dark/80 cursor-pointer hover:scale-105 transition"
                    title={playing ? "Pause" : "Play"}
                  >
                    {playing ? (
                      <div className="flex items-center gap-0.5">
                        <motion.span
                          animate={{ height: [4, 14, 6] }}
                          transition={{ repeat: Infinity, duration: 0.4, repeatType: "mirror" }}
                          className="w-0.5 rounded-full bg-gold-light"
                        />
                        <motion.span
                          animate={{ height: [12, 4, 16] }}
                          transition={{ repeat: Infinity, duration: 0.5, repeatType: "mirror" }}
                          className="w-0.5 rounded-full bg-gold-light"
                        />
                        <motion.span
                          animate={{ height: [6, 16, 4] }}
                          transition={{ repeat: Infinity, duration: 0.45, repeatType: "mirror" }}
                          className="w-0.5 rounded-full bg-gold-light"
                        />
                      </div>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-gold-light ml-0.5" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="min-w-0 max-w-[130px] xs:max-w-[160px] sm:max-w-[200px]">
                    <p className="truncate font-heading text-xs font-semibold text-cream leading-tight">
                      {lang === "hi" ? track.titleHi : track.title}
                    </p>
                    <p className="truncate font-body text-[10px] text-gold-light/75 leading-none mt-0.5">
                      {lang === "hi" ? track.artistHi : track.artist}
                    </p>
                  </div>

                  {/* Quick Controls */}
                  <div className="flex items-center gap-1.5 ml-1">
                    {/* Play/Pause Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="rounded-full p-1.5 text-gold-light hover:text-white transition"
                      title={playing ? "Pause" : "Play"}
                    >
                      {playing ? (
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current ml-0.5" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    {/* Next Track */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextTrack(e);
                      }}
                      className="rounded-full p-1.5 text-gold-light/80 hover:text-white transition"
                      title={lang === "hi" ? "अगला कीर्तन" : "Next Track"}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                      </svg>
                    </button>

                    {/* Expand Full Player */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(true);
                      }}
                      className="rounded-full p-1.5 text-gold-light/80 hover:text-white transition"
                      title={lang === "hi" ? "पूरा प्लेयर खोलें" : "Expand Player"}
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 stroke-current" fill="none" strokeWidth="2" aria-hidden="true">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {/* Close Mini Player */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (audioRef.current) audioRef.current.pause();
                        setMiniDismissed(true);
                      }}
                      className="ml-0.5 rounded-full p-1 text-cream/40 hover:text-cream transition"
                      title={lang === "hi" ? "मिनी-प्लेयर बंद करें" : "Dismiss Mini-Player"}
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── 2. Full Kirtana Modal Dialog ── */}
            <AnimatePresence>
              {open && (
                <motion.div
                  className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#16090b]/85 p-4 sm:p-6 backdrop-blur-md"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.35 }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setOpen(false);
                  }}
                >
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0, y: 20, scale: 0.97 }}
                    transition={reduce ? { duration: 0 } : spring.gentle}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-gold/40 bg-[radial-gradient(circle_at_50%_15%,#5c3929_0%,#3d1016_52%,#20090d_100%)] p-6 text-center text-cream shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)] sm:p-8"
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="absolute right-4 top-4 rounded-full px-3 py-2 text-cream/60 transition hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                      aria-label={lang === "hi" ? "कीर्तन प्लेयर बंद करें" : "Close kirtan player"}
                    >
                      ×
                    </button>

                    <p className="font-body text-[10px] font-medium uppercase tracking-widest2 text-gold-light">
                      {lang === "hi" ? "श्रील बी. बी. तीर्थ महाराज कीर्तन" : "Śrīla B. B. Tīrtha Mahārāja Kīrtana"}
                    </p>

                    {/* Mode switcher tabs */}
                    <div className="mt-3 inline-flex rounded-full border border-gold/30 bg-black/40 p-1">
                      <button
                        type="button"
                        onClick={() => setMode("audio")}
                        className={`rounded-full px-3 py-1 font-body text-xs font-semibold transition ${
                          mode === "audio" ? "bg-gold-gradient text-maroon-dark shadow-sm" : "text-cream/70 hover:text-cream"
                        }`}
                      >
                        🎵 {lang === "hi" ? "ऑडियो" : "Audio Track"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (audioRef.current) audioRef.current.pause();
                          setMode("video");
                        }}
                        className={`rounded-full px-3 py-1 font-body text-xs font-semibold transition ${
                          mode === "video" ? "bg-gold-gradient text-maroon-dark shadow-sm" : "text-cream/70 hover:text-cream"
                        }`}
                      >
                        🎥 {lang === "hi" ? "वीडियो कीर्तन" : "YouTube Video"}
                      </button>
                    </div>

                    <h3 className="mt-3 font-heading text-lg font-semibold text-cream sm:text-xl">
                      {lang === "hi" ? track.titleHi : track.title}
                    </h3>

                    <p className="mt-1 font-body text-xs text-gold-light/80">
                      {lang === "hi" ? track.artistHi : track.artist}
                    </p>

                    {mode === "video" ? (
                      <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-xl border border-gold/40 bg-black shadow-lg">
                        <iframe
                          src={`https://www.youtube.com/embed/${track.embedId}?autoplay=1`}
                          title={track.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full border-0"
                        />
                      </div>
                    ) : (
                      <>
                        {/* Animated lotus audio visualizer */}
                        {playing ? (
                          <div className="mt-5 flex items-center justify-center gap-1.5 h-8">
                            {[20, 32, 16, 36, 24, 28, 18].map((h, i) => (
                              <motion.span
                                key={i}
                                animate={{ height: [8, h, 10] }}
                                transition={{ repeat: Infinity, duration: 0.5 + i * 0.12, repeatType: "mirror" }}
                                className="w-1.5 rounded-full bg-gold-light"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="mt-5 h-8 flex items-center justify-center font-body text-xs text-cream/50 italic">
                            {lang === "hi" ? "सुनने के लिए प्ले पर क्लिक करें" : "Click Play to begin kīrtana"}
                          </div>
                        )}

                        {/* Player controls */}
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePlay();
                            }}
                            className="btn-gold min-w-[140px]"
                          >
                            {playing
                              ? lang === "hi" ? "रुकें (Pause)" : "Pause"
                              : lang === "hi" ? "कीर्तन सुनें" : "Play Kīrtana"}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              nextTrack(e);
                            }}
                            className="rounded-full border border-gold-light/40 px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-gold-light transition hover:border-gold-light hover:text-cream"
                          >
                            {lang === "hi" ? "अगला ⏭" : "Next ⏭"}
                          </button>
                        </div>
                      </>
                    )}

                    {/* Track selector dropdown */}
                    <div className="mt-5 text-left">
                      <label className="block font-body text-[11px] font-semibold uppercase tracking-wider text-gold-light/80 mb-1.5">
                        {lang === "hi" ? "कीर्तन चुनें:" : "Select Track:"}
                      </label>
                      <select
                        value={trackIndex}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          const idx = Number(e.target.value);
                          setTrackIndex(idx);
                          setPlaying(false);
                          setTimeout(() => {
                            if (audioRef.current && mode === "audio") {
                              playTrack();
                            }
                          }, 150);
                        }}
                        className="w-full rounded-xl border border-gold/35 bg-[#250a0f] px-3 py-2 font-body text-xs text-gold-light focus:outline-none focus:ring-1 focus:ring-gold"
                      >
                        {KIRTANA_PLAYLIST.map((t, idx) => (
                          <option key={t.id} value={idx}>
                            {idx + 1}. {lang === "hi" ? t.titleHi : t.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-5 border-t border-gold/20 pt-4 flex flex-col gap-2 items-center">
                      <a
                        href={track.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 font-body text-xs font-medium text-amber-300 transition hover:underline"
                      >
                        ▶ {lang === "hi" ? "YouTube पर मूल वीडियो देखें" : "Watch original video on YouTube"} ↗
                      </a>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>,
          document.body
        )}
    </>
  );
}
