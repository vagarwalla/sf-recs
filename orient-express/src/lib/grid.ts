import { ActionGroup, CASE_COUNT } from "./types";

// Pad a list of case→clue numbers out to all 10 cases.
// `null` means that case has not been transcribed from the clue-numbers sheet yet.
function cb(...vals: (number | null)[]): (number | null)[] {
  const arr = vals.slice(0, CASE_COUNT);
  while (arr.length < CASE_COUNT) arr.push(null);
  return arr;
}

// === CLUE-NUMBERS SHEET ===========================================
// Source: photo of the game's "CLUE NUMBERS" lookup card.
// Cases 1–2 are transcribed and pending verification; Cases 3–10 await
// a higher-resolution scan (the right-hand columns are not legible in the
// current photo). Fill the remaining `cb(...)` slots as data is confirmed.
// Order of args = Case 1, Case 2, … Case 10.

export const ACTION_GROUPS: ActionGroup[] = [
  {
    type: "suspect",
    name: "Question Suspect",
    icon: "Search",
    targetNoun: "Suspect",
    targets: [
      { key: "actress", label: "Actress", role: "SUSPECT", clueByCase: cb(234, 56) },
      { key: "baroness", label: "Baroness", role: "SUSPECT", clueByCase: cb(71, 314) },
      { key: "count", label: "Count", role: "SUSPECT", clueByCase: cb(28, 291) },
      { key: "diplomat", label: "Diplomat", role: "SUSPECT", clueByCase: cb(201, 121) },
      { key: "entrepreneur", label: "Entrepreneur", role: "SUSPECT", clueByCase: cb(112, 148) },
      { key: "fortuneteller", label: "Fortuneteller", role: "SUSPECT", clueByCase: cb(52, 283) },
      { key: "gambler", label: "Gambler", role: "SUSPECT", clueByCase: cb(167, 14) },
      { key: "heiress", label: "Heiress", role: "SUSPECT", clueByCase: cb(297, 222) },
    ],
  },
  {
    type: "crewman",
    name: "Question Crew",
    icon: "BellRing",
    targetNoun: "Crew Member",
    targets: [
      { key: "chief", label: "Chief", role: "CREW", clueByCase: cb(12, 171) },
      { key: "conductor", label: "Conductor", role: "CREW", clueByCase: cb(133, 47) },
      { key: "cook", label: "Cook", role: "CREW", clueByCase: cb(254, 235) },
      { key: "doctor", label: "Doctor", role: "CREW", clueByCase: cb(93, 199) },
      { key: "porter", label: "Porter", role: "CREW", clueByCase: cb(188, 101) },
      { key: "valet", label: "Valet", role: "CREW", clueByCase: cb(61, 268) },
      { key: "waiter", label: "Waiter", role: "CREW", clueByCase: cb(277, 182) },
    ],
  },
  {
    type: "area",
    name: "Search Area",
    icon: "MapPin",
    targetNoun: "Area",
    targets: [
      { key: "dining", label: "Dining Area", role: "AREA", clueByCase: cb(82, 191) },
      { key: "drawing-room", label: "Drawing Room Area", role: "AREA", clueByCase: cb(146, 87) },
      { key: "first-class", label: "First Class", role: "AREA", clueByCase: cb(290, 23) },
      { key: "kitchen", label: "Kitchen Area", role: "AREA", clueByCase: cb(212, 74) },
      { key: "second-class", label: "Second Class", role: "AREA", clueByCase: cb(38, 129) },
      { key: "smoking-lounge", label: "Smoking Lounge Area", role: "AREA", clueByCase: cb(266, 247) },
    ],
  },
  {
    type: "telegram",
    name: "Telegram",
    icon: "Mail",
    targetNoun: "Subject",
    targets: [
      { key: "tg-actress", label: "Actress", role: "WIRE RE.", clueByCase: cb(245, 210) },
      { key: "tg-baroness", label: "Baroness", role: "WIRE RE.", clueByCase: cb(102, 63) },
      { key: "tg-count", label: "Count", role: "WIRE RE.", clueByCase: cb(176, 159) },
      { key: "tg-diplomat", label: "Diplomat", role: "WIRE RE.", clueByCase: cb(20, 256) },
      { key: "tg-entrepreneur", label: "Entrepreneur", role: "WIRE RE.", clueByCase: cb(195, 116) },
      { key: "tg-fortuneteller", label: "Fortuneteller", role: "WIRE RE.", clueByCase: cb(124, 5) },
      { key: "tg-gambler", label: "Gambler", role: "WIRE RE.", clueByCase: cb(221, 96) },
      { key: "tg-heiress", label: "Heiress", role: "WIRE RE.", clueByCase: cb(41, 137) },
      { key: "tg-victim", label: "Victim", role: "WIRE RE.", clueByCase: cb(157, 33) },
    ],
  },
];

export function getActionGroup(type: string): ActionGroup | undefined {
  return ACTION_GROUPS.find((g) => g.type === type);
}
