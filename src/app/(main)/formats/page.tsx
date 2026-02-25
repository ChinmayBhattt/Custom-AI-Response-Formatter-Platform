"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FormatDefinition } from "@/types";
import { enforceFormat } from "@/lib/format-engine/engine";

const PREVIEW_TEXT =
  "React uses a virtual DOM. Components manage their own state. Hooks enable reuse of stateful logic.";

export default function FormatsPage() {
  const [formats, setFormats] = useState<FormatDefinition[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [pattern, setPattern] = useState("{prefix}{point}");
  const [prefix, setPrefix] = useState(">> ");
  const [description, setDescription] = useState("");

  const loadFormats = () => {
    fetch("/api/formats")
      .then((r) => r.json())
      .then((d) => setFormats(d.formats ?? []))
      .catch(() => {});
  };

  useEffect(loadFormats, []);

  const handleCreate = async () => {
    if (!name || !pattern) return;
    await fetch("/api/formats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pattern, prefix, description }),
    });
    setName("");
    setPattern("{prefix}{point}");
    setPrefix(">> ");
    setDescription("");
    setShowCreate(false);
    loadFormats();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/formats?id=${id}`, { method: "DELETE" });
    loadFormats();
  };

  const getPreview = (format: FormatDefinition) => {
    const mode = format.pattern.includes("{text}") ? "paragraph" : "list";
    return enforceFormat({
      raw: PREVIEW_TEXT,
      pattern: format.pattern,
      prefix: format.prefix,
      mode: mode as "list" | "paragraph" | "one-line",
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Format Manager</h1>
          <p className="text-muted text-sm mt-1">
            View built-in formats or create your own custom patterns.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showCreate ? "Cancel" : "Create Format"}
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-foreground">New Custom Format</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted mb-1">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
                    placeholder="My Format"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">Prefix</label>
                  <input
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
                    placeholder=">> "
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">
                  Pattern{" "}
                  <span className="text-xs">
                    (use {"{point}"}, {"{index}"}, {"{prefix}"}, {"{text}"})
                  </span>
                </label>
                <input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm font-mono"
                  placeholder="{prefix}{point}"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex items-center justify-between">
                <pre className="text-xs text-muted font-mono bg-background rounded p-2 flex-1 mr-4 whitespace-pre-wrap">
                  {enforceFormat({
                    raw: PREVIEW_TEXT,
                    pattern,
                    prefix,
                    mode: pattern.includes("{text}") ? "paragraph" : "list",
                  })}
                </pre>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Save Format
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Format list */}
      <div className="grid gap-4">
        {formats.map((fmt) => (
          <motion.div
            key={fmt.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-surface border border-border rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{fmt.name}</span>
                  {fmt.isBuiltIn && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Built-in
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted mt-0.5">{fmt.description}</p>
              </div>
              {!fmt.isBuiltIn && (
                <button
                  onClick={() => handleDelete(fmt.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
            <pre className="text-xs text-foreground/70 font-mono bg-background rounded p-3 whitespace-pre-wrap">
              {getPreview(fmt)}
            </pre>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
