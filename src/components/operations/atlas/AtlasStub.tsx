"use client";

/**
 * Atlas tab stub. Later phases will ship curated pre-run analyses on named
 * samples (PoT corpus, Bias as Universality Class, Reflexive Run on the
 * methodology literature), each with provenance records and David's critical
 * annotations.
 */
export function AtlasStub() {
  return (
    <section className="card-editorial p-6">
      <header className="mb-4">
        <h2 className="font-display text-display-lg text-ink">Atlas</h2>
        <p className="font-body italic text-slate">
          Curated pre-run analyses on named samples, bundled with provenance
          and annotations.
        </p>
      </header>
      <div className="border-l-4 border-l-gold bg-cream/50 p-4 font-body text-body-sm text-charcoal">
        <p className="mb-2">
          <span className="font-display font-medium text-ink">
            Planned for later phases.
          </span>
        </p>
        <ul className="list-inside list-disc space-y-1 text-slate">
          <li>
            Philosophy of Technology corpus, as manifold (Measure + Critique).
          </li>
          <li>Bias as Universality Class (AI ethics literature 2015–2025).</li>
          <li>Reflexive Run on the methodology literature.</li>
        </ul>
        <p className="mt-3 text-slate">
          Each Atlas entry bundles a sample definition, the embedding provider
          and model, the probe-list hash, the stability scores, and annotated
          findings. See <span className="font-mono">backend/atlas/</span> once
          Phase 4 lands.
        </p>
      </div>
    </section>
  );
}
