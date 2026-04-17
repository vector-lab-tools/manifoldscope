"use client";

import { useCallback, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { ProvenanceBindingCard } from "@/components/binding/ProvenanceBindingCard";
import type { HegemonicGravityResult } from "@/types/manifold";

export function HegemonicGravityMap() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<HegemonicGravityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/backend/critique/hegemonic-gravity",
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
      setResult((await response.json()) as HegemonicGravityResult);
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
            Hegemonic Gravity Map
          </h2>
          <p className="font-body italic text-slate">
            Which concepts are attractors, and which are peripheral?
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
          For each point, the gravity score is the number of other points that
          list it among their k nearest neighbours, normalised by k. High
          scores are centres of mass on the manifold, loci of hegemonic
          attraction; low scores are peripheral. Asymmetry between "near many"
          and "near by many" is the critical feature.
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
                  size: result.gravity_field.map(
                    (v) => 4 + 10 * (v / (result.summary.max_score || 1)),
                  ),
                  color: result.gravity_field,
                  colorscale: "YlOrRd",
                  colorbar: { title: { text: "gravity" }, thickness: 10 },
                  showscale: true,
                },
                hovertemplate:
                  "<b>%{text}</b><br>score: %{marker.color:.2f}<extra></extra>",
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
              title="Attractors"
              items={result.attractors}
              subtitle="Concepts that many others sit close to."
            />
            <Region
              title="Peripheral"
              items={result.peripheral}
              subtitle="Concepts that few others orbit."
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
                  {result.parameters.method}. k = {result.parameters.k}. The
                  score for point i is |{"{j : i ∈ kNN(j)}"}| / k. Max score
                  is {result.summary.max_score.toFixed(2)}; mean{" "}
                  {result.summary.mean_score.toFixed(2)}; std{" "}
                  {result.summary.std_score.toFixed(2)}.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Reading
                </h4>
                <p>
                  Concepts with high gravity pull the geometry toward them.
                  The reading is not that these concepts are more important
                  in the world, but that the training data put others near
                  them. Attractors are centres of semantic mass, and mass is
                  an artefact of the corpus.
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
              {row.score.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
