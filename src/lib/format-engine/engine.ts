type FormatEngineInput = {
  raw: string;
  pattern: string;
  prefix?: string;
  mode?: "list" | "paragraph" | "one-line";
};

function sanitizeLine(line: string) {
  // Remove leading markdown bullets/numbers/arrows etc. to prevent leakage
  return line
    .replace(/^\s*[-*•→]+\s+/, "")
    .replace(/^\s*\d+\.?\s+/, "")
    .trim();
}

function splitToPoints(raw: string) {
  // Split by lines and punctuation heuristics.
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length >= 2) return lines.map(sanitizeLine);

  // If single paragraph, attempt to split into sentences.
  const sentences = raw
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length >= 2) return sentences.map(sanitizeLine);

  return [sanitizeLine(raw)];
}

export function formatWithPattern(pattern: string, vars: Record<string, string | number>) {
  return pattern.replace(/\{(\w+)\}/g, (_, key) => {
    const v = vars[key];
    return v === undefined ? "" : String(v);
  });
}

export function enforceFormat({ raw, pattern, prefix = "", mode }: FormatEngineInput) {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "";

  const lowerPattern = pattern.toLowerCase();

  // Auto-detect paragraph / one-line
  const isTextOnly = lowerPattern.includes("{text}");
  const isPointPattern = lowerPattern.includes("{point}");

  if (mode === "one-line" || (!isPointPattern && isTextOnly)) {
    const oneLine = trimmed.replace(/\s+/g, " ");
    return formatWithPattern(pattern, { text: oneLine, prefix });
  }

  if (mode === "paragraph" && isTextOnly) {
    return formatWithPattern(pattern, { text: trimmed, prefix });
  }

  if (isTextOnly && !isPointPattern) {
    return formatWithPattern(pattern, { text: trimmed, prefix });
  }

  const points = splitToPoints(trimmed);
  const formatted = points
    .map((p, idx) =>
      formatWithPattern(pattern, {
        point: p,
        index: idx + 1,
        prefix,
        text: trimmed,
      })
    )
    .join("\n");

  return formatted.trim();
}
