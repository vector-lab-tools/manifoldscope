"use client";

import { useCallback, useMemo, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { ProvenanceBindingCard } from "@/components/binding/ProvenanceBindingCard";
import type { IdeologicalTopographyResult } from "@/types/manifold";

export function IdeologicalTopography() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<IdeologicalTopographyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAxis, setActiveAxis] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/backend/critique/ideological-topography",
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
      const data = (await response.json()) as IdeologicalTopographyResult;
      setResult(data);
      if (data.axes.length > 0) setActiveAxis(data.axes[0].name);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [sampleName]);

  const current = useMemo(
    () => result?.axes.find((a) => a.name === activeAxis) ?? null,
    [result, activeAxis],
  );

  return (
    <section className="card-editorial p-6">
      <header className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-display-lg text-ink">
            Ideological Topography
          </h2>
          <p className="font-body italic text-slate">
            What is the political orientation of whole regions?
          </p>
        </div>
        <button
          className="btn-editorial-primary"
          onClick={run}
          disabled={loading || !backendReachable}
        >
          {loading ? "Projecting…" : result ? "Recompute" : "Run"}
        </button>
      </header>

      {error && (
        <div className="mb-4 border border-error-500 bg-error-50 p-3 font-sans text-body-sm text-error-600">
          {error}
        </div>
      )}

      {!result && !error && !loading && (
        <p className="font-body text-body-sm text-slate">
          Projects a basis of contested axes onto the sample manifold. For each
          axis the probe defines two poles, and the axis vector is the
          difference of their centroids. Each sample point&apos;s position on
          the axis is its cosine similarity to the unit axis vector. Positive
          leans toward pole A, negative toward pole B.
        </p>
      )}

      {result && current && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {result.axes.map((ax) => (
              <button
                key={ax.name}
                onClick={() => setActiveAxis(ax.name)}
                className={
                  "font-sans text-body-sm px-3 py-1 border rounded-sm transition-colors " +
                  (ax.name === activeAxis
                    ? "bg-burgundy text-primary-foreground border-burgundy"
                    : "bg-transparent text-slate border-parchment-dark hover:text-ink hover:bg-cream")
                }
                title={`${ax.pole_a_items[0]} … vs … ${ax.pole_b_items[0]}`}
              >
                {ax.name.replace(/_/g, " ")}
              </button>
            ))}
          </div>

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
                  color: current.positions,
                  colorscale: "RdBu",
                  cmid: 0,
                  colorbar: {
                    title: { text: current.name.replace(/_/g, " ") },
                    thickness: 10,
                  },
                  showscale: true,
                },
                hovertemplate:
                  "<b>%{text}</b><br>position: %{marker.color:.3f}<extra></extra>",
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
              title={`Top toward ${current.pole_a_items[0]}`}
              items={current.top_toward_a.map((r) => ({
                item: r.item,
                score: r.position,
              }))}
              subtitle={current.pole_a_items.slice(0, 6).join(", ") + "…"}
            />
            <Region
              title={`Top toward ${current.pole_b_items[0]}`}
              items={current.top_toward_b.map((r) => ({
                item: r.item,
                score: r.position,
              }))}
              subtitle={current.pole_b_items.slice(0, 6).join(", ") + "…"}
            />
          </div>

          <ProvenanceBadge record={result.provenance} />

          <DeepDivePanel>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Axis summary ({current.name.replace(/_/g, " ")})
                </h4>
                <p>
                  Mean position {current.mean_position.toFixed(3)}, std{" "}
                  {current.std_position.toFixed(3)}, fraction toward pole A{" "}
                  {(current.fraction_toward_a * 100).toFixed(1)}%.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Pole A vocabulary
                </h4>
                <p className="font-mono text-body-sm text-charcoal">
                  {current.pole_a_items.join(", ")}
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Pole B vocabulary
                </h4>
                <p className="font-mono text-body-sm text-charcoal">
                  {current.pole_b_items.join(", ")}
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  All axes (mean position)
                </h4>
                <ul className="font-mono text-body-sm">
                  {result.axes.map((ax) => (
                    <li
                      key={ax.name}
                      className="flex justify-between border-b border-parchment/60 py-0.5"
                    >
                      <span>{ax.name.replace(/_/g, " ")}</span>
                      <span className="tabular-nums text-charcoal">
                        {ax.mean_position.toFixed(3)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Probe partiality
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
