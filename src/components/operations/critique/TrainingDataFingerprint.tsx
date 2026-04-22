"use client";

import { useCallback, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { Plot2DWrapper } from "@/components/viz/Plot2DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { ProvenanceBindingCard } from "@/components/binding/ProvenanceBindingCard";
import type { TrainingDataFingerprintResult } from "@/types/manifold";

const PALETTE = [
  "#6b2832", "#b8941e", "#1f77b4", "#2ca02c",
  "#9467bd", "#8c564b", "#e377c2", "#17becf",
];

export function TrainingDataFingerprint() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<TrainingDataFingerprintResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/backend/critique/training-data-fingerprint",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            sample_name: sampleName,
            k: 20,
            temperature: 0.1,
          }),
        },
      );
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail ?? `Backend error: ${response.status}`);
      }
      setResult((await response.json()) as TrainingDataFingerprintResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [sampleName]);

  // Colour each sample point by its dominant genre index.
  const dominantIdx =
    result?.dominant_genre.map((g) => result.genres.indexOf(g)) ?? [];

  return (
    <section className="card-editorial p-6">
      <header className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-display-lg text-ink">
            Training-Data Fingerprinting
          </h2>
          <p className="font-body italic text-slate">
            Which textual register of training data does each concept sit
            closest to?
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
          For each sample concept, compute cosine similarity to the centroid
          of each genre&apos;s marker vocabulary (Wikipedia, Reddit, academic,
          news, legal, literary, technical, corporate) and softmax into a
          distribution. The operation cannot identify which specific corpora
          were in the training data (that is not exposed) but it does reveal
          which genre weighting dominates the geometry of this vocabulary.
        </p>
      )}

      {result && (
        <>
          <Plot3DWrapper
            data={[
              {
                type: "scatter3d",
                mode: "markers+text",
                x: result.coords_3d.map((p) => p[0]),
                y: result.coords_3d.map((p) => p[1]),
                z: result.coords_3d.map((p) => p[2]),
                text: result.items.map(
                  (item, i) => `${item} · ${result.dominant_genre[i]}`,
                ),
                textposition: "top center",
                textfont: { size: 9, color: "#434343" },
                marker: {
                  size: 5,
                  color: dominantIdx,
                  colorscale: result.genres.map((_, i) => [
                    i / Math.max(1, result.genres.length - 1),
                    PALETTE[i % PALETTE.length],
                  ]),
                  showscale: false,
                },
                hovertemplate: "<b>%{text}</b><extra></extra>",
              },
            ]}
          />

          <ProvenanceBindingCard
            stats={result.measure_attestation.summary_statistics}
            estimator={result.measure_attestation.estimator}
            k={result.measure_attestation.k}
          />

          {/* Aggregate genre bar chart */}
          <h3 className="font-display text-display-md text-ink mt-6 mb-2">
            Sample-wide aggregate
          </h3>
          <Plot2DWrapper
            height={260}
            data={[
              {
                type: "bar",
                x: result.genres,
                y: result.aggregate_distribution,
                marker: {
                  color: result.genres.map((_, i) => PALETTE[i % PALETTE.length]),
                },
                hovertemplate: "%{x}: %{y:.3f}<extra></extra>",
              },
            ]}
            layout={{
              xaxis: { tickangle: -30 },
              yaxis: { title: { text: "mean probability" } },
            }}
          />

          <ProvenanceBadge record={result.provenance} />

          <DeepDivePanel>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Method
                </h4>
                <p>
                  Softmax temperature {result.parameters.temperature}; smaller
                  = sharper distributions (one genre dominates each concept),
                  larger = flatter. Probability reflects geometric proximity
                  to each genre&apos;s marker centroid, not any corpus-level
                  identification claim.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Legend
                </h4>
                <ul className="flex flex-wrap gap-x-4 gap-y-1">
                  {result.genres.map((g, i) => (
                    <li key={g} className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        style={{
                          width: 10,
                          height: 10,
                          display: "inline-block",
                          background: PALETTE[i % PALETTE.length],
                        }}
                      />
                      <span className="font-mono text-body-sm">{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Per-concept dominant genre (first 40)
                </h4>
                <table className="w-full font-mono text-body-sm">
                  <thead>
                    <tr className="border-b border-parchment text-left text-caption uppercase tracking-wide text-slate">
                      <th className="py-1 pr-4 font-normal">Concept</th>
                      <th className="py-1 font-normal">Dominant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.per_point.slice(0, 40).map((row) => (
                      <tr
                        key={row.item}
                        className="border-b border-parchment/60"
                      >
                        <td className="py-0.5 pr-4 truncate">{row.item}</td>
                        <td className="py-0.5 text-charcoal">
                          {row.dominant_genre}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Probe partiality note
                </h4>
                <p className="whitespace-pre-line text-slate">
                  {result.provenance.probe?.partiality_note ?? "—"}
                </p>
              </div>
            </div>
          </DeepDivePanel>
        </>
      )}
    </section>
  );
}
