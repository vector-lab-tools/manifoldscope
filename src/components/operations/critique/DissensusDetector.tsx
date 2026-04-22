"use client";

import { useCallback, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { ProvenanceBindingCard } from "@/components/binding/ProvenanceBindingCard";
import type { DissensusDetectorResult } from "@/types/manifold";

export function DissensusDetector() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<DissensusDetectorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/backend/critique/dissensus-detector", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sample_name: sampleName, k: 20 }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail ?? `Backend error: ${response.status}`);
      }
      setResult((await response.json()) as DissensusDetectorResult);
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
            Dissensus Detector
          </h2>
          <p className="font-body italic text-slate">
            Where does meaning remain volatile under contextual framing?
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
          For each concept in the sample, the probe embeds the bare term
          alongside a battery of contextual framings (political, economic,
          domestic, aesthetic, ecological, public, private) and reports the
          standard deviation of pairwise cosine distances across the framed
          embeddings. High scores mark concepts whose meaning shifts under
          context. Low scores mark concepts the manifold has smoothed into a
          single region.
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
                  color: result.dissensus_field,
                  colorscale: "Cividis",
                  colorbar: { title: { text: "volatility" }, thickness: 10 },
                  showscale: true,
                },
                hovertemplate:
                  "<b>%{text}</b><br>dissensus σ: %{marker.color:.3f}<extra></extra>",
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
              title="Most volatile"
              subtitle="Largest contextual spread; meaning remains contested."
              items={result.most_volatile}
            />
            <Region
              title="Most stable"
              subtitle="Smallest contextual spread; meaning has been smoothed."
              items={result.most_stable}
            />
          </div>

          <ProvenanceBadge record={result.provenance} />

          <DeepDivePanel>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Method
                </h4>
                <p>
                  For each concept, {result.summary.n_templates} framed
                  variants are embedded in a single batch. The dissensus
                  score is the standard deviation of pairwise cosine
                  distances across the framed variants.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Summary
                </h4>
                <p>
                  Mean dissensus {result.summary.mean_dissensus.toFixed(3)},
                  median {result.summary.median_dissensus.toFixed(3)}, range{" "}
                  {result.summary.min_dissensus.toFixed(3)} –{" "}
                  {result.summary.max_dissensus.toFixed(3)}.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Templates ({result.templates.length})
                </h4>
                <ul className="list-inside list-disc font-mono text-body-sm text-charcoal">
                  {result.templates.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
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

function Region({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: { item: string; score: number }[];
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
