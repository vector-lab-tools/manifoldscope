"use client";

import type { ProvenanceRecord } from "@/lib/provenance";

/**
 * Compact footer badge rendering the provenance fields that must travel with
 * any view. Manifold source, sample, metric, projection, and (if present) probe.
 */
export function ProvenanceBadge({ record }: { record: ProvenanceRecord }) {
  const { manifold, sample, projection, metric, probe, sample_hash } = record;
  return (
    <div className="mt-4 border-t border-parchment pt-2 font-sans text-caption uppercase tracking-wider text-slate">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span>
          manifold: <span className="normal-case tracking-normal text-charcoal">
            {manifold.provider} · {manifold.model_id} · {manifold.dimension}d
          </span>
        </span>
        <span>
          sample: <span className="normal-case tracking-normal text-charcoal">
            {sample.identifier} · {sample.item_count} items · {sample_hash.slice(0, 8)}
          </span>
        </span>
        <span>
          projection: <span className="normal-case tracking-normal text-charcoal">
            {projection.method}
          </span>
        </span>
        <span>
          metric: <span className="normal-case tracking-normal text-charcoal">
            {metric.method}
          </span>
        </span>
        {probe && (
          <span>
            probe: <span className="normal-case tracking-normal text-charcoal">
              {probe.name} · {probe.item_count} items · {probe.list_hash.slice(0, 8)}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
