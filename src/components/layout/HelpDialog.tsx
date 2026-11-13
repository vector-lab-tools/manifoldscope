// SPDX-License-Identifier: GPL-3.0-or-later
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { VERSION } from "@/lib/version";

const FAMILY_URL = "https://vector-lab-tools.github.io";
const DOCS_URL = "https://vector-lab-tools.github.io/manifoldscope/";
const REPO_URL = "https://github.com/vector-lab-tools/manifoldscope";
const CONCEPT_DOI = "10.5281/zenodo.23714913";

type HelpTab =
  | "start"
  | "measure"
  | "critique"
  | "atlas"
  | "models"
  | "tips"
  | "about";

const HELP_TABS: readonly { id: HelpTab; label: string }[] = [
  { id: "start", label: "Getting started" },
  { id: "measure", label: "Measure" },
  { id: "critique", label: "Critique" },
  { id: "atlas", label: "Atlas" },
  { id: "models", label: "Models" },
  { id: "tips", label: "Tips" },
  { id: "about", label: "About" },
];

const MEASURE_OPS: readonly [string, string][] = [
  ["Intrinsic Dimension", "What is the local dimension at each point of the manifold? TwoNN estimate per point."],
  ["Curvature", "Where is the manifold flat, hyperbolic, positively curved? Forman-Ricci curvature on the k-NN graph."],
  ["Density", "Where are the dense cores and the sparse shells? Inverse k-NN distance as a density field."],
  ["Geodesic Map", "Where does cosine misstate proximity? Isomap geodesic distance compared with cosine distance."],
  ["Sampling Bias", "How much of the apparent geometry is the sample? Bootstrap resampling over the TwoNN field."],
  ["Void Atlas", "Where are the holes in the manifold, and what bounds them? H0 and H1 persistent homology."],
  ["Projection Distortion", "Five projections of the same manifold side by side, each scored for stress and trustworthiness."],
];

const CRITIQUE_OPS: readonly [string, string][] = [
  ["Ideological Topography", "The political orientation of whole regions, along five contested axes."],
  ["Hegemonic Gravity", "Which concepts are attractors and which are peripheral, by incoming k-NN score."],
  ["Market-Colonisation", "How far commercial vocabulary has entered non-market domains."],
  ["Normative Transition", "Where the manifold passes from is to ought."],
  ["Dissensus Detector", "Where meaning stays volatile under contextual framing."],
  ["Grammatical Ideology", "How far the manifold commits to active or passive framings, on curated pairs."],
  ["Training-Data Fingerprint", "Which register of training text each concept sits closest to."],
  ["Temporal Sedimentation", "Which period's vocabulary sits closest to each concept."],
  ["Synonymic Erosion", "Which distinctions the manifold has collapsed into near-synonyms."],
  ["Metric Archaeology", "Where two embedders disagree about what sits close, after Procrustes alignment."],
];

function Mono({ children }: { children: ReactNode }) {
  return <span className="font-mono text-body-sm">{children}</span>;
}

function OpList({ ops }: { ops: readonly [string, string][] }) {
  return (
    <dl className="space-y-2">
      {ops.map(([name, text]) => (
        <div key={name}>
          <dt className="font-semibold text-ink">{name}</dt>
          <dd className="text-charcoal">{text}</dd>
        </div>
      ))}
    </dl>
  );
}

export function HelpDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<HelpTab>("start");

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        className="card-editorial flex h-[85vh] w-full max-w-4xl flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-parchment px-6 py-4">
          <h2 id="help-title" className="font-display text-display-lg text-ink">
            Help
          </h2>
          <button
            onClick={onClose}
            className="font-sans text-caption uppercase tracking-widest text-slate hover:text-ink"
            aria-label="Close help"
          >
            × close
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <nav
            className="flex shrink-0 gap-1 overflow-x-auto border-b border-parchment p-3 md:w-52 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r"
            aria-label="Help sections"
          >
            {HELP_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`whitespace-nowrap rounded-sm px-3 py-1.5 text-left font-sans text-body-sm transition-colors ${
                  tab === t.id
                    ? "bg-burgundy/10 font-semibold text-burgundy"
                    : "text-slate hover:bg-parchment/40 hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5 font-body text-body text-charcoal">
            {tab === "start" && (
              <>
                <h3 className="font-display text-display-md text-ink">Getting started</h3>
                <p>
                  Manifoldscope runs as two processes. Start the FastAPI backend from{" "}
                  <Mono>backend/</Mono> with <Mono>./setup.sh</Mono> the first time, then{" "}
                  <Mono>uvicorn main:app --reload --port 8000</Mono>. Start the frontend
                  with <Mono>npm run dev</Mono>. The header shows{" "}
                  <strong>backend ready</strong> in green once both are up.
                </p>
                <p>
                  The default sample, a Philosophy of Technology concept list, loads
                  automatically. Open <strong>Measure → Intrinsic Dimension</strong> and
                  press <strong>Run</strong> for a first result. The first run downloads
                  the embedding model, which can take a minute.
                </p>
                <p>
                  No API key is needed: the backend embeds locally with MiniLM through
                  sentence-transformers. To use a different model, click{" "}
                  <strong>Model</strong> in the header (see the Models pane).
                </p>
              </>
            )}

            {tab === "measure" && (
              <>
                <h3 className="font-display text-display-md text-ink">Measure</h3>
                <p>
                  Measure characterises the manifold as a geometric object. Each
                  operation answers one question about its shape.
                </p>
                <OpList ops={MEASURE_OPS} />
              </>
            )}

            {tab === "critique" && (
              <>
                <h3 className="font-display text-display-md text-ink">Critique</h3>
                <p>
                  Critique reads the same manifold as an ideological object. Every
                  Critique result is shown with a Measure attestation computed on the
                  same sample, so a reading can be checked against the local geometry
                  it rests on. Small cosine differences in high-dimensional space are
                  not findings on their own.
                </p>
                <OpList ops={CRITIQUE_OPS} />
              </>
            )}

            {tab === "atlas" && (
              <>
                <h3 className="font-display text-display-md text-ink">Atlas</h3>
                <p>
                  The Atlas will hold curated, pre-run analyses of named samples, each
                  bundled with its provenance record and annotations. It is planned for
                  Phase 4; the tab currently lists the entries in preparation.
                </p>
              </>
            )}

            {tab === "models" && (
              <>
                <h3 className="font-display text-display-md text-ink">Models</h3>
                <p>
                  The default embedder is{" "}
                  <Mono>sentence-transformers/all-MiniLM-L6-v2</Mono>. Metric Archaeology
                  also uses a comparison embedder, by default{" "}
                  <Mono>sentence-transformers/all-mpnet-base-v2</Mono>.
                </p>
                <p>
                  Click <strong>Model</strong> in the header to type any
                  sentence-transformers or Hugging Face embedding model id, for example{" "}
                  <Mono>BAAI/bge-small-en-v1.5</Mono>. The choice is stored in this
                  browser and used for every run. Blank fields, or{" "}
                  <strong>Clear to defaults</strong> then <strong>Save</strong>, return
                  to MiniLM and MPNet.
                </p>
                <p>
                  If a model cannot be loaded, the operation shows the error and names
                  the model; the rest of the instrument keeps working. The backend
                  defaults can also be set with the <Mono>MANIFOLDSCOPE_MODEL_ID</Mono>{" "}
                  and <Mono>MANIFOLDSCOPE_COMPARISON_MODEL_ID</Mono> environment
                  variables.
                </p>
                <p>
                  Hosted providers (OpenAI, Voyage, Google, Cohere, Hugging Face) and
                  their key settings arrive with Phase 2b.
                </p>
              </>
            )}

            {tab === "tips" && (
              <>
                <h3 className="font-display text-display-md text-ink">Tips</h3>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    Every result carries a provenance badge naming the provider, model
                    and dimension it was computed with. Check it after changing model.
                  </li>
                  <li>
                    Open the <strong>Deep Dive</strong> panel at the foot of any
                    operation for the full quantitative breakdown.
                  </li>
                  <li>
                    If the header shows <strong>backend offline</strong>, check the
                    backend terminal, then <Mono>curl http://localhost:8000/status</Mono>.
                  </li>
                  <li>
                    Dialogs close with Escape or a click outside them.
                  </li>
                </ul>
              </>
            )}

            {tab === "about" && (
              <>
                <h3 className="font-display text-display-md text-ink">About</h3>
                <p>
                  Manifoldscope reads a single manifold intensively, in two registers:
                  as a geometric object (Measure) and as an ideological object
                  (Critique). Version {VERSION}. Concept and design: David M. Berry,
                  University of Sussex. Licensed GPL-3.0-or-later.
                </p>
                <p>
                  It is one of the Vector Lab instruments, which share a design system,
                  a provenance grammar and an open-weight-friendly method, and differ in
                  their object: Manifold Atlas compares models, Vectorscope looks inside
                  one open-weight model, Theoryscope maps a corpus, and LLMbench reads
                  model outputs as prose.
                </p>
                <p>
                  Built at Copenhagen Business School, Denmark, during an Otto Mønsted
                  Visiting Professorship in 2026. The support of the Otto Mønsted Fond
                  (grant 25-12-1849) is gratefully acknowledged.
                </p>
                <p className="border-t border-parchment pt-3 text-body-sm">
                  Cite: Berry, D. M. (2026) &lsquo;Vector Theory: Epistemology, Political
                  Economy, and Probabilistic Computation&rsquo;,{" "}
                  <em>Philosophy &amp; Technology</em>, 39.{" "}
                  <a
                    href="https://doi.org/10.1007/s13347-026-01162-w"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-burgundy hover:underline"
                  >
                    doi:10.1007/s13347-026-01162-w
                  </a>
                  . Tool: Manifoldscope v{VERSION},{" "}
                  <a
                    href={`https://doi.org/${CONCEPT_DOI}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-burgundy hover:underline"
                  >
                    doi:{CONCEPT_DOI}
                  </a>
                  .
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-parchment px-6 py-3 font-sans text-caption text-slate">
          <a href={DOCS_URL} target="_blank" rel="noreferrer noopener" className="hover:text-ink">
            Full guide and FAQ
          </a>
          <span aria-hidden="true">·</span>
          <a
            href={FAMILY_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-1.5 hover:text-ink"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/logo-mark.svg" alt="" width={14} height={14} className="h-3.5 w-3.5" />
            Part of the Vector Lab
          </a>
          <span aria-hidden="true">·</span>
          <a href={REPO_URL} target="_blank" rel="noreferrer noopener" className="hover:text-ink">
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
