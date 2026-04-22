"use client";

import { useCallback, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { Plot2DWrapper } from "@/components/viz/Plot2DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { ProvenanceBindingCard } from "@/components/binding/ProvenanceBindingCard";
import type { TemporalSedimentationResult } from "@/types/manifold";

// Earth-tone ramp reading from oldest (earth) to newest (sky).
const PERIOD_PALETTE = [
  "#6b4226", // pre-1950 — earth brown
  "#8a6b3a", // 1950s-1970s — bronze
  "#a38a4c", // 1970s-1990s — amber
  "#8a9e7a", // 1990s-2000s — mossy green
  "#5a7a7a", // 2000s-2010s — slate blue
  "#3a6a8a", // 2010s-2020s — ocean
  "#2a4a7a", // 2020s — deep blue
];

export function TemporalSedimentation() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<TemporalSedimentationResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/backend/critique/temporal-sedimentation",
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
      setResult((await response.json()) as TemporalSedimentationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [sampleName]);

  const dominantIdx =
    result?.dominant_period.map((p) => result.periods.indexOf(p)) ?? [];

  return (
    <section className="card-editorial p-6">
      <header className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-display-lg text-ink">
            Temporal Sedimentation
          </h2>
          <p className="font-body italic text-slate">
            Which period&apos;s vocabulary sits closest to each concept?
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
          of each period&apos;s marker vocabulary (pre-1950, 1950s–1970s,
          1970s–1990s, 1990s–2000s, 2000s–2010s, 2010s–2020s, 2020s) and
          softmax into a distribution. The result is the concept&apos;s
          temporal sediment: where in Anglophone technical / media discourse
          its geometric neighbourhood sits.
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
                  (item, i) => `${item} · ${result.dominant_period[i]}`,
                ),
                textposition: "top center",
                textfont: { size: 9, color: "#434343" },
                marker: {
                  size: 5,
                  color: dominantIdx,
                  colorscale: result.periods.map((_, i) => [
                    i / Math.max(1, result.periods.length - 1),
                    PERIOD_PALETTE[i % PERIOD_PALETTE.length],
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

          <h3 className="font-display text-display-md text-ink mt-6 mb-2">
            Sample-wide sedimentation profile
          </h3>
          <Plot2DWrapper
            height={260}
            data={[
              {
                type: "bar",
                x: result.periods,
                y: result.aggregate_distribution,
                marker: {
                  color: result.periods.map(
                    (_, i) => PERIOD_PALETTE[i % PERIOD_PALETTE.length],
                  ),
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
                  Softmax temperature {result.parameters.temperature}. The
                  operation does not prove that a given period&apos;s texts
                  were in the training corpus; it reports that the concept
                  sits geometrically closest to that period&apos;s marker
                  vocabulary.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Legend
                </h4>
                <ul className="flex flex-wrap gap-x-4 gap-y-1">
                  {result.periods.map((p, i) => (
                    <li key={p} className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        style={{
                          width: 10,
                          height: 10,
                          display: "inline-block",
                          background:
                            PERIOD_PALETTE[i % PERIOD_PALETTE.length],
                        }}
                      />
                      <span className="font-mono text-body-sm">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Per-concept dominant period (first 40)
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
                          {row.dominant_period}
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
