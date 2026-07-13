export type SacredEvent = {
  name: string;
  nameHi: string;
  date: string;
  kind: "ekadashi" | "festival" | "kartik";
  note: string;
  noteHi: string;
};

// Dates are kept in one small, reviewable list so the temple can update its
// calendar without touching the countdown presentation.
export const SACRED_EVENTS: SacredEvent[] = [
  {
    name: "Shayani Ekadashi",
    nameHi: "शयनी एकादशी",
    date: "2026-07-25T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 25 July • Parana after sunrise on 26 July",
    noteHi: "25 जुलाई व्रत • 26 जुलाई सूर्योदय के बाद पारण",
  },
  {
    name: "Kamika Ekadashi",
    nameHi: "कामिका एकादशी",
    date: "2026-08-09T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 9 August • Parana after sunrise on 10 August",
    noteHi: "9 अगस्त व्रत • 10 अगस्त सूर्योदय के बाद पारण",
  },
  {
    name: "Pavitropana Ekadashi",
    nameHi: "पवित्रोपना एकादशी",
    date: "2026-08-24T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 24 August • Parana after sunrise on 25 August",
    noteHi: "24 अगस्त व्रत • 25 अगस्त सूर्योदय के बाद पारण",
  },
  {
    name: "Sri Krishna Janmashtami",
    nameHi: "श्री कृष्ण जन्माष्टमी",
    date: "2026-09-04T00:00:00+05:30",
    kind: "festival",
    note: "Friday, 4 September 2026",
    noteHi: "शुक्रवार, 4 सितंबर 2026",
  },
  {
    name: "Annada Ekadashi",
    nameHi: "अन्नदा एकादशी",
    date: "2026-09-07T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 7 September • Parana after sunrise on 8 September",
    noteHi: "7 सितंबर व्रत • 8 सितंबर सूर्योदय के बाद पारण",
  },
  {
    name: "Parshva Ekadashi",
    nameHi: "पार्श्व एकादशी",
    date: "2026-09-22T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 22 September • Parana after sunrise on 23 September",
    noteHi: "22 सितंबर व्रत • 23 सितंबर सूर्योदय के बाद पारण",
  },
  {
    name: "Indira Ekadashi",
    nameHi: "इंदिरा एकादशी",
    date: "2026-10-06T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 6 October • Parana after sunrise on 7 October",
    noteHi: "6 अक्टूबर व्रत • 7 अक्टूबर सूर्योदय के बाद पारण",
  },
  {
    name: "Pashankusha Ekadashi",
    nameHi: "पाशांकुशा एकादशी",
    date: "2026-10-22T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 22 October • Parana after sunrise on 23 October",
    noteHi: "22 अक्टूबर व्रत • 23 अक्टूबर सूर्योदय के बाद पारण",
  },
  {
    name: "Kartik Begins",
    nameHi: "कार्तिक मास आरंभ",
    date: "2026-10-27T00:00:00+05:30",
    kind: "kartik",
    note: "The sacred month of lamp offerings begins",
    noteHi: "दीपदान का पावन मास आरंभ",
  },
  {
    name: "Rama Ekadashi",
    nameHi: "रमा एकादशी",
    date: "2026-11-05T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 5 November • Parana after sunrise on 6 November",
    noteHi: "5 नवंबर व्रत • 6 नवंबर सूर्योदय के बाद पारण",
  },
  {
    name: "Utthana Ekadashi",
    nameHi: "उत्थान एकादशी",
    date: "2026-11-21T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 21 November • Parana after sunrise on 22 November",
    noteHi: "21 नवंबर व्रत • 22 नवंबर सूर्योदय के बाद पारण",
  },
  {
    name: "Utpanna Ekadashi",
    nameHi: "उत्पन्ना एकादशी",
    date: "2026-12-04T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 4 December • Parana after sunrise on 5 December",
    noteHi: "4 दिसंबर व्रत • 5 दिसंबर सूर्योदय के बाद पारण",
  },
  {
    name: "Mokshada Ekadashi",
    nameHi: "मोक्षदा एकादशी",
    date: "2026-12-20T00:00:00+05:30",
    kind: "ekadashi",
    note: "Fast on 20 December • Parana after sunrise on 21 December",
    noteHi: "20 दिसंबर व्रत • 21 दिसंबर सूर्योदय के बाद पारण",
  },
];

