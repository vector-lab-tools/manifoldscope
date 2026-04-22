"use client";

import { useCallback, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { ProvenanceBindingCard } from "@/components/binding/ProvenanceBindingCard";
import type { SynonymicErosionResult } from "@/types/manifold";

export function SynonymicErosion() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<SynonymicErosionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/backend/critique/synonymic-erosion",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sample_name: sampleName, k: 20 }),
        },
      );
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail ?? `Backend error: ${response.status}`);
      }
      setResult((await response.json()) as SynonymicErosionResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [sampleName]);

  const sortedPairs = result
    ? [...result.per_pair].sort((a, b) => a.distance - b.distance)
    : [];

  return (
    <section className="card-editorial p-6">
      <header className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-display-lg text-ink">
            Synonymic Erosion
          </h2>
          <p className="font-body italic text-slate">
            Which distinctions has the manifold collapsed into near-synonyms?
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
          For each curated pair of distinction-bearing terms, embed both and
          measure the cosine distance. Small distances indicate the manifold
          has collapsed a distinction that critical theory treats as
          substantive (citizen / consumer, care / service, liberation /
          freedom, …). The sample-level erosion score is the mean cosine
          similarity across pairs: higher means more collapse.
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
                text: result.items,
                textposition: "top center",
                textfont: { size: 9, color: "#434343" },
                marker: {
                  size: 5,
                  color: result.sample_left_similarity,
                  colorscale: "YlGnBu",
                  colorbar: { title: { text: "sim → term_a" }, thickness: 10 },
                  showscale: true,
                },
                hovertemplate:
                  "<b>%{text}</b><br>sim to term_a centroid: %{marker.color:.3f}<extra></extra>",
              },
            ]}
          />

          <ProvenanceBindingCard
            stats={result.measure_attestation.summary_statistics}
            estimator={result.measure_attestation.estimator}
            k={result.measure_attestation.k}
          />

          <div className="mt-6 grid grid-cols-2 gap-4 font-sans text-body-sm text-charcoal sm:grid-cols-4">
            <Stat
              label="Erosion score"
              value={result.summary.erosion_score.toFixed(3)}
            />
            <Stat
              label="Mean distance"
              value={result.summary.mean_distance.toFixed(3)}
            />
            <Stat
              label="Max cosine"
              value={result.summary.max_cosine.toFixed(3)}
            />
            <Stat
              label="Pairs"
              value={String(result.summary.n_pairs)}
            />
          </div>

          <div className="mt-6">
            <h3 className="font-display text-display-md text-ink">
              Per-pair distances
            </h3>
            <p className="mb-2 font-body text-body-sm italic text-slate">
              Sorted from most collapsed (smallest distance) to most
              preserved.
            </p>
            <table className="w-full font-mono text-body-sm">
              <thead>
                <tr className="border-b border-parchment text-left text-caption uppercase tracking-wide text-slate">
                  <th className="py-1 pr-4 font-normal">term_a</th>
                  <th className="py-1 pr-4 font-normal">term_b</th>
                  <th className="py-1 pr-4 text-right font-normal">
                    Distance
                  </th>
                  <th className="py-1 text-right font-normal">Cosine</th>
                </tr>
              </thead>
              <tbody>
                {sortedPairs.map((pair) => (
                  <tr
                    key={`${pair.term_a}::${pair.term_b}`}
                    className="border-b border-parchment/60"
                  >
                    <td className="py-1 pr-4">{pair.term_a}</td>
                    <td className="py-1 pr-4 text-slate">{pair.term_b}</td>
                    <td className="py-1 pr-4 text-right tabular-nums">
                      {pair.distance.toFixed(3)}
                    </td>
                    <td className="py-1 text-right tabular-nums text-charcoal">
                      {pair.cosine.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ProvenanceBadge record={result.provenance} />

          <DeepDivePanel>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Method
                </h4>
                <p>
                  Per-pair cosine distance 1 − cos(term_a, term_b) on the
                  primary embedder. Sample point colour is each
                  concept&apos;s cosine similarity to the term_a centroid,
                  locating the probe&apos;s term_a vocabulary relative to the
                  sample&apos;s geometry. A diachronic variant (same pairs
                  across multiple model versions) lands when multi-version
                  model access is available.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Probe partiality note
                </h4>
                <p className="whitespace-pre-line text-slate">
                  {result.provenance.probe?.partiality_note ?? "—"}
                </p>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption uppercase tracking-wide text-slate">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
