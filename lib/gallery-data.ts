export type GalleryCategory = "all" | "darshan" | "festivals" | "architecture" | "heritage" | "sankirtan";

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  category: GalleryCategory;
  palette: "maroon" | "gold" | "forest" | "sky" | "cream";
}

export const GALLERY_CATEGORIES: {
  key: GalleryCategory;
  label: string;
  labelHi: string;
  icon: string;
}[] = [
  { key: "all", label: "All Photos", labelHi: "सभी चित्र", icon: "✨" },
  { key: "darshan", label: "Divine Darshan", labelHi: "दिव्य दर्शन", icon: "🌸" },
  { key: "festivals", label: "Festivals & Utsav", labelHi: "उत्सव एवं त्यौहार", icon: "🪔" },
  { key: "architecture", label: "Temple Architecture", labelHi: "मंदिर स्थापत्य", icon: "🏛️" },
  { key: "heritage", label: "Heritage & Ācāryas", labelHi: "आचार्य एवं परंपरा", icon: "📜" },
  { key: "sankirtan", label: "Harinām Saṅkīrtan", labelHi: "हरिनाम संकीर्तन", icon: "🎵" },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    "id": "gallery-photo-1",
    "src": "/images/gallery/darshan-batch-1785919380409.webp",
    "alt": "Hariboll Mandir Photo 1",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-2",
    "src": "/images/gallery/darshan-batch-1785919380410.webp",
    "alt": "Hariboll Mandir Photo 2",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-3",
    "src": "/images/gallery/darshan-batch-1785919380411.webp",
    "alt": "Hariboll Mandir Photo 3",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-4",
    "src": "/images/gallery/darshan-batch-1785919380412.webp",
    "alt": "Hariboll Mandir Photo 4",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-5",
    "src": "/images/gallery/darshan-batch-1785919380413.webp",
    "alt": "Hariboll Mandir Photo 5",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-6",
    "src": "/images/gallery/darshan-batch-1785919380414.webp",
    "alt": "Hariboll Mandir Photo 6",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-7",
    "src": "/images/gallery/darshan-batch-1785919380415.webp",
    "alt": "Hariboll Mandir Photo 7",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-8",
    "src": "/images/gallery/darshan-batch-1785919380416.webp",
    "alt": "Hariboll Mandir Photo 8",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-9",
    "src": "/images/gallery/darshan-batch-1785919380417.webp",
    "alt": "Hariboll Mandir Photo 9",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-10",
    "src": "/images/gallery/darshan-batch-1785919380418.webp",
    "alt": "Hariboll Mandir Photo 10",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-11",
    "src": "/images/gallery/darshan-batch-1785919380419.webp",
    "alt": "Hariboll Mandir Photo 11",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-12",
    "src": "/images/gallery/darshan-batch-1785919380420.webp",
    "alt": "Hariboll Mandir Photo 12",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-13",
    "src": "/images/gallery/darshan-batch-1785919380421.webp",
    "alt": "Hariboll Mandir Photo 13",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-14",
    "src": "/images/gallery/darshan-batch-1785919380422.webp",
    "alt": "Hariboll Mandir Photo 14",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-15",
    "src": "/images/gallery/darshan-batch-1785919380423.webp",
    "alt": "Hariboll Mandir Photo 15",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-16",
    "src": "/images/gallery/darshan-batch-1785919380424.webp",
    "alt": "Hariboll Mandir Photo 16",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-17",
    "src": "/images/gallery/darshan-batch-1785919380425.webp",
    "alt": "Hariboll Mandir Photo 17",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-18",
    "src": "/images/gallery/darshan-batch-1785919380426.webp",
    "alt": "Hariboll Mandir Photo 18",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-19",
    "src": "/images/gallery/darshan-batch-1785919380427.webp",
    "alt": "Hariboll Mandir Photo 19",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-20",
    "src": "/images/gallery/darshan-batch-1785919399475.webp",
    "alt": "Hariboll Mandir Photo 20",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-21",
    "src": "/images/gallery/darshan-batch-1785919399476.webp",
    "alt": "Hariboll Mandir Photo 21",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-22",
    "src": "/images/gallery/darshan-batch-1785919399477.webp",
    "alt": "Hariboll Mandir Photo 22",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-23",
    "src": "/images/gallery/darshan-batch-1785919399478.webp",
    "alt": "Hariboll Mandir Photo 23",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-24",
    "src": "/images/gallery/darshan-batch-1785919420135.webp",
    "alt": "Hariboll Mandir Photo 24",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-25",
    "src": "/images/gallery/darshan-batch-1785919420136.webp",
    "alt": "Hariboll Mandir Photo 25",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-26",
    "src": "/images/gallery/darshan-batch-1785919420137.webp",
    "alt": "Hariboll Mandir Photo 26",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-27",
    "src": "/images/gallery/darshan-gdrive-1.webp",
    "alt": "Hariboll Mandir Photo 27",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-28",
    "src": "/images/gallery/darshan-gdrive-10.webp",
    "alt": "Hariboll Mandir Photo 28",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-29",
    "src": "/images/gallery/darshan-gdrive-11.webp",
    "alt": "Hariboll Mandir Photo 29",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-30",
    "src": "/images/gallery/darshan-gdrive-12.webp",
    "alt": "Hariboll Mandir Photo 30",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-31",
    "src": "/images/gallery/darshan-gdrive-2.webp",
    "alt": "Hariboll Mandir Photo 31",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-32",
    "src": "/images/gallery/darshan-gdrive-3.webp",
    "alt": "Hariboll Mandir Photo 32",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-33",
    "src": "/images/gallery/darshan-gdrive-4.webp",
    "alt": "Hariboll Mandir Photo 33",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-34",
    "src": "/images/gallery/darshan-gdrive-5.webp",
    "alt": "Hariboll Mandir Photo 34",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-35",
    "src": "/images/gallery/darshan-gdrive-6.webp",
    "alt": "Hariboll Mandir Photo 35",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-36",
    "src": "/images/gallery/darshan-gdrive-7.webp",
    "alt": "Hariboll Mandir Photo 36",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-37",
    "src": "/images/gallery/darshan-gdrive-8.webp",
    "alt": "Hariboll Mandir Photo 37",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-38",
    "src": "/images/gallery/darshan-gdrive-9.webp",
    "alt": "Hariboll Mandir Photo 38",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-39",
    "src": "/images/gallery/day1_01.webp",
    "alt": "Hariboll Mandir Photo 39",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-40",
    "src": "/images/gallery/gdrive-photo-1.webp",
    "alt": "Hariboll Mandir Photo 40",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-41",
    "src": "/images/gallery/gdrive-photo-2.webp",
    "alt": "Hariboll Mandir Photo 41",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-42",
    "src": "/images/gallery/gdrive-photo-3.webp",
    "alt": "Hariboll Mandir Photo 42",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-43",
    "src": "/images/gallery/gdrive-photo-4.webp",
    "alt": "Hariboll Mandir Photo 43",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-44",
    "src": "/images/gallery/gdrive-photo-5.webp",
    "alt": "Hariboll Mandir Photo 44",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-45",
    "src": "/images/gallery/new-drive-photo-1.webp",
    "alt": "Hariboll Mandir Photo 45",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-46",
    "src": "/images/gallery/new-drive-photo-10.webp",
    "alt": "Hariboll Mandir Photo 46",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-47",
    "src": "/images/gallery/new-drive-photo-11.webp",
    "alt": "Hariboll Mandir Photo 47",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-48",
    "src": "/images/gallery/new-drive-photo-12.webp",
    "alt": "Hariboll Mandir Photo 48",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-49",
    "src": "/images/gallery/new-drive-photo-13.webp",
    "alt": "Hariboll Mandir Photo 49",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-50",
    "src": "/images/gallery/new-drive-photo-14.webp",
    "alt": "Hariboll Mandir Photo 50",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-51",
    "src": "/images/gallery/new-drive-photo-15.webp",
    "alt": "Hariboll Mandir Photo 51",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-52",
    "src": "/images/gallery/new-drive-photo-2.webp",
    "alt": "Hariboll Mandir Photo 52",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-53",
    "src": "/images/gallery/new-drive-photo-3.webp",
    "alt": "Hariboll Mandir Photo 53",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-54",
    "src": "/images/gallery/new-drive-photo-4.webp",
    "alt": "Hariboll Mandir Photo 54",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-55",
    "src": "/images/gallery/new-drive-photo-5.webp",
    "alt": "Hariboll Mandir Photo 55",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-56",
    "src": "/images/gallery/new-drive-photo-6.webp",
    "alt": "Hariboll Mandir Photo 56",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-57",
    "src": "/images/gallery/new-drive-photo-7.webp",
    "alt": "Hariboll Mandir Photo 57",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-58",
    "src": "/images/gallery/new-drive-photo-8.webp",
    "alt": "Hariboll Mandir Photo 58",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-59",
    "src": "/images/gallery/new-drive-photo-9.webp",
    "alt": "Hariboll Mandir Photo 59",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-60",
    "src": "/images/gallery/newlink-photo-1.webp",
    "alt": "Hariboll Mandir Photo 60",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-61",
    "src": "/images/gallery/newlink-photo-10.webp",
    "alt": "Hariboll Mandir Photo 61",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-62",
    "src": "/images/gallery/newlink-photo-11.webp",
    "alt": "Hariboll Mandir Photo 62",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-63",
    "src": "/images/gallery/newlink-photo-12.webp",
    "alt": "Hariboll Mandir Photo 63",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-64",
    "src": "/images/gallery/newlink-photo-13.webp",
    "alt": "Hariboll Mandir Photo 64",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-65",
    "src": "/images/gallery/newlink-photo-14.webp",
    "alt": "Hariboll Mandir Photo 65",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-66",
    "src": "/images/gallery/newlink-photo-15.webp",
    "alt": "Hariboll Mandir Photo 66",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-67",
    "src": "/images/gallery/newlink-photo-16.webp",
    "alt": "Hariboll Mandir Photo 67",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-68",
    "src": "/images/gallery/newlink-photo-17.webp",
    "alt": "Hariboll Mandir Photo 68",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-69",
    "src": "/images/gallery/newlink-photo-18.webp",
    "alt": "Hariboll Mandir Photo 69",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-70",
    "src": "/images/gallery/newlink-photo-19.webp",
    "alt": "Hariboll Mandir Photo 70",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-71",
    "src": "/images/gallery/newlink-photo-2.webp",
    "alt": "Hariboll Mandir Photo 71",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-72",
    "src": "/images/gallery/newlink-photo-20.webp",
    "alt": "Hariboll Mandir Photo 72",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-73",
    "src": "/images/gallery/newlink-photo-21.webp",
    "alt": "Hariboll Mandir Photo 73",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-74",
    "src": "/images/gallery/newlink-photo-22.webp",
    "alt": "Hariboll Mandir Photo 74",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-75",
    "src": "/images/gallery/newlink-photo-23.webp",
    "alt": "Hariboll Mandir Photo 75",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-76",
    "src": "/images/gallery/newlink-photo-24.webp",
    "alt": "Hariboll Mandir Photo 76",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-77",
    "src": "/images/gallery/newlink-photo-3.webp",
    "alt": "Hariboll Mandir Photo 77",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-78",
    "src": "/images/gallery/newlink-photo-4.webp",
    "alt": "Hariboll Mandir Photo 78",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-79",
    "src": "/images/gallery/newlink-photo-5.webp",
    "alt": "Hariboll Mandir Photo 79",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-80",
    "src": "/images/gallery/newlink-photo-6.webp",
    "alt": "Hariboll Mandir Photo 80",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-81",
    "src": "/images/gallery/newlink-photo-7.webp",
    "alt": "Hariboll Mandir Photo 81",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-82",
    "src": "/images/gallery/newlink-photo-8.webp",
    "alt": "Hariboll Mandir Photo 82",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-83",
    "src": "/images/gallery/newlink-photo-9.webp",
    "alt": "Hariboll Mandir Photo 83",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-84",
    "src": "/images/gallery/target-photo-1.webp",
    "alt": "Hariboll Mandir Photo 84",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-85",
    "src": "/images/gallery/target-photo-2.webp",
    "alt": "Hariboll Mandir Photo 85",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-86",
    "src": "/images/gallery/target-photo-3.webp",
    "alt": "Hariboll Mandir Photo 86",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-87",
    "src": "/images/gallery/target-photo-4.webp",
    "alt": "Hariboll Mandir Photo 87",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-88",
    "src": "/images/gallery/target-photo-5.webp",
    "alt": "Hariboll Mandir Photo 88",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-89",
    "src": "/images/gallery/upper-photo-1.webp",
    "alt": "Hariboll Mandir Photo 89",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-90",
    "src": "/images/gallery/upper-photo-10.webp",
    "alt": "Hariboll Mandir Photo 90",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-91",
    "src": "/images/gallery/upper-photo-11.webp",
    "alt": "Hariboll Mandir Photo 91",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-92",
    "src": "/images/gallery/upper-photo-12.webp",
    "alt": "Hariboll Mandir Photo 92",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-93",
    "src": "/images/gallery/upper-photo-13.webp",
    "alt": "Hariboll Mandir Photo 93",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-94",
    "src": "/images/gallery/upper-photo-14.webp",
    "alt": "Hariboll Mandir Photo 94",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-95",
    "src": "/images/gallery/upper-photo-15.webp",
    "alt": "Hariboll Mandir Photo 95",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-96",
    "src": "/images/gallery/upper-photo-16.webp",
    "alt": "Hariboll Mandir Photo 96",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-97",
    "src": "/images/gallery/upper-photo-17.webp",
    "alt": "Hariboll Mandir Photo 97",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-98",
    "src": "/images/gallery/upper-photo-18.webp",
    "alt": "Hariboll Mandir Photo 98",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-99",
    "src": "/images/gallery/upper-photo-19.webp",
    "alt": "Hariboll Mandir Photo 99",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-100",
    "src": "/images/gallery/upper-photo-2.webp",
    "alt": "Hariboll Mandir Photo 100",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-101",
    "src": "/images/gallery/upper-photo-20.webp",
    "alt": "Hariboll Mandir Photo 101",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-102",
    "src": "/images/gallery/upper-photo-3.webp",
    "alt": "Hariboll Mandir Photo 102",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-103",
    "src": "/images/gallery/upper-photo-4.webp",
    "alt": "Hariboll Mandir Photo 103",
    "category": "sankirtan",
    "palette": "sky"
  },
  {
    "id": "gallery-photo-104",
    "src": "/images/gallery/upper-photo-5.webp",
    "alt": "Hariboll Mandir Photo 104",
    "category": "heritage",
    "palette": "cream"
  },
  {
    "id": "gallery-photo-105",
    "src": "/images/gallery/upper-photo-6.webp",
    "alt": "Hariboll Mandir Photo 105",
    "category": "darshan",
    "palette": "maroon"
  },
  {
    "id": "gallery-photo-106",
    "src": "/images/gallery/upper-photo-7.webp",
    "alt": "Hariboll Mandir Photo 106",
    "category": "festivals",
    "palette": "gold"
  },
  {
    "id": "gallery-photo-107",
    "src": "/images/gallery/upper-photo-8.webp",
    "alt": "Hariboll Mandir Photo 107",
    "category": "architecture",
    "palette": "forest"
  },
  {
    "id": "gallery-photo-108",
    "src": "/images/gallery/upper-photo-9.webp",
    "alt": "Hariboll Mandir Photo 108",
    "category": "sankirtan",
    "palette": "sky"
  }
];
