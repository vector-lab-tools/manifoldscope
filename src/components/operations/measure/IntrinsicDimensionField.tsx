"use client";

import { useCallback, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import type { IntrinsicDimensionResult } from "@/types/manifold";

export function IntrinsicDimensionField() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<IntrinsicDimensionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/backend/measure/intrinsic-dimension",
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
      const data = (await response.json()) as IntrinsicDimensionResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [sampleName]);

  const validIds =
    result?.local_intrinsic_dimension.filter(
      (v): v is number => v !== null && Number.isFinite(v),
    ) ?? [];

  return (
    <section className="card-editorial p-6">
      <header className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-display-lg text-ink">
            Intrinsic Dimension Field
          </h2>
          <p className="font-body italic text-slate">
            What is the local dimension at each point of the manifold?
          </p>
        </div>
        <button
          className="btn-editorial-primary"
          onClick={run}
          disabled={loading || !backendReachable}
          title={
            backendReachable
              ? "Compute TwoNN intrinsic dimension field"
              : "Backend offline"
          }
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
          Load the default Philosophy of Technology sample and compute the local
          TwoNN intrinsic dimension at every point. The scatter colours each
          point by its local ID; the Deep Dive panel reports the full
          quantitative breakdown.
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
                  color: result.local_intrinsic_dimension.map((v) =>
                    v === null ? 0 : v,
                  ),
                  colorscale: "Viridis",
                  colorbar: { title: { text: "local ID" }, thickness: 10 },
                  showscale: true,
                },
                hovertemplate:
                  "<b>%{text}</b><br>local ID: %{marker.color:.2f}<extra></extra>",
              },
            ]}
          />

          <div className="mt-4 grid grid-cols-2 gap-4 font-sans text-body-sm text-charcoal sm:grid-cols-4">
            <Stat
              label="Mean"
              value={result.summary_statistics.mean?.toFixed(2) ?? "—"}
            />
            <Stat
              label="Median"
              value={result.summary_statistics.median?.toFixed(2) ?? "—"}
            />
            <Stat
              label="Min / Max"
              value={
                result.summary_statistics.min !== null &&
                result.summary_statistics.max !== null
                  ? `${result.summary_statistics.min.toFixed(1)} / ${result.summary_statistics.max.toFixed(1)}`
                  : "—"
              }
            />
            <Stat
              label="Global TwoNN"
              value={
                result.global_intrinsic_dimension?.toFixed(2) ?? "—"
              }
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
                  {result.parameters.estimator}, k = {result.parameters.k}. The
                  local estimator restricts TwoNN to each point&apos;s
                  k-nearest-neighbour ball. {validIds.length} valid estimates
                  from {result.items.length} sampled points.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Explained variance (3D projection)
                </h4>
                <p>
                  PC1 {(result.explained_variance_ratio[0] * 100).toFixed(1)}%
                  {result.explained_variance_ratio[1] !== undefined
                    ? `, PC2 ${(result.explained_variance_ratio[1] * 100).toFixed(1)}%`
                    : ""}
                  {result.explained_variance_ratio[2] !== undefined
                    ? `, PC3 ${(result.explained_variance_ratio[2] * 100).toFixed(1)}%`
                    : ""}
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
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Per-point ID (first 30)
                </h4>
                <ul className="grid grid-cols-1 gap-x-4 font-mono text-body-sm sm:grid-cols-2">
                  {result.items.slice(0, 30).map((item, i) => (
                    <li
                      key={item}
                      className="flex justify-between border-b border-parchment/60 py-0.5"
                    >
                      <span className="truncate">{item}</span>
                      <span className="tabular-nums">
                        {result.local_intrinsic_dimension[i] !== null
                          ? result.local_intrinsic_dimension[i]!.toFixed(2)
                          : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
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
      <dt className="text-caption uppercase tracking-wide text-slate">
        {label}
      </dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
