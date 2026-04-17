"use client";

import { useCallback, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { ProvenanceBindingCard } from "@/components/binding/ProvenanceBindingCard";
import type { NormativeTransitionResult } from "@/types/manifold";

export function NormativeTransitionProbe() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<NormativeTransitionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/backend/critique/normative-transition",
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
      setResult((await response.json()) as NormativeTransitionResult);
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
            Normative Transition Probe
          </h2>
          <p className="font-body italic text-slate">
            Where does the manifold pass from <em>is</em> to <em>ought</em>?
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
          Embeds two vocabularies (is, ought) and computes each sample
          point&apos;s cosine similarity to each centroid. The normative
          gradient is ought-sim minus is-sim. A near-zero is/ought centroid
          cosine would indicate distinct registers; a high value indicates
          the frictionless transition predicted by vector theory.
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
                  color: result.normative_gradient,
                  colorscale: "RdBu",
                  cmid: 0,
                  colorbar: {
                    title: { text: "ought − is" },
                    thickness: 10,
                  },
                  showscale: true,
                },
                hovertemplate:
                  "<b>%{text}</b><br>gradient: %{marker.color:.3f}<extra></extra>",
              },
            ]}
          />

          <ProvenanceBindingCard
            stats={result.measure_attestation.summary_statistics}
            estimator={result.measure_attestation.estimator}
            k={result.measure_attestation.k}
          />

          <div className="mt-4 mb-4 card-editorial border-l-4 border-l-gold p-4 font-body text-body-sm">
            <p>
              <span className="font-display text-ink font-medium">
                is / ought centroid cosine:{" "}
              </span>
              <span className="font-mono tabular-nums text-ink">
                {result.is_ought_centroid_cosine.toFixed(3)}
              </span>
              . {" "}
              {result.is_ought_centroid_cosine > 0.6
                ? "Close. The two registers sit adjacent in the manifold, consistent with a frictionless transition from description to prescription."
                : result.is_ought_centroid_cosine > 0.3
                  ? "Moderately distinct. Some separation between the registers, but the transition is not sharp."
                  : "Distinct. The registers sit apart; the is/ought boundary has geometric weight."}
            </p>
          </div>

          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <Region
              title="Leans ought"
              items={result.top_toward_ought.map((r) => ({
                item: r.item,
                score: r.gradient,
              }))}
              subtitle={result.ought_items.slice(0, 8).join(", ") + "…"}
            />
            <Region
              title="Leans is"
              items={result.top_toward_is.map((r) => ({
                item: r.item,
                score: r.gradient,
              }))}
              subtitle={result.is_items.slice(0, 8).join(", ") + "…"}
            />
          </div>

          <ProvenanceBadge record={result.provenance} />

          <DeepDivePanel>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Is vocabulary ({result.is_items.length} terms)
                </h4>
                <p className="font-mono text-body-sm text-charcoal">
                  {result.is_items.join(", ")}
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Ought vocabulary ({result.ought_items.length} terms)
                </h4>
                <p className="font-mono text-body-sm text-charcoal">
                  {result.ought_items.join(", ")}
                </p>
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
