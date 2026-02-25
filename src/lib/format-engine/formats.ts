export const BUILT_IN_FORMATS = [
  {
    name: "Arrow",
    pattern: "{prefix}→ {point}",
    prefix: "",
    description: "Each point starts with an arrow",
  },
  {
    name: "Star",
    pattern: "{prefix}* {point}",
    prefix: "",
    description: "Each point starts with a star",
  },
  {
    name: "Bullet",
    pattern: "{prefix}• {point}",
    prefix: "",
    description: "Each point starts with a bullet",
  },
  {
    name: "Numbered",
    pattern: "{prefix}{index}. {point}",
    prefix: "",
    description: "Numbered list format",
  },
  {
    name: "Paragraph",
    pattern: "{text}",
    prefix: "",
    description: "Normal paragraphs",
  },
  {
    name: "One-line",
    pattern: "{text}",
    prefix: "",
    description: "Single concise answer",
  },
] as const;

export type BuiltInFormatName = (typeof BUILT_IN_FORMATS)[number]["name"];
