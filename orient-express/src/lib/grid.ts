import { ActionGroup, CASE_COUNT } from "./types";

// Pad a list of case→clue numbers out to all 10 cases.
// `null` means that case has not been transcribed from the clue-numbers sheet yet.
function cb(...vals: (number | null)[]): (number | null)[] {
  const arr = vals.slice(0, CASE_COUNT);
  while (arr.length < CASE_COUNT) arr.push(null);
  return arr;
}

// === CLUE-NUMBERS SHEET ===========================================
// Source: photo of the game's "CLUE NUMBERS" lookup card. Full 10-case
// transcription (best-effort, pending verification against the physical card).
// Order of args = Case 1, Case 2, … Case 10.
//
// Confidence cross-check: every "Telegram about X" row maps to an
// "If the X is guilty…" clue across all 10 cases, which validates the
// dense right-hand columns. A few cells the transcriber flagged for a
// closer look: suspect Count Case 9 (154), crewman Conductor Case 9 (8),
// telegram Baroness Case 6 (26).

export const ACTION_GROUPS: ActionGroup[] = [
  {
    type: "suspect",
    name: "Question Suspect",
    icon: "Search",
    targetNoun: "Suspect",
    targets: [
      { key: "actress", label: "Actress", role: "SUSPECT", clueByCase: cb(234, 56, 286, 205, 24, 162, 232, 127, 16, 181) },
      { key: "baroness", label: "Baroness", role: "SUSPECT", clueByCase: cb(71, 314, 238, 143, 114, 51, 138, 280, 88, 43) },
      { key: "count", label: "Count", role: "SUSPECT", clueByCase: cb(28, 291, 174, 10, 262, 135, 77, 7, 154, 110) },
      { key: "diplomat", label: "Diplomat", role: "SUSPECT", clueByCase: cb(201, 121, 45, 252, 94, 298, 214, 246, 213, 168) },
      { key: "entrepreneur", label: "Entrepreneur", role: "SUSPECT", clueByCase: cb(112, 148, 108, 62, 169, 241, 3, 64, 260, 27) },
      { key: "fortuneteller", label: "Fortuneteller", role: "SUSPECT", clueByCase: cb(52, 283, 211, 111, 229, 36, 166, 170, 69, 92) },
      { key: "gambler", label: "Gambler", role: "SUSPECT", clueByCase: cb(167, 14, 295, 84, 288, 186, 98, 313, 242, 209) },
      { key: "heiress", label: "Heiress", role: "SUSPECT", clueByCase: cb(297, 222, 22, 273, 66, 305, 259, 53, 287, 134) },
    ],
  },
  {
    type: "crewman",
    name: "Question Crew",
    icon: "BellRing",
    targetNoun: "Crew Member",
    targets: [
      { key: "chief", label: "Chief", role: "CREW", clueByCase: cb(12, 171, 141, 97, 132, 17, 197, 301, 122, 73) },
      { key: "conductor", label: "Conductor", role: "CREW", clueByCase: cb(133, 47, 317, 187, 4, 272, 32, 184, 8, 150) },
      { key: "cook", label: "Cook", role: "CREW", clueByCase: cb(254, 235, 224, 240, 304, 118, 243, 91, 196, 236) },
      { key: "doctor", label: "Doctor", role: "CREW", clueByCase: cb(93, 199, 76, 29, 203, 155, 318, 30, 306, 58) },
      { key: "porter", label: "Porter", role: "CREW", clueByCase: cb(188, 101, 303, 172, 80, 319, 104, 207, 95, 178) },
      { key: "valet", label: "Valet", role: "CREW", clueByCase: cb(61, 268, 257, 293, 149, 219, 151, 320, 271, 35) },
      { key: "waiter", label: "Waiter", role: "CREW", clueByCase: cb(277, 182, 278, 120, 279, 72, 307, 136, 312, 227) },
    ],
  },
  {
    type: "area",
    name: "Search Area",
    icon: "MapPin",
    targetNoun: "Area",
    targets: [
      { key: "dining", label: "Dining Area", role: "AREA", clueByCase: cb(82, 191, 244, 309, 31, 255, 128, 106, 282, 198) },
      { key: "drawing-room", label: "Drawing Room Area", role: "AREA", clueByCase: cb(146, 87, 13, 44, 185, 173, 285, 258, 59, 6) },
      { key: "first-class", label: "First Class", role: "AREA", clueByCase: cb(290, 23, 163, 164, 315, 206, 89, 193, 180, 81) },
      { key: "kitchen", label: "Kitchen Area", role: "AREA", clueByCase: cb(212, 74, 204, 228, 54, 65, 21, 85, 225, 249) },
      { key: "second-class", label: "Second Class", role: "AREA", clueByCase: cb(38, 129, 269, 103, 251, 311, 223, 294, 253, 126) },
      { key: "smoking-lounge", label: "Smoking Lounge Area", role: "AREA", clueByCase: cb(266, 247, 115, 302, 160, 86, 316, 156, 46, 161) },
    ],
  },
  {
    type: "telegram",
    name: "Telegram",
    icon: "Mail",
    targetNoun: "Subject",
    targets: [
      { key: "tg-actress", label: "Actress", role: "WIRE RE.", clueByCase: cb(245, 210, 183, 153, 274, 289, 48, 119, 25, 99) },
      { key: "tg-baroness", label: "Baroness", role: "WIRE RE.", clueByCase: cb(102, 63, 68, 194, 123, 26, 189, 39, 296, 215) },
      { key: "tg-count", label: "Count", role: "WIRE RE.", clueByCase: cb(176, 159, 130, 18, 192, 263, 208, 15, 142, 49) },
      { key: "tg-diplomat", label: "Diplomat", role: "WIRE RE.", clueByCase: cb(20, 256, 231, 79, 237, 144, 113, 310, 202, 261) },
      { key: "tg-entrepreneur", label: "Entrepreneur", role: "WIRE RE.", clueByCase: cb(195, 116, 90, 216, 11, 230, 175, 179, 109, 67) },
      { key: "tg-fortuneteller", label: "Fortuneteller", role: "WIRE RE.", clueByCase: cb(124, 5, 34, 131, 107, 9, 276, 239, 233, 117) },
      { key: "tg-gambler", label: "Gambler", role: "WIRE RE.", clueByCase: cb(221, 96, 152, 265, 140, 281, 60, 78, 165, 19) },
      { key: "tg-heiress", label: "Heiress", role: "WIRE RE.", clueByCase: cb(41, 137, 218, 55, 217, 105, 158, 267, 37, 139) },
      { key: "tg-victim", label: "Victim", role: "WIRE RE.", clueByCase: cb(157, 33, 57, 284, 42, 248, 292, 147, 83, 190) },
    ],
  },
];

export function getActionGroup(type: string): ActionGroup | undefined {
  return ACTION_GROUPS.find((g) => g.type === type);
}
