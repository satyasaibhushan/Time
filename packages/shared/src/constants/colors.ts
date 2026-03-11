export interface ColorToken {
  id: string;
  label: string;
  value: string;
}

export const FOLDER_COLOR_TOKENS: readonly ColorToken[] = [
  { id: "amber", label: "Amber", value: "#E6A23C" },
  { id: "coral", label: "Coral", value: "#F97360" },
  { id: "emerald", label: "Emerald", value: "#34D399" },
  { id: "sky", label: "Sky", value: "#38BDF8" },
  { id: "violet", label: "Violet", value: "#A78BFA" },
  { id: "lime", label: "Lime", value: "#A3E635" },
] as const;

export const LABEL_COLOR_TOKENS: readonly ColorToken[] = [
  { id: "gold", label: "Gold", value: "#F5BF58" },
  { id: "rose", label: "Rose", value: "#FB7185" },
  { id: "mint", label: "Mint", value: "#6EE7B7" },
  { id: "ocean", label: "Ocean", value: "#60A5FA" },
  { id: "orchid", label: "Orchid", value: "#C084FC" },
  { id: "moss", label: "Moss", value: "#84CC16" },
] as const;

export const DEFAULT_FOLDER_COLOR = FOLDER_COLOR_TOKENS[0].value;
export const DEFAULT_LABEL_COLOR = LABEL_COLOR_TOKENS[0].value;
