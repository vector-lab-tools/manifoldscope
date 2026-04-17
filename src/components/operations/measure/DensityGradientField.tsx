"use client";

import { useCallback, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import type { DensityGradientResult } from "@/types/manifold";

export function DensityGradientField() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<DensityGradientResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/backend/measure/density-gradient",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sample_name: sampleName, k: 10 }),
        },
      );
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail ?? `Backend error: ${response.status}`);
      }
      setResult((await response.json()) as DensityGradientResult);
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
            Density Gradient Field
          </h2>
          <p className="font-body italic text-slate">
            Where are the dense cores and the sparse shells?
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
          Per-point density estimated from the inverse mean k-nearest-neighbour
          distance in the ambient embedding space. Dense cores are where the
          model has allocated representational space; sparse shells are where
          distinctions thin out.
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
                  color: result.density_field,
                  colorscale: "Inferno",
                  colorbar: { title: { text: "density" }, thickness: 10 },
                  showscale: true,
                },
                hovertemplate:
                  "<b>%{text}</b><br>density: %{marker.color:.3f}<extra></extra>",
              },
            ]}
          />

          <div className="mt-4 grid grid-cols-2 gap-4 font-sans text-body-sm text-charcoal sm:grid-cols-4">
            <Stat label="Mean" value={result.summary.mean_density.toFixed(3)} />
            <Stat label="Median" value={result.summary.median_density.toFixed(3)} />
            <Stat
              label="Range"
              value={`${result.summary.min_density.toFixed(2)} – ${result.summary.max_density.toFixed(2)}`}
            />
            <Stat
              label="Mean kNN dist."
              value={result.summary.mean_knn_distance.toFixed(3)}
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
                  {result.parameters.estimator}, k = {result.parameters.k}.
                  Density = 1 / (mean kNN distance + eps), where eps is a small
                  fraction of the smallest positive distance in the sample. The
                  measure is relative to the sample, not absolute.
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
