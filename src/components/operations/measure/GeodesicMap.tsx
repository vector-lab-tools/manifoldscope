"use client";

import { useCallback, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import type { GeodesicMapResult } from "@/types/manifold";

export function GeodesicMap() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<GeodesicMapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/backend/measure/geodesic-map", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sample_name: sampleName, k: 10 }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail ?? `Backend error: ${response.status}`);
      }
      setResult((await response.json()) as GeodesicMapResult);
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
          <h2 className="font-display text-display-lg text-ink">Geodesic Map</h2>
          <p className="font-body italic text-slate">
            Where does cosine lie about proximity?
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
          Isomap shortest-path geodesic distances on the k-NN graph, compared
          to plain cosine. The per-point field is the mean absolute difference
          (normalised to [0, 1]) between each point&apos;s geodesic and cosine
          distances to every other point. Large delta = cosine most misleading
          at that point.
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
                  color: result.geodesic_cosine_delta.map((v) =>
                    v === null ? 0 : v,
                  ),
                  colorscale: "Plasma",
                  colorbar: { title: { text: "geo−cos Δ" }, thickness: 10 },
                  showscale: true,
                },
                hovertemplate:
                  "<b>%{text}</b><br>delta: %{marker.color:.3f}<extra></extra>",
              },
            ]}
          />

          <div className="mt-4 grid grid-cols-2 gap-4 font-sans text-body-sm text-charcoal sm:grid-cols-4">
            <Stat
              label="Correlation"
              value={result.summary.geodesic_cosine_correlation.toFixed(3)}
            />
            <Stat
              label="Mean delta"
              value={result.summary.mean_delta.toFixed(3)}
            />
            <Stat
              label="Max delta"
              value={result.summary.max_delta.toFixed(3)}
            />
            <Stat
              label="Disc. pairs"
              value={`${result.summary.disconnected_pairs} / ${result.summary.total_pairs}`}
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
                  {result.parameters.method}, k = {result.parameters.k}. Both
                  distance matrices are normalised to [0, 1] before differencing
                  so the delta is scale-free. Global correlation reports how
                  faithful cosine is on average across all pairs.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Disconnected pairs
                </h4>
                <p>
                  {result.summary.disconnected_pairs} of{" "}
                  {result.summary.total_pairs} pairs have infinite geodesic
                  distance because the k-NN graph is not fully connected at
                  k = {result.parameters.k}. Increasing k would reduce this but
                  at the cost of a coarser local structure.
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
