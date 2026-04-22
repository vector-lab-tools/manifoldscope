"use client";

import { useCallback, useState } from "react";
import { useManifold } from "@/context/ManifoldContext";
import { Plot3DWrapper } from "@/components/viz/Plot3DWrapper";
import { Plot2DWrapper } from "@/components/viz/Plot2DWrapper";
import { DeepDivePanel } from "@/components/shared/DeepDivePanel";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import type { VoidAtlasResult } from "@/types/manifold";

export function VoidAtlas() {
  const { sampleName, backendReachable } = useManifold();
  const [result, setResult] = useState<VoidAtlasResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/backend/measure/void-atlas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sample_name: sampleName,
          max_dim: 1,
          max_points: 1000,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail ?? `Backend error: ${response.status}`);
      }
      setResult((await response.json()) as VoidAtlasResult);
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
          <h2 className="font-display text-display-lg text-ink">Void Atlas</h2>
          <p className="font-body italic text-slate">
            Where are the holes in the manifold, and what bounds them?
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
          Persistent homology over a Vietoris-Rips filtration of the sample.
          H0 captures connected components; H1 captures loops. A high-persistence
          loop bounds a void in the manifold: a region the embedding space
          encloses but leaves empty. The persistence diagram plots birth
          against death; the barcode shows each feature as a lifetime bar.
        </p>
      )}

      {result && (
        <>
          {/* Persistence diagram: birth vs death scatter */}
          <PersistenceDiagram result={result} />

          {/* Barcode: H1 features as horizontal bars */}
          <Barcode result={result} />

          {/* 3D sample scatter (same projection as the other Measure ops) */}
          <h3 className="font-display text-display-md text-ink mt-8 mb-2">
            Sample in PCA 3D
          </h3>
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
                  size: 4,
                  color: "#6b2832",
                  opacity: 0.7,
                },
                hovertemplate: "<b>%{text}</b><extra></extra>",
              },
            ]}
          />

          <div className="mt-6 grid grid-cols-2 gap-4 font-sans text-body-sm text-charcoal sm:grid-cols-4">
            <Stat label="H0 classes" value={String(result.summary.h0_count)} />
            <Stat label="H1 loops" value={String(result.summary.h1_count)} />
            <Stat
              label="H1 max lifetime"
              value={result.summary.h1_max_lifetime?.toFixed(3) ?? "—"}
            />
            <Stat
              label="Points used"
              value={`${result.summary.n_points_used}${
                result.summary.downsampled
                  ? ` of ${result.summary.n_points_original}`
                  : ""
              }`}
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
                  {result.parameters.filtration}. Max homological dimension{" "}
                  {result.parameters.max_dim}; up to{" "}
                  {result.parameters.max_points} points. Features ranked by
                  lifetime; features with infinite death were born but never
                  close within the filtration range.
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-sans text-caption uppercase tracking-widest text-slate">
                  Top H1 features (voids)
                </h4>
                <ul className="font-mono text-body-sm">
                  {result.h1.slice(0, 10).map((pair, i) => (
                    <li
                      key={i}
                      className="flex justify-between border-b border-parchment/60 py-0.5"
                    >
                      <span>
                        birth {pair.birth.toFixed(3)} · death{" "}
                        {pair.death === null ? "∞" : pair.death.toFixed(3)}
                      </span>
                      <span className="tabular-nums">
                        {pair.lifetime === null
                          ? "∞"
                          : pair.lifetime.toFixed(3)}
                      </span>
                    </li>
                  ))}
                  {result.h1.length === 0 && (
                    <li className="py-0.5 text-slate">
                      No H1 features at this filtration scale.
                    </li>
                  )}
                </ul>
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

function PersistenceDiagram({ result }: { result: VoidAtlasResult }) {
  // Collect all finite birth/death pairs; mark essential classes at a death
  // slightly above the max finite death for display.
  const finiteH0 = result.h0.filter((p) => p.death !== null);
  const finiteH1 = result.h1.filter((p) => p.death !== null);
  const allDeaths = [...finiteH0, ...finiteH1]
    .map((p) => p.death as number)
    .filter((v) => Number.isFinite(v));
  const maxDeath = allDeaths.length ? Math.max(...allDeaths) : 1;
  const essentialDeath = maxDeath * 1.1;

  const h0_x = result.h0.map((p) => p.birth);
  const h0_y = result.h0.map((p) =>
    p.death === null ? essentialDeath : p.death,
  );
  const h1_x = result.h1.map((p) => p.birth);
  const h1_y = result.h1.map((p) =>
    p.death === null ? essentialDeath : p.death,
  );

  const diagonalEnd = essentialDeath;

  return (
    <div>
      <h3 className="font-display text-display-md text-ink mb-2">
        Persistence diagram
      </h3>
      <p className="mb-2 font-body text-body-sm italic text-slate">
        Birth vs death. Points far from the diagonal are persistent features;
        essential classes (infinite death) shown at the top of the axis.
      </p>
      <Plot2DWrapper
        height={360}
        data={[
          {
            type: "scattergl",
            mode: "lines",
            x: [0, diagonalEnd],
            y: [0, diagonalEnd],
            line: { color: "#a4a4a4", width: 1, dash: "dot" },
            showlegend: false,
            hoverinfo: "skip",
          },
          {
            type: "scattergl",
            mode: "markers",
            name: "H0",
            x: h0_x,
            y: h0_y,
            marker: { size: 6, color: "#1f77b4", opacity: 0.7 },
            hovertemplate: "H0 · birth %{x:.3f}, death %{y:.3f}<extra></extra>",
          },
          {
            type: "scattergl",
            mode: "markers",
            name: "H1",
            x: h1_x,
            y: h1_y,
            marker: { size: 8, color: "#6b2832", opacity: 0.9 },
            hovertemplate: "H1 · birth %{x:.3f}, death %{y:.3f}<extra></extra>",
          },
        ]}
        layout={{
          xaxis: { title: { text: "birth" }, zeroline: false },
          yaxis: { title: { text: "death" }, zeroline: false },
          showlegend: true,
          legend: { orientation: "h" },
        }}
      />
    </div>
  );
}

function Barcode({ result }: { result: VoidAtlasResult }) {
  const top = result.h1.slice(0, 20);
  if (top.length === 0) return null;

  const maxDeath = Math.max(
    ...top.map((p) => (p.death === null ? 0 : p.death)),
    1,
  );
  const essential = maxDeath * 1.15;

  return (
    <div className="mt-8">
      <h3 className="font-display text-display-md text-ink mb-2">
        H1 barcode (top {top.length})
      </h3>
      <p className="mb-2 font-body text-body-sm italic text-slate">
        Each horizontal bar is a loop&apos;s lifetime, from birth to death.
        Longer bars are more persistent voids. Essential features extend past
        the axis.
      </p>
      <Plot2DWrapper
        height={Math.max(180, top.length * 18)}
        data={top.map((pair, i) => ({
          type: "scattergl",
          mode: "lines",
          x: [pair.birth, pair.death === null ? essential : pair.death],
          y: [i, i],
          line: { color: "#6b2832", width: 6 },
          showlegend: false,
          hovertemplate: `loop ${i} · birth ${pair.birth.toFixed(
            3,
          )} · death ${
            pair.death === null ? "∞" : pair.death.toFixed(3)
          }<extra></extra>`,
        }))}
        layout={{
          xaxis: { title: { text: "filtration radius" }, zeroline: false },
          yaxis: {
            title: { text: "loop index" },
            tickmode: "linear",
            dtick: 1,
            zeroline: false,
          },
          margin: { l: 60, r: 10, t: 10, b: 40 },
        }}
      />
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
