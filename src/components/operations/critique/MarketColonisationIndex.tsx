"use client";

import { useCallback, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { ProvenanceBindingCard } from "@/components/binding/ProvenanceBindingCard";
import type { MarketColonisationResult } from "@/types/manifold";

export function MarketColonisationIndex() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<MarketColonisationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/backend/critique/market-colonisation",
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
      const data = (await response.json()) as MarketColonisationResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [sampleName]);

  return (
    <section className="card-editorial p-6">
      <header className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-display-lg text-ink">
            Market-Colonisation Index
          </h2>
          <p className="font-body italic text-slate">
            How far has commercial vocabulary seeped into non-market domains?
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
          Load the default Philosophy of Technology sample, embed the market
          probe list, and compute each sample point&apos;s mean cosine similarity
          to the probe-list centroid. The scatter colours each point by its
          colonisation score. The Measure attestation below the plot binds the
          Critique reading to an independent geometric characterisation of the
          same sample.
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
                  color: result.colonisation_index,
                  colorscale: "RdBu",
                  reversescale: true,
                  colorbar: {
                    title: { text: "colonisation" },
                    thickness: 10,
                  },
                  showscale: true,
                },
                hovertemplate:
                  "<b>%{text}</b><br>score: %{marker.color:.3f}<extra></extra>",
              },
            ]}
          />

          <ProvenanceBindingCard
            stats={result.measure_attestation.summary_statistics}
            estimator={result.measure_attestation.estimator}
            k={result.measure_attestation.k}
          />

          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <Region
              title="Highest colonisation"
              items={result.top_regions}
              subtitle="Closest to market-vocabulary centroid."
            />
            <Region
              title="Lowest colonisation"
              items={result.bottom_regions}
              subtitle="Furthest from the probe list."
            />
          </div>

          <ProvenanceBadge record={result.provenance} />

          <DeepDivePanel>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Probe list ({result.probe_items.length} terms)
                </h4>
                <p className="font-mono text-body-sm text-charcoal">
                  {result.probe_items.join(", ")}
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
                  Measure attestation (local TwoNN ID for the same sample)
                </h4>
                <p className="text-slate">
                  The summary statistics above are computed from the per-point
                  local intrinsic dimension field on the same sample, same
                  embedder, same projection. The Critique reading is defensible
                  only against this geometric backdrop.
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

function Region({
  title,
  items,
  subtitle,
}: {
  title: string;
  items: { item: string; score: number }[];
  subtitle: string;
}) {
  return (
    <div>
      <h3 className="font-display text-display-md text-ink">{title}</h3>
      <p className="mb-2 font-body text-body-sm italic text-slate">
        {subtitle}
      </p>
      <ul className="font-mono text-body-sm">
        {items.map((row) => (
          <li
            key={row.item}
            className="flex justify-between border-b border-parchment/60 py-0.5"
          >
            <span className="truncate">{row.item}</span>
            <span className="tabular-nums text-charcoal">
              {row.score.toFixed(3)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
