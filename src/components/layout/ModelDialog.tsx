// SPDX-License-Identifier: GPL-3.0-or-later
"use client";

import { useEffect, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";

/**
 * Free-text model override. Any sentence-transformers or Hugging Face
 * embedding model id is accepted, so the instrument stays usable when a
 * default model is withdrawn or renamed upstream.
 */
export function ModelDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Mounted only while open, so the drafts start from the saved values each time.
  return <ModelDialogBody onClose={onClose} />;
}

function ModelDialogBody({ onClose }: { onClose: () => void }) {
  const {
    modelId,
    setModelId,
    comparisonModelId,
    setComparisonModelId,
    backendStatus,
  } = useManifold();
  const [draft, setDraft] = useState(modelId);
  const [comparisonDraft, setComparisonDraft] = useState(comparisonModelId);

  const defaultModel =
    backendStatus?.default_model_id ?? "sentence-transformers/all-MiniLM-L6-v2";
  const defaultComparison =
    backendStatus?.default_comparison_model_id ??
    "sentence-transformers/all-mpnet-base-v2";

  const save = () => {
    setModelId(draft);
    setComparisonModelId(comparisonDraft);
    onClose();
  };

  const reset = () => {
    setDraft("");
    setComparisonDraft("");
    setModelId("");
    setComparisonModelId("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/30 px-4 pt-24 animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="model-dialog-title"
        className="card-editorial w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="model-dialog-title"
          className="font-display text-body-lg font-bold text-ink"
        >
          Embedding model
        </h2>
        <p className="mt-2 text-body-sm text-slate">
          Type any sentence-transformers or Hugging Face embedding model id.
          Leave a field blank to use the backend default. The first run with a
          new model downloads it, which can take a minute.
        </p>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <label className="block">
            <span className="text-caption uppercase tracking-wide text-slate">
              Model (all operations)
            </span>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={defaultModel}
              spellCheck={false}
              autoComplete="off"
              autoFocus
              className="mt-1 w-full rounded border border-parchment px-3 py-2 font-mono text-body-sm text-ink placeholder:text-slate/60 focus:border-ink focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-caption uppercase tracking-wide text-slate">
              Comparison model (Metric Archaeology)
            </span>
            <input
              type="text"
              value={comparisonDraft}
              onChange={(e) => setComparisonDraft(e.target.value)}
              placeholder={defaultComparison}
              spellCheck={false}
              autoComplete="off"
              className="mt-1 w-full rounded border border-parchment px-3 py-2 font-mono text-body-sm text-ink placeholder:text-slate/60 focus:border-ink focus:outline-none"
            />
          </label>

          <p className="text-caption text-slate">
            Examples: <code>BAAI/bge-small-en-v1.5</code>,{" "}
            <code>intfloat/multilingual-e5-large</code>,{" "}
            <code>Qwen/Qwen3-Embedding-0.6B</code>
          </p>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={reset}
              className="text-caption uppercase tracking-wide text-slate hover:text-ink"
            >
              Reset to defaults
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-parchment px-4 py-1.5 text-body-sm text-slate hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-burgundy px-4 py-1.5 text-body-sm text-white hover:opacity-90"
              >
                Use model
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
