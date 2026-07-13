export const LIVE_DARSHAN = {
  title: "Live Darshan from Hariboll Mandir",
  facebookUrl: "https://www.facebook.com/hari.bol.temple/",
  timeZone: "Asia/Kolkata",
  broadcasts: [
    { label: "Morning Darshan", startMinutes: 5 * 60, earlyMinutes: 10, durationMinutes: 75 },
    { label: "Evening Darshan", startMinutes: 19 * 60 + 30, earlyMinutes: 10, durationMinutes: 75 },
  ],
} as const;
