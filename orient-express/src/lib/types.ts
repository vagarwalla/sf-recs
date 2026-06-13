// Domain model for the Murder on the Orient Express clue lookup.

export type ActionType = "suspect" | "crewman" | "area" | "telegram";

// A single clue from the clue book (numbered 1–320).
export interface Clue {
  id: number;
  // Full transcribed text. `null` means "not yet transcribed" (pending).
  text: string | null;
  // false until the text has been confirmed against the physical clue book.
  verified: boolean;
}

// One target within an action category (a suspect, crewman, area, or telegram subject).
export interface Target {
  key: string; // stable id, e.g. "actress"
  label: string; // display name, e.g. "Actress"
  role: string; // short tag shown on the card, e.g. "SUSPECT"
  // Clue number for each case 1–10 (index 0 = Case 1). `null` = not yet transcribed.
  clueByCase: (number | null)[];
}

export interface ActionGroup {
  type: ActionType;
  name: string; // e.g. "Question Suspect"
  icon: string; // lucide icon name
  targetNoun: string; // "Suspect" | "Crew Member" | "Area" | "Subject"
  targets: Target[];
}

export const CASE_COUNT = 10;
export const CLUE_COUNT = 320;
