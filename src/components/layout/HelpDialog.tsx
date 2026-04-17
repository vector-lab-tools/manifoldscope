"use client";

import { useEffect } from "react";
import { VERSION } from "@/lib/version";

const FAMILY_URL = "https://vector-lab-tools.github.io";

export function HelpDialog({
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card-editorial relative max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 font-sans text-caption uppercase tracking-widest text-slate hover:text-ink"
          aria-label="Close"
        >
          × close
        </button>

        {/* Branding block */}
        <div className="mb-6 flex flex-col items-center text-center border-b border-parchment pb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/vector-lab.svg"
            alt="Manifoldscope icon"
            width={64}
            height={64}
            className="mb-3"
          />
          <h2 className="font-display text-display-xl text-ink">
            Manifoldscope
          </h2>
          <p className="font-body text-body-sm italic text-slate">
            Intensive reading of a single manifold, in two registers.
          </p>
          <p className="mt-3 font-sans text-caption uppercase tracking-widest text-slate">
            Part of{" "}
            <a
              href={FAMILY_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="text-burgundy hover:underline"
            >
              Vector Lab
            </a>{" "}
            · v{VERSION}
          </p>
        </div>

        {/* About */}
        <section className="mb-6 font-body text-body text-charcoal">
          <h3 className="font-display text-display-md text-ink mb-2">
            About
          </h3>
          <p className="mb-3">
            Manifoldscope reads a single manifold intensively, in two
            registers. <strong>Measure</strong> characterises the manifold as
            an intrinsic geometric object (intrinsic dimension, curvature,
            geodesic structure, density, topology, sampling bias).{" "}
            <strong>Critique</strong> reads the same manifold as an
            ideological object through manifold-wide probes (ideological
            topography, hegemonic gravity, market colonisation, normative
            transition). The binding commitment is that every Critique
            finding renders alongside a Measure attestation for the same
            region.
          </p>
          <p>
            Without that binding, cosine differences of small magnitude
            cannot be reliably distinguished from projection artefacts.
            Manifoldscope is the instrument for the intensive reading that
            Manifold Atlas&apos;s comparative concept-level tests rely on.
          </p>
        </section>

        {/* Vector Lab family */}
        <section className="mb-6 font-body text-body text-charcoal">
          <h3 className="font-display text-display-md text-ink mb-2">
            Vector Lab family
          </h3>
          <p className="mb-3">
            The Vector Lab is a family of research instruments for critical
            vector theory, sharing an editorial design system, a
            provenance grammar, and an open-weight-friendly methodology.
            They diverge in their object:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <a
                href="https://github.com/vector-lab-tools/manifold-atlas"
                target="_blank"
                rel="noreferrer noopener"
                className="text-burgundy hover:underline"
              >
                Manifold Atlas
              </a>{" "}
              — comparative, between models
            </li>
            <li>
              <a
                href="https://github.com/vector-lab-tools/vectorscope"
                target="_blank"
                rel="noreferrer noopener"
                className="text-burgundy hover:underline"
              >
                Vectorscope
              </a>{" "}
              — forensic, within a single open-weight model
            </li>
            <li>
              <a
                href="https://github.com/vector-lab-tools/theoryscope"
                target="_blank"
                rel="noreferrer noopener"
                className="text-burgundy hover:underline"
              >
                Theoryscope
              </a>{" "}
              — corpus geometry with RG method
            </li>
            <li>
              <a
                href="https://github.com/vector-lab-tools/LLMbench"
                target="_blank"
                rel="noreferrer noopener"
                className="text-burgundy hover:underline"
              >
                LLMbench
              </a>{" "}
              — close reading of model outputs as prose
            </li>
            <li>
              <strong>Manifoldscope</strong> — intensive, single manifold as
              object
            </li>
          </ul>
        </section>

        {/* Running */}
        <section className="font-body text-body text-charcoal">
          <h3 className="font-display text-display-md text-ink mb-2">
            Running
          </h3>
          <p>
            Two processes are required. The FastAPI backend on
            localhost:8000 (from <span className="font-mono">backend/</span>:{" "}
            <span className="font-mono">./setup.sh</span> then{" "}
            <span className="font-mono">
              uvicorn main:app --reload --port 8000
            </span>
            ). The Next.js frontend on localhost:3000 (
            <span className="font-mono">npm run dev</span>). The header
            indicator goes green when both are up.
          </p>
        </section>

        <p className="mt-6 text-center font-sans text-caption uppercase tracking-widest text-slate">
          Concept and design: David M. Berry, University of Sussex ·{" "}
          <a
            href={FAMILY_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-ink"
          >
            vector-lab-tools.github.io
          </a>
        </p>
      </div>
    </div>
  );
}
