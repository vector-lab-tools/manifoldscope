"use client";

import { useCallback, useMemo, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import type {
  ProjectionDistortionResult,
  ProjectionEntry,
} from "@/types/manifold";

const METHOD_LABELS: Record<ProjectionEntry["method"], string> = {
  pca: "PCA",
  umap: "UMAP",
  tsne: "t-SNE",
  pacmap: "PaCMAP",
  isomap: "Isomap",
};

export function ProjectionDistortionMeter() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<ProjectionDistortionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/backend/measure/projection-distortion",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sample_name: sampleName, n_neighbors: 10 }),
        },
      );
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail ?? `Backend error: ${response.status}`);
      }
      setResult((await response.json()) as ProjectionDistortionResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [sampleName]);

  const available = useMemo(
    () => result?.projections.filter((p) => p.available) ?? [],
    [result],
  );
  const unavailable = useMemo(
    () => result?.projections.filter((p) => !p.available) ?? [],
    [result],
  );

  return (
    <section className="card-editorial p-6">
      <header className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-display-lg text-ink">
            Projection-Distortion Meter
          </h2>
          <p className="font-body italic text-slate">
            Five projections of the same manifold, side by side. No single
            projection is neutral.
          </p>
        </div>
        <button
          className="btn-editorial-primary"
          onClick={run}
          disabled={loading || !backendReachable}
        >
          {loading ? "Computing…" : result ? "Recompute" : "Run"}
        </button>
      </header>

      {error && (
        <div className="mb-4 border border-error-500 bg-error-50 p-3 font-sans text-body-sm text-error-600">
          {error}
        </div>
      )}

      {!result && !error && !loading && (
        <p className="font-body text-body-sm text-slate">
          For the same manifold, compute five projections (PCA, UMAP, t-SNE,
          PaCMAP, Isomap) and score each with a normalised stress (global
          distance preservation) and a trustworthiness score (local neighbour
          preservation). The instrument&apos;s point is not to pick a winner
          but to make the non-neutrality of projection visible.
        </p>
      )}

      {result && (
        <>
          {/* Score summary */}
          <ScoreTable
            result={result}
            available={available}
            unavailable={unavailable}
          />

          {/* Side-by-side scatter grid */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {available.map((entry) => (
              <figure
                key={entry.method}
                className="border border-parchment bg-background p-3"
              >
                <figcaption className="mb-2 font-display text-display-md text-ink">
                  {METHOD_LABELS[entry.method]}
                </figcaption>
                <Plot3DWrapper
                  height={320}
                  data={[
                    {
                      type: "scatter3d",
                      mode: "markers",
                      x: entry.coords_3d.map((p) => p[0]),
                      y: entry.coords_3d.map((p) => p[1]),
                      z: entry.coords_3d.map((p) => p[2]),
                      text: result.items,
                      marker: { size: 3, color: "#6b2832", opacity: 0.7 },
                      hovertemplate: "<b>%{text}</b><extra></extra>",
                    },
                  ]}
                />
                <div className="mt-2 flex justify-between font-sans text-caption uppercase tracking-wide text-slate">
                  <span>
                    stress{" "}
                    <span className="normal-case tracking-normal text-charcoal">
                      {entry.stress === null ? "—" : entry.stress.toFixed(3)}
                    </span>
                  </span>
                  <span>
                    trust{" "}
                    <span className="normal-case tracking-normal text-charcoal">
                      {entry.trustworthiness === null
                        ? "—"
                        : entry.trustworthiness.toFixed(3)}
                    </span>
                  </span>
                </div>
              </figure>
            ))}
          </div>

          <ProvenanceBadge record={result.provenance} />

          <DeepDivePanel>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Scoring
                </h4>
                <p>
                  Normalised stress = Σ (d_high − d_low)² / Σ d_high²; zero
                  means distances are preserved, larger means global structure
                  is distorted. Trustworthiness (Venna and Kaski 2001) is the
                  fraction of k-nearest neighbours preserved in the projection.
                  Neighbourhood size k = {result.parameters.n_neighbors}.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Per-method notes
                </h4>
                <ul className="font-mono text-body-sm">
                  {result.projections.map((p) => (
                    <li
                      key={p.method}
                      className="flex justify-between border-b border-parchment/60 py-0.5"
                    >
                      <span className="text-charcoal">
                        {METHOD_LABELS[p.method]}
                      </span>
                      <span className="text-slate">{p.notes}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Sample partiality
                </h4>
                <p className="whitespace-pre-line text-slate">
                  {result.provenance.notes || "—"}
                </p>
              </div>
            </div>
          </DeepDivePanel>
        </>
      )}
    </section>
  );
}

function ScoreTable({
  result,
  available,
  unavailable,
}: {
  result: ProjectionDistortionResult;
  available: ProjectionEntry[];
  unavailable: ProjectionEntry[];
}) {
  return (
    <div className="mb-4">
      <h3 className="font-display text-display-md text-ink mb-2">
        Stress and trustworthiness
      </h3>
      <p className="mb-3 font-body text-body-sm italic text-slate">
        {result.summary.n_methods_available} of {result.summary.n_methods_total}{" "}
        projections available. Lowest stress:{" "}
        <strong>{result.summary.lowest_stress_method ?? "—"}</strong>
        {result.summary.lowest_stress_score !== null
          ? ` (${result.summary.lowest_stress_score.toFixed(3)})`
          : ""}
        . Best trustworthiness:{" "}
        <strong>{result.summary.best_trustworthiness_method ?? "—"}</strong>
        {result.summary.best_trustworthiness_score !== null
          ? ` (${result.summary.best_trustworthiness_score.toFixed(3)})`
          : ""}
        .
      </p>
      <table className="w-full font-mono text-body-sm">
        <thead>
          <tr className="border-b border-parchment text-left text-caption uppercase tracking-wide text-slate">
            <th className="py-1 pr-4 font-normal">Method</th>
            <th className="py-1 pr-4 text-right font-normal">Stress</th>
            <th className="py-1 pr-4 text-right font-normal">Trustworthiness</th>
            <th className="py-1 font-normal">Notes</th>
          </tr>
        </thead>
        <tbody>
          {available.map((entry) => (
            <tr key={entry.method} className="border-b border-parchment/60">
              <td className="py-1 pr-4">{METHOD_LABELS[entry.method]}</td>
              <td className="py-1 pr-4 text-right tabular-nums">
                {entry.stress === null ? "—" : entry.stress.toFixed(3)}
              </td>
              <td className="py-1 pr-4 text-right tabular-nums">
                {entry.trustworthiness === null
                  ? "—"
                  : entry.trustworthiness.toFixed(3)}
              </td>
              <td className="py-1 text-slate">{entry.notes}</td>
            </tr>
          ))}
          {unavailable.map((entry) => (
            <tr key={entry.method} className="border-b border-parchment/60">
              <td className="py-1 pr-4 text-slate italic">
                {METHOD_LABELS[entry.method]}
              </td>
              <td className="py-1 pr-4 text-right text-slate">—</td>
              <td className="py-1 pr-4 text-right text-slate">—</td>
              <td className="py-1 text-slate italic">{entry.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
