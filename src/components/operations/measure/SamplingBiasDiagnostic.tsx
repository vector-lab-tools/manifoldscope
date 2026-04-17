"use client";

import { useCallback, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import type { SamplingBiasResult } from "@/types/manifold";

export function SamplingBiasDiagnostic() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<SamplingBiasResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/backend/measure/sampling-bias", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sample_name: sampleName,
          k: 20,
          n_bootstrap: 50,
          seed: 0,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail ?? `Backend error: ${response.status}`);
      }
      setResult((await response.json()) as SamplingBiasResult);
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
            Sampling-Bias Diagnostic
          </h2>
          <p className="font-body italic text-slate">
            How much of the apparent geometry is the sample, how much is the
            manifold?
          </p>
        </div>
        <button
          className="btn-editorial-primary"
          onClick={run}
          disabled={loading || !backendReachable}
        >
          {loading ? "Bootstrapping…" : result ? "Recompute" : "Run"}
        </button>
      </header>

      {error && (
        <div className="mb-4 border border-error-500 bg-error-50 p-3 font-sans text-body-sm text-error-600">
          {error}
        </div>
      )}

      {!result && !error && !loading && (
        <p className="font-body text-body-sm text-slate">
          Resample the sample with replacement N times, recompute local TwoNN
          on each draw, report the per-point standard deviation. Points with
          high bootstrap variance are unstable under resampling; their local
          ID depends on which neighbours happened to be in the sample. The
          diagnostic is slow by design (50 bootstraps × full local TwoNN).
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
                  color: result.bootstrap_std_id.map((v) =>
                    v === null ? 0 : v,
                  ),
                  colorscale: "Hot",
                  reversescale: true,
                  colorbar: {
                    title: { text: "bootstrap σ" },
                    thickness: 10,
                  },
                  showscale: true,
                },
                hovertemplate:
                  "<b>%{text}</b><br>σ: %{marker.color:.2f}<extra></extra>",
              },
            ]}
          />

          <div className="mt-4 grid grid-cols-2 gap-4 font-sans text-body-sm text-charcoal sm:grid-cols-4">
            <Stat
              label="Median σ"
              value={result.summary.median_std?.toFixed(2) ?? "—"}
            />
            <Stat
              label="Mean σ"
              value={result.summary.mean_std?.toFixed(2) ?? "—"}
            />
            <Stat
              label="Max σ"
              value={result.summary.max_std?.toFixed(2) ?? "—"}
            />
            <Stat
              label="Stability score"
              value={result.provenance.stability_score?.toFixed(3) ?? "—"}
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
                  {result.parameters.estimator}. Each of the{" "}
                  {result.parameters.n_bootstrap} bootstraps draws n indices
                  with replacement, runs local TwoNN on the resampled
                  embeddings (k = {result.parameters.k}), and records each
                  original point&apos;s local ID for every draw in which it
                  appears. The per-point σ is the standard deviation across
                  those appearances. Points with low coverage (appearing in
                  few bootstraps) return NaN.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Coverage
                </h4>
                <p>
                  Mean coverage across the sample:{" "}
                  {(result.summary.mean_coverage * 100).toFixed(1)}% of
                  bootstraps. {result.summary.n_valid_points} of{" "}
                  {result.items.length} points have σ defined (appeared in ≥ 2
                  bootstraps).
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Stability score
                </h4>
                <p>
                  Reported in the provenance record as 1 / (1 + mean σ); a
                  compact scalar for comparing runs. Higher is more stable.
                  This is a deliberately simple summary; a fuller stability
                  characterisation lands with Phase 1a.2.
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
