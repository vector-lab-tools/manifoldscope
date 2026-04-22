"use client";

import { useCallback, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { ProvenanceBindingCard } from "@/components/binding/ProvenanceBindingCard";
import type { MetricArchaeologyResult } from "@/types/manifold";

export function MetricArchaeology() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<MetricArchaeologyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/backend/critique/metric-archaeology",
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
      setResult((await response.json()) as MetricArchaeologyResult);
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
            Metric Archaeology
          </h2>
          <p className="font-body italic text-slate">
            Where do two embedders disagree about what sits close?
          </p>
        </div>
        <button
          className="btn-editorial-primary"
          onClick={run}
          disabled={loading || !backendReachable}
          title={
            backendReachable
              ? "Loads a second embedder. First run will download model weights."
              : "Backend offline"
          }
        >
          {loading ? "Aligning…" : result ? "Recompute" : "Run"}
        </button>
      </header>

      {error && (
        <div className="mb-4 border border-error-500 bg-error-50 p-3 font-sans text-body-sm text-error-600">
          {error}
        </div>
      )}

      {!result && !error && !loading && (
        <p className="font-body text-body-sm text-slate">
          Embeds the sample under two open-weight embedders (default: MiniLM
          as primary, MPNet as comparison) and reports (1) the orthogonal
          Procrustes residual between the two manifolds after optimal
          rotation and scale, and (2) the per-point Jaccard-based
          neighbourhood deformation (1 − |shared kNN| / |union kNN|).
          Points with high deformation are in regions where the two
          manifolds disagree most about what sits close. Running this for
          the first time will download the comparison model weights.
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
                  color: result.deformation_field,
                  colorscale: "YlOrRd",
                  cmin: 0,
                  cmax: 1,
                  colorbar: {
                    title: { text: "kNN deform." },
                    thickness: 10,
                  },
                  showscale: true,
                },
                hovertemplate:
                  "<b>%{text}</b><br>1 − Jaccard(kNN): %{marker.color:.3f}<extra></extra>",
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
              label="Mean deformation"
              value={result.deformation_summary.mean_deformation.toFixed(3)}
            />
            <Stat
              label="Median"
              value={result.deformation_summary.median_deformation.toFixed(3)}
            />
            <Stat
              label="Procrustes (norm.)"
              value={result.procrustes.normalised_residual.toFixed(3)}
            />
            <Stat
              label="Fully preserved"
              value={`${(
                result.deformation_summary.fraction_fully_preserved * 100
              ).toFixed(1)}%`}
            />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Region
              title="Most deformed"
              subtitle="Two embedders disagree most about these neighbourhoods."
              items={result.most_deformed}
            />
            <Region
              title="Most preserved"
              subtitle="Neighbourhoods that survive re-embedding intact."
              items={result.most_preserved}
            />
          </div>

          <ProvenanceBadge record={result.provenance} />

          <DeepDivePanel>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Embedders
                </h4>
                <p className="font-mono text-body-sm">
                  primary: {result.parameters.primary_model}
                  <br />
                  comparison: {result.parameters.comparison_model}
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Procrustes alignment
                </h4>
                <p>
                  Residual (unnormalised):{" "}
                  {result.procrustes.residual.toFixed(3)}; normalised by the
                  primary&apos;s centred sum of squares:{" "}
                  {result.procrustes.normalised_residual.toFixed(3)}; optimal
                  scale: {result.procrustes.scale.toFixed(3)}. The smaller
                  the normalised residual the more isometric the two
                  manifolds are after rotation and scale.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Neighbourhood deformation
                </h4>
                <p>
                  k = {result.deformation_summary.k}. The Jaccard index is
                  computed on the k-nearest-neighbour set in each embedding,
                  and 1 − Jaccard gives a deformation score in [0, 1]. This
                  is robust to projection axes since it reads the
                  neighbour-set composition, not the coordinates. Fully
                  deformed (all neighbours different):{" "}
                  {(
                    result.deformation_summary.fraction_fully_deformed * 100
                  ).toFixed(1)}
                  %.
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
  items: { item: string; deformation: number }[];
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
              {row.deformation.toFixed(3)}
            </span>
          </li>
        ))}
      </ul>
    </div>
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
