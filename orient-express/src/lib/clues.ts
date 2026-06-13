import { Clue, CLUE_COUNT } from "./types";

// === CLUE BOOK ====================================================
// Source: photos of the "CLUES FOR CASES" booklet (clues 1–320).
//
// Only clues legible in the current photos are transcribed below; every
// transcribed clue is `verified: false` until confirmed against the printed
// booklet on the /verify page. Any id not present here renders as "pending"
// (awaiting transcription). Add entries as they are read/confirmed.
const CLUE_TEXT: Record<number, string> = {
  94: "The Actress and Heiress will tell you exactly the same thing, which eliminates two motives.",
  95: "Among the suspects, at least three of the women are not experts in exotic poisons.",
  96: "If the Gambler is guilty, the motive was blackmail, insanity, or money; the Gambler is righthanded.",
  97: "The victim, George Gigolo, was shot to death. If you search First and Second Class and question the Valet, you will have enough information to eliminate two motives.",
  98: "If the murder weapon was a sword, then either the Baroness, Count, Diplomat, or Fortuneteller is guilty.",
  99: "If the Actress is guilty, the motive was not blackmail or revenge.",
  100: "Anyone who was not in the drawing room between 6 and 7 o'clock is innocent.",
  101: "None of the female suspects is ambidextrous; one is lefthanded, three are righthanded.",
  102: "If the Baroness is guilty, the motive was either blackmail or jealousy.",
  103: "If the motive was either blackmail or insanity, then at least one of the Baroness, Count, and Gambler is guilty.",
  104: "If the murder took place after 7 o'clock, then the Baroness and Count must both be innocent.",
  105: "If the Heiress is guilty, the motive was money or revenge; the Heiress speaks French.",
  106: "From 6 o'clock until 8, the Baroness and Count were in the dining room.",
  107: "If the Fortuneteller is guilty, the motive was not money; the Fortuneteller cannot pick a lock.",
  108: "Neither the Fortuneteller nor the Gambler could have committed the murder between 5 and 6 o'clock.",
  109: "If the Entrepreneur is guilty, the motive was espionage, insanity, or money; the Entrepreneur is an expert in exotic poisons.",
  110: "If the Entrepreneur is guilty, the motive was not insanity.",
  199: "From the angles of the stab wounds, either the killer was ambidextrous, or there were at least two killers — one righthanded and one lefthanded.",
  200: "The killer walks with a limp.",
  201: "Unless the murder took place after 7 o'clock, the Entrepreneur could not have done it.",
  203: "At least one man and one woman are guilty.",
  207: "The murder had to take place either before 5 o'clock or after 7 o'clock.",
  250: "The victim was shot in the smoking lounge.",
  252: "The Fortuneteller is innocent.",
  253: "The motive was not espionage.",
  254: "The Valet and the Doctor can also tell you whether or not the victim was poisoned.",
  257: "The murder could not have occurred after 7 o'clock.",
  266: "The motive was not blackmail or jealousy.",
  268: "None of the male suspects is ambidextrous; one is lefthanded, three are righthanded.",
  269: "The killer took some coins and jewels — either because it was robbery (the motive was money) or because he or she wanted it to look that way — but left other coins and jewels behind, in the open.",
};

// Full 1..320 clue list. Unknown ids are emitted as pending (text: null).
export const CLUES: Clue[] = Array.from({ length: CLUE_COUNT }, (_, i) => {
  const id = i + 1;
  const text = CLUE_TEXT[id] ?? null;
  return { id, text, verified: false };
});

export function getClue(id: number | null | undefined): Clue | undefined {
  if (!id) return undefined;
  return CLUES[id - 1];
}
