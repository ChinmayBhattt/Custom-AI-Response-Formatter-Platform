export function buildSystemPrompt(formatName: string, pattern: string): string {
  const baseInstruction = `You are a helpful AI assistant. You MUST respond ONLY in the specific format described below. Do NOT use any other formatting. No markdown headers, no bold, no code blocks unless explicitly asked. Strictly follow the output format.`;

  const formatMap: Record<string, string> = {
    Arrow: `${baseInstruction}

OUTPUT FORMAT: Arrow list
- Each distinct point MUST start with "→ " on a new line
- Do NOT use numbers, bullets, dashes, or any other prefix
- Keep each point concise (1-2 sentences)
- Example:
→ First point here
→ Second point here
→ Third point here`,

    Star: `${baseInstruction}

OUTPUT FORMAT: Star list
- Each distinct point MUST start with "* " on a new line
- Do NOT use numbers, bullets, arrows, or any other prefix
- Keep each point concise (1-2 sentences)
- Example:
* First point here
* Second point here
* Third point here`,

    Bullet: `${baseInstruction}

OUTPUT FORMAT: Bullet list
- Each distinct point MUST start with "• " on a new line
- Do NOT use numbers, arrows, dashes, or any other prefix
- Keep each point concise (1-2 sentences)
- Example:
• First point here
• Second point here
• Third point here`,

    Numbered: `${baseInstruction}

OUTPUT FORMAT: Numbered list
- Each distinct point MUST be numbered starting from 1
- Format: "1. Point text"
- Do NOT use bullets, arrows, or any other prefix
- Keep each point concise (1-2 sentences)
- Example:
1. First point here
2. Second point here
3. Third point here`,

    Paragraph: `${baseInstruction}

OUTPUT FORMAT: Paragraph
- Respond in flowing, natural paragraphs
- Do NOT use any bullet points, numbered lists, arrows, or special formatting
- Write complete sentences grouped into logical paragraphs
- Separate paragraphs with a blank line`,

    "One-line": `${baseInstruction}

OUTPUT FORMAT: One-line
- Respond in a SINGLE concise sentence or phrase
- Maximum 1-2 sentences
- Do NOT use any lists, bullets, or multiple lines
- Be direct and to the point`,
  };

  if (formatMap[formatName]) {
    return formatMap[formatName];
  }

  // Custom format - use the pattern to generate instructions
  return `${baseInstruction}

OUTPUT FORMAT: Custom format
- Pattern: "${pattern}"
- Where {point} = each distinct point of your response
- Where {index} = the sequential number (1, 2, 3...)
- Where {prefix} = any prefix defined by the user
- Where {text} = full text (for paragraph formats)
- Apply this pattern to EVERY line of your response
- Do NOT add any additional formatting`;
}
