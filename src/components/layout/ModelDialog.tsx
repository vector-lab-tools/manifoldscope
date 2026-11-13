// SPDX-License-Identifier: GPL-3.0-or-later
"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [confirming, setConfirming] = useState(false);

  const dirty =
    draft.trim() !== modelId || comparisonDraft.trim() !== comparisonModelId;

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

  const requestClose = useCallback(() => {
    if (dirty) setConfirming(true);
    else onClose();
  }, [dirty, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (confirming) setConfirming(false);
      else requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming, requestClose]);

  const inputClass =
    "mt-1 w-full rounded border border-parchment px-3 py-2 font-mono text-body-sm text-ink placeholder:text-slate/60 focus:border-ink focus:outline-none";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 animate-fade-in"
      onClick={requestClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="model-dialog-title"
        className="card-editorial relative flex max-h-[90vh] w-full max-w-lg flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-parchment px-6 py-4">
          <h2
            id="model-dialog-title"
            className="font-display text-display-md text-ink"
          >
            Embedding model
          </h2>
          <button
            onClick={requestClose}
            className="font-sans text-caption uppercase tracking-widest text-slate hover:text-ink"
            aria-label="Close"
          >
            × close
          </button>
        </div>

        <form
          id="model-form"
          className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <p className="text-body-sm text-slate">
            Type any sentence-transformers or Hugging Face embedding model id.
            Leave a field blank to use the backend default. The first run with a
            new model downloads it, which can take a minute.
          </p>

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
              className={inputClass}
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
              className={inputClass}
            />
          </label>

          <p className="text-caption text-slate">
            Examples: <code>BAAI/bge-small-en-v1.5</code>,{" "}
            <code>sentence-transformers/all-MiniLM-L12-v2</code>,{" "}
            <code>sentence-transformers/all-mpnet-base-v2</code>
          </p>

          <button
            type="button"
            onClick={() => {
              setDraft("");
              setComparisonDraft("");
            }}
            className="text-caption uppercase tracking-wide text-slate hover:text-ink"
          >
            Clear to defaults
          </button>
        </form>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-parchment px-6 py-3">
          <span className="text-caption text-burgundy" aria-live="polite">
            {dirty ? "Unsaved changes" : ""}
          </span>
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
              form="model-form"
              className="rounded bg-burgundy px-4 py-1.5 text-body-sm text-white hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>

        {confirming && (
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="model-confirm-title"
            className="absolute inset-0 flex items-center justify-center rounded bg-ink/20 p-6"
          >
            <div className="card-editorial w-full max-w-sm p-5">
              <p id="model-confirm-title" className="text-body text-ink">
                You have unsaved changes to the model settings.
              </p>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setConfirming(false)}
                  className="rounded border border-parchment px-3 py-1.5 text-body-sm text-slate hover:text-ink"
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded border border-parchment px-3 py-1.5 text-body-sm text-slate hover:text-ink"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={save}
                  className="rounded bg-burgundy px-3 py-1.5 text-body-sm text-white hover:opacity-90"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
