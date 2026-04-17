"use client";

import type { SummaryStatistics } from "@/types/manifold";

/**
 * The Measure-attestation card that renders alongside every Critique view.
 * This is the binding commitment made visible: no interpretive claim without
 * the independent geometric characterisation of the same region.
 */
export function ProvenanceBindingCard({
  stats,
  estimator,
  k,
}: {
  stats: SummaryStatistics;
  estimator: string;
  k: number;
}) {
  const fmt = (v: number | null, decimals = 2) =>
    v === null || Number.isNaN(v) ? "—" : v.toFixed(decimals);

  return (
    <aside className="card-editorial mt-4 border-l-4 border-l-burgundy p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="font-display text-display-md text-ink">
          Measure attestation
        </h3>
        <span className="font-sans text-caption uppercase tracking-widest text-slate">
          bound to this Critique finding
        </span>
      </div>
      <p className="mb-3 font-body text-body-sm italic text-slate">
        Every Critique finding carries a Measure attestation. Without it, the
        interpretive claim rides on projection artefacts and sampling bias.
        With it, the reading is answerable to other readings of the same region
        under the same geometric characterisation.
      </p>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-1 font-sans text-body-sm text-charcoal sm:grid-cols-4">
        <div>
          <dt className="text-caption uppercase tracking-wide text-slate">
            Mean local ID
          </dt>
          <dd className="font-medium text-ink">{fmt(stats.mean)}</dd>
        </div>
        <div>
          <dt className="text-caption uppercase tracking-wide text-slate">
            Median local ID
          </dt>
          <dd className="font-medium text-ink">{fmt(stats.median)}</dd>
        </div>
        <div>
          <dt className="text-caption uppercase tracking-wide text-slate">
            Std
          </dt>
          <dd className="font-medium text-ink">{fmt(stats.std)}</dd>
        </div>
        <div>
          <dt className="text-caption uppercase tracking-wide text-slate">
            Valid points
          </dt>
          <dd className="font-medium text-ink">{stats.n_valid}</dd>
        </div>
        <div className="col-span-2 sm:col-span-4">
          <dt className="text-caption uppercase tracking-wide text-slate">
            Estimator
          </dt>
          <dd className="text-charcoal">
            {estimator} · k = {k}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
