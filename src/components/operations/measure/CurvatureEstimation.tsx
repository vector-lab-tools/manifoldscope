"use client";

import { useCallback, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import type { CurvatureResult } from "@/types/manifold";

export function CurvatureEstimation() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<CurvatureResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/backend/measure/curvature", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sample_name: sampleName, k: 10 }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail ?? `Backend error: ${response.status}`);
      }
      setResult((await response.json()) as CurvatureResult);
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
            Curvature Estimation
          </h2>
          <p className="font-body italic text-slate">
            Where is the manifold flat, hyperbolic, positively curved?
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
          Forman-Ricci curvature on the k-nearest-neighbour graph, unit
          weights. Positive curvature marks well-connected regions with many
          shared neighbours; negative marks bridges across sparser territory.
          Per-point curvature is the mean of incident edge curvatures.
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
                  color: result.curvature_field.map((v) =>
                    v === null ? 0 : v,
                  ),
                  colorscale: "RdBu",
                  cmid: 0,
                  colorbar: { title: { text: "curvature" }, thickness: 10 },
                  showscale: true,
                },
                hovertemplate:
                  "<b>%{text}</b><br>curvature: %{marker.color:.2f}<extra></extra>",
              },
            ]}
          />

          <div className="mt-4 grid grid-cols-2 gap-4 font-sans text-body-sm text-charcoal sm:grid-cols-4">
            <Stat label="Edges" value={String(result.summary.n_edges)} />
            <Stat
              label="Mean edge"
              value={result.summary.mean_edge_curvature.toFixed(2)}
            />
            <Stat
              label="% negative"
              value={`${(result.summary.fraction_negative * 100).toFixed(1)}%`}
            />
            <Stat
              label="% positive"
              value={`${(result.summary.fraction_positive * 100).toFixed(1)}%`}
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
                  {result.parameters.estimator}. k = {result.parameters.k}. With
                  unit weights, edge curvature collapses to 2 − 2·|shared
                  neighbours|; per-node curvature is the mean of incident edges.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Edge summary
                </h4>
                <p>
                  Min {result.summary.min_edge_curvature.toFixed(2)}, max{" "}
                  {result.summary.max_edge_curvature.toFixed(2)}, mean{" "}
                  {result.summary.mean_edge_curvature.toFixed(2)}. Over{" "}
                  {result.summary.n_edges} undirected edges.
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
