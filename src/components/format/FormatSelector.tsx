"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FormatDefinition } from "@/types";
import { enforceFormat } from "@/lib/format-engine/engine";

type Props = {
  selectedId: string;
  onSelect: (format: FormatDefinition) => void;
};

const SAMPLE_TEXT =
  "React is a JavaScript library. It uses a virtual DOM. Components can have state and props. Hooks enable functional components.";

export default function FormatSelector({ selectedId, onSelect }: Props) {
  const [formats, setFormats] = useState<FormatDefinition[]>([]);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/formats")
      .then((r) => r.json())
      .then((d) => setFormats(d.formats ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = formats.find((f) => f.id === selectedId);

  const handleHover = (format: FormatDefinition) => {
    const mode =
      format.name === "One-line"
        ? "one-line"
        : format.name === "Paragraph"
        ? "paragraph"
        : "list";
    const result = enforceFormat({
      raw: SAMPLE_TEXT,
      pattern: format.pattern,
      prefix: format.prefix,
      mode: mode as "list" | "paragraph" | "one-line",
    });
    setPreview(result);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
      >
        <span className="text-primary">Format:</span>
        <span>{selected?.name || "Select..."}</span>
        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="max-h-64 overflow-auto">
              {formats.map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => {
                    onSelect(fmt);
                    setOpen(false);
                  }}
                  onMouseEnter={() => handleHover(fmt)}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${
                    fmt.id === selectedId
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-surface-hover"
                  }`}
                >
                  <div>
                    <span className="font-medium">{fmt.name}</span>
                    <span className="text-muted text-xs ml-2">
                      {fmt.description}
                    </span>
                  </div>
                  {fmt.id === selectedId && (
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {preview && (
              <div className="border-t border-border p-3">
                <div className="text-xs uppercase text-muted mb-1">Preview</div>
                <pre className="text-xs text-foreground whitespace-pre-wrap font-mono bg-background rounded p-2">
                  {preview}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
