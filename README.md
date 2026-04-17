# Manifoldscope

**Intensive reading of a single manifold, in two registers.**

**Author:** David M. Berry
**Institution:** University of Sussex
**Version:** 0.0.0
**Date:** 17 April 2026
**Licence:** MIT

Manifoldscope is a web-based research instrument for reading a single manifold intensively, as both a geometric object and an ideological object. It loads or imports a manifold (output embeddings from any provider, a Vectorscope hidden-state export, a Theoryscope corpus map), characterises its intrinsic geometry, and runs manifold-wide critical probes whose findings are bound to the geometric characterisation by a shared provenance record.

The tool is designed for critical and empirical inquiry into the manifold as medium, not for engineering evaluation. Where existing vector-geometry tools are built for engineers tuning retrieval pipelines, and where alignment-research tools are built to inspect circuits and features inside a model, Manifoldscope treats the output geometry as the object of study and asks what shape it has and what that shape does.

> Manifoldscope is part of the [Vector Lab](https://github.com/dmberry) family of research instruments, alongside [Manifold Atlas](https://github.com/dmberry/manifold-atlas), [Vectorscope](https://github.com/dmberry/vectorscope), [Theoryscope](https://github.com/dmberry/theoryscope), and [LLMbench](https://github.com/dmberry/LLMbench). The five tools share an editorial design system, an open-weight-friendly methodology, and a commitment to making the geometry of meaning legible for critical analysis. They diverge in their object: Manifold Atlas compares output geometries between models, Vectorscope inspects the internals of a single open-weight model, Theoryscope maps the geometry of a corpus of theoretical texts, LLMbench reads the surface of model outputs as prose, and Manifoldscope reads a single manifold intensively as both geometric and ideological object.

## Scholarly Context

Manifoldscope emerges from the convergence of four research programmes.

**Vector theory and the manifold as medium.** Berry (2026) *Vector Theory* develops an account of the manifold as a proprietary medium whose geometry encodes ideology topologically rather than discursively. If that claim is to be more than theoretical assertion, it requires an instrument that can inspect a manifold's shape and describe what the shape does. Manifoldscope is that instrument for the intensive case: one manifold at a time, examined as object.

**The provenance layer critical readings require.** Atlas-style findings at the level of contested concepts (for instance that freedom sits closer to market-liberalism than to radical democracy) gain defensibility only when the local intrinsic dimension, curvature, and sampling density of the region have been independently characterised. Small cosine differences in high-dimensional space are not, in themselves, findings. Manifoldscope produces the geometric characterisation that strengthens concept-level claims elsewhere in the Vector Lab.

**Critical tools of investigation for the manifold.** Existing tools either test pointwise concept claims (Atlas) or inspect internal mechanics for alignment purposes (mechanistic interpretability libraries). Neither runs manifold-wide critical probes: ideological topography across regions, hegemonic gravity maps, market-colonisation indices, colonial geometry probes, archaeologies of absence, dead-zone maps, grammatical-ideology probes. Manifoldscope ships these as first-class operations with the same rigour accorded to geometric measurements, and binds them to measurement rather than leaving them free-standing.

**Methodological commitment to open-weight embeddings and declared sampling.** Commercial embedding APIs do not give researchers what they think they give them: the tokeniser, architecture, training data, and update schedule sit behind an opaque endpoint. Manifoldscope treats open-weight embeddings as the default route for operations that aim to link geometry to training provenance. Closed APIs are supported for measurement operations that need only output vectors. The sample is never treated as preamble: every view declares its sample, and the sample is part of the manifold.

## Two Registers: Measure and Critique

Manifoldscope carries two orientations that are not separable in practice. Each operation can be asked in either key.

**Measure.** Intrinsic geometry. The mathematical characterisation of shape: intrinsic dimension, curvature, geodesic structure, density field, topological invariants, projection distortion, sampling bias. The posture is descriptive; the outputs are geometric.

**Critique.** Critical-theoretical investigation of the same manifold as ideological object: what it naturalises, what it marginalises, what it has sedimented, what it refuses to represent. The posture is interpretive; the outputs are readings backed by geometric evidence.

Every Critique finding renders alongside the Measure attestation for the same region. No standalone interpretive claims without geometric characterisation behind them. This binding is what Manifoldscope provides that no other Vector Lab tool currently does.

## Manifolds, Samples, and Probes: A Primer

Manifoldscope works on three kinds of object, and it helps to understand the difference.

A **manifold** in the instrument's sense is an embedding output plus its sampling. It could be the OpenAI `text-embedding-3-large` manifold queried with 5,000 concepts, the nomic-embed-text manifold queried with a Zotero corpus, an exported Vectorscope hidden-state cloud from a specified layer of a specified model, or a Theoryscope corpus map under a specified embedder. The manifold is never given abstractly; it is constituted by a sample.

A **sample** is the finite, explicitly defined set of points that realises the manifold for inspection. A sample is a theoretical claim in its own right: who is in it and who is out, under what criterion, with what filters, determines what the instrument can see. Manifoldscope records the sample definition as part of every result so that findings can be reproduced and contested.

A **probe** is a curated concept list plus a statistical test. Probes are the unit of critical investigation: the market-colonisation probe, the colonial geometry probe, the archaeology-of-absence probe, the grammatical ideology probe. Each probe list lives in an editable Markdown file and carries its own provenance record and a published partiality note. Curation is political; the note names the politics rather than hiding them.

## Operations at a Glance

Manifoldscope is organised as a three-group tabbed workspace: **Measure**, **Critique**, and **Atlas** (curated pre-run analyses on named samples, with provenance and annotations).

### Measure (intrinsic geometry)

| Operation | Core question |
|---|---|
| Intrinsic Dimension Field | What is the local dimension at each point of the manifold? |
| Curvature Estimation | Where is the manifold flat, hyperbolic, positively curved? |
| Geodesic Map | What is the distance under a density-aware metric, and how does it differ from cosine? |
| Density Gradient Field | Where are the dense cores and the sparse shells, as a continuous field? |
| Void Atlas | What are the holes in the manifold, and what concepts bound them? |
| Projection-Distortion Meter | How does the manifold differ under PCA, UMAP, t-SNE, PaCMAP, Isomap? |
| Sampling-Bias Diagnostic | How much of the apparent geometry is the sample, and how much is the manifold? |
| Metric Archaeology | How does the manifold deform between paired versions (base vs instruct; pre vs post RLHF)? |

### Critique (critical investigation)

*Ideological and hegemonic*

| Operation | Core question |
|---|---|
| Ideological Topography | What is the political orientation of whole regions? |
| Hegemonic Gravity Map | Which concepts are attractors, and which are peripheral? |
| Market-Colonisation Index | How far has commercial vocabulary seeped into non-market domains? |
| Normative Transition Probe | Where does the manifold pass from *is* to *ought*? |

*Archaeological and forensic*

| Operation | Core question |
|---|---|
| Training-Data Fingerprinting | Which corpora left geometric signatures? |
| Temporal Sedimentation | Which regions are shaped by which periods of training data? |
| Synonymic Erosion | Which distinctions are being lost across model versions? |
| Isometry Archaeology | What does alignment reshape? |

*Colonial, gendered, and subaltern geometry*

| Operation | Core question |
|---|---|
| Colonial Geometry Probe | How are non-Western concepts positioned relative to Western equivalents? |
| Untranslatable Map | Which concepts resist the multilingual manifold? |
| Social-Categorical Topology | What is the full map of gender and race terms? |
| Labour Visibility Field | Where does reproductive, care, and domestic labour sit? |

*Limits, refusals, and absences*

| Operation | Core question |
|---|---|
| Archaeology of Absence | What is the manifold thin on that it should be thick on? |
| Dead Zones Map | Where does the manifold give up structuring meaning? |
| Refusal to Represent | How does the manifold handle harms, atrocities, and politically sensitive events? |
| Commons Map | Where do concepts that resist commodification sit? |
| Infrastructural Probe | What has the manifold naturalised enough not to distinguish finely? |

*Dissensus and conformism*

| Operation | Core question |
|---|---|
| Grammatical Ideology Probe | How much does the manifold commit to active-voice vs passive-voice framings of the same event? |
| Dissensus Detector | Where does meaning become volatile under small contextual changes? |
| Counter-Reading Layer | What does the current organisation foreclose? |

All operations carry a provenance record (manifold source, sample hash, provider and model revision, metric, projection, probe list hash, timestamp) that travels with every export. The Critique tab renders a Measure attestation card alongside every reading.

Phase 0 ships with **Intrinsic Dimension Field** (Measure) and **Market-Colonisation Index** (Critique), both end-to-end with provenance. The other operations land in subsequent phases.

## Design Rationale

**Why two registers in one instrument?** Existing tools separate measurement from critique. The separation lets critical readings run on thin geometric evidence and lets geometric characterisations go uninterpreted. Manifoldscope binds them by design: every Critique finding renders alongside the Measure attestation for its region. The intrinsic geometry is the provenance layer for the political-theoretical reading.

**Why a single manifold as object?** Manifold Atlas compares manifolds across models; Vectorscope opens the internals of one model; Theoryscope takes a corpus as geometry. None of the existing tools treats a single manifold *as manifold* and characterises it in depth. Manifoldscope fills that gap. Single-manifold intensive reading also complements the extensive comparative reading of Atlas and the internal forensic reading of Vectorscope: the three together give within-model, between-model, and manifold-as-object inspection.

**Why probe lists in editable Markdown?** The critical probes are curated, and curation is political. A probe list in code is opaque; a probe list in a Markdown file with its own provenance and partiality note is inspectable and contestable. The pattern follows Manifold Atlas's `public/models/*.md` and Vectorscope's `backend/config/models.md` convention.

**Why declared sampling?** A manifold in practice is an embedding output plus a sample. Pretending otherwise smuggles the sampling choice past scrutiny. Manifoldscope displays the sample with every view, includes the sample hash in the provenance record, and ships the Sampling-Bias Diagnostic in Phase 1a rather than deferring it.

**Why open-weight-friendly rather than open-weight-only?** Some Measure operations need only output vectors and run against any embedding API. Critique operations that aim to link geometry to training provenance (fingerprinting, isometry archaeology, synonymic erosion) prefer open-weight backbones. The distinction is recorded per operation.

**Why no engineering metrics?** Manifoldscope does not answer "which embedding gives the best search relevance?" That question belongs to retrieval evaluation. It answers "what shape is this manifold, and what does that shape do?" — a critical-theoretical question that requires geometric evidence, not benchmark scores.

**Why shared provenance records across the Vector Lab?** A finding that cannot be cited is not a finding. The provenance record (manifold source, sample hash, provider and model revision, metric, projection, probe list hash, timestamp) is what makes a Manifoldscope result something that can travel into a paper. Without it, the geometry and the reading are both suggestive but not defensible. With it, the reading can be re-run and contested.

## Getting Started

Manifoldscope is two coordinated processes: a Python backend for the heavier numerics (intrinsic dimension, curvature, geodesics, persistent homology, bootstrap diagnostics) and a Next.js frontend that renders the interface and holds the embedding provider client. Both need to be running at the same time, in two separate terminals.

### Prerequisites

- **Python 3.11+** for the FastAPI backend.
- **Node.js 18+** (20 LTS recommended) and **npm**.
- **Git**, to clone the repository.
- At least one of: an embedding provider API key (OpenAI, Voyage, Google, or Cohere), a HuggingFace account with an Access Token, or [Ollama](https://ollama.com/) running locally with an embedding model pulled.

### Installation

```bash
git clone https://github.com/dmberry/manifoldscope.git
cd manifoldscope
npm install
```

Set up the Python backend:

```bash
cd backend
./setup.sh
```

This creates a local `.venv` and installs FastAPI, scikit-learn, numpy, scipy, networkx, ripser, and their dependencies.

### Running

Start the backend:

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

Start the frontend in a separate terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Configure at least one embedding provider in Settings. Load the default sample (Philosophy of Technology concept list) and click into the **Measure** tab to run Intrinsic Dimension Field, or the **Critique** tab to run the Market-Colonisation Index.

### Configuring Providers

Provider registry lives in `public/models/` as one Markdown file per provider. Add or remove models by editing the corresponding file. No rebuild required.

## Architecture

```
backend/                         # Python FastAPI
  main.py                        # FastAPI app, CORS, route registration
  provenance.py                  # ManifoldSource, SampleSpec, ProjectionSpec,
                                 #   MetricSpec, ProbeSpec, ProvenanceRecord
  sample/                        # Sample loading (concept list, Zotero export,
                                 #   Vectorscope hidden-state import, Theoryscope
                                 #   corpus-map import), sample hashing
  embed/                         # Embedding pipelines (sentence-transformers
                                 #   default; provider proxy for Atlas clients)
  geometry/                      # Intrinsic dimension estimators (TwoNN, MLE,
                                 #   local-PCA), curvature estimators
                                 #   (Ollivier-Ricci), geodesic computation
                                 #   (Isomap, diffusion distance), bootstrap
  operations/
    intrinsic_dimension.py       # Phase 0 Measure op
    market_colonisation.py       # Phase 0 Critique op
    (curvature, geodesic_map, density_gradient, void_atlas,
     projection_distortion, sampling_bias, ideological_topography,
     hegemonic_gravity, dissensus, grammatical_ideology, ... in later phases)
  probes/
    market-colonisation.md       # Curated probe list with provenance + partiality
    (ideological-axes, colonial, archaeology-of-absence, refusal, commons, ...)
  atlas/
    entries/                     # Pre-computed Atlas entries (later phases)

src/
  app/
    api/backend/[...path]/route.ts   # Next.js proxy to FastAPI on localhost:8000
    layout.tsx                        # Editorial typography and fonts
    page.tsx                          # Tabbed shell: Measure / Critique / Atlas
    providers.tsx                     # ManifoldProvider
  components/
    layout/                           # Header, SampleLoader, StatusBar,
                                      #   ProviderSettings
    operations/
      measure/                        # IntrinsicDimensionField (live);
                                      #   others stubbed
      critique/                       # MarketColonisationIndex (live);
                                      #   others stubbed
    atlas/                            # AtlasBrowser, AtlasEntry (later phases)
    binding/                          # ProvenanceBindingCard (renders a Measure
                                      #   attestation next to any Critique view)
    viz/                              # ScatterPlot, GravityWell, HeatmapOverlay,
                                      #   TopologyScene, Plot3DWrapper
    shared/                           # SampleSelector, ProbeSelector,
                                      #   ProvenanceBadge
  context/
    ManifoldContext.tsx               # Sample + provider + metric + projection state
  hooks/
    useBackend.ts                     # Thin fetch wrapper for the proxy route
  lib/
    embeddings/                       # Provider client + plugin modules
                                      #   (adapted from Manifold Atlas)
    geometry/                         # cosine, pca, umap, clusters,
                                      #   persistent-homology
                                      #   (adapted from Manifold Atlas)
    provenance.ts                     # Frontend mirror of backend ProvenanceRecord
    streaming.ts                      # NDJSON client + server helpers
                                      #   (adapted from Theoryscope)
    utils.ts
    version.ts
  types/
    manifold.ts
    react-plotly.d.ts

public/
  models/                             # Editable Markdown provider/model registry
                                      #   (adapted from Manifold Atlas)
```

The architecture mirrors Theoryscope's and Vectorscope's pattern: a Next.js App Router frontend proxies all `/api/backend/*` requests to a FastAPI backend on `localhost:8000`. No CORS. The Python side owns the heavier numerics, the sample cache, and the provenance record; the TypeScript side owns the visualisation, the embedding provider orchestration, and the binding UI.

Heavy visualisations (Plotly 3D scatter, Three.js persistent-homology scenes) are code-split via `next/dynamic` to keep the initial bundle lean.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5 (strict), Python 3.11+ |
| Styling | Tailwind CSS 3, editorial design system shared with the rest of the Vector Lab |
| Visualisation | Plotly.js (GL3D), Three.js (@react-three/fiber), custom SVG |
| Backend | FastAPI, uvicorn |
| Embeddings | Pluggable provider client (OpenAI, Voyage, Google, Cohere, HuggingFace, Ollama, OpenRouter); sentence-transformers for local open-weight default |
| Numerics (server) | numpy, scipy, scikit-learn, networkx, ripser, POT (optimal transport for Ollivier-Ricci) |
| Numerics (client) | Custom PCA, custom cosine, umap-js, TypeScript Vietoris-Rips |
| Streaming | NDJSON over FastAPI `StreamingResponse` |
| Caching | IndexedDB (client) via `idb`; local disk (server) for computed geometry with provenance |
| Icons | Lucide React |

## Roadmap

- [ ] **Phase 0** — Scaffold, provenance plumbing, tab shell, one Measure op (Intrinsic Dimension Field), one Critique op (Market-Colonisation Index), provenance binding card. *version 0.0.1*
- [ ] **Phase 1a** — Measure core: Curvature Estimation, Geodesic Map, Density Gradient Field, Projection-Distortion Meter, Sampling-Bias Diagnostic, Void Atlas. *version 0.1.x*
- [ ] **Phase 1b** — Critique core: Ideological Topography, Hegemonic Gravity Map, Normative Transition Probe, Dissensus Detector, Grammatical Ideology Probe. *version 0.2.x*
- [ ] **Phase 2a** — Archaeological and forensic: Training-Data Fingerprinting, Temporal Sedimentation, Synonymic Erosion, Isometry / Metric Archaeology. *version 0.3.x*
- [ ] **Phase 2b** — Subaltern geometry: Colonial Geometry Probe, Untranslatable Map, Social-Categorical Topology, Labour Visibility Field. *version 0.4.x*
- [ ] **Phase 3** — Limits, refusals, absences: Archaeology of Absence, Dead Zones Map, Refusal to Represent, Commons Map, Infrastructural Probe. *version 0.5.x*
- [ ] **Phase 4** — Composition and advanced: Vectorscope export interchange, Theoryscope corpus-map import, Counter-Reading Layer, Atlas export. *version 0.6.x*
- [ ] **Phase 5** — Release: Atlas entries, Stunlaw post, methodology essay, demonstration paper. *version 1.0.0*

## Related Work

- Berry, D. M. (2026) 'Vector Theory', *Stunlaw*. Available at: https://stunlaw.blogspot.com/2026/02/vector-theory.html
- Berry, D. M. (2026) 'What is Vector Space?', *Stunlaw*. Available at: https://stunlaw.blogspot.com/2026/03/what-is-vector-space.html
- Berry, D. M. (2026) 'Brain Numbers', *Stunlaw*. Available at: https://stunlaw.blogspot.com/2026/03/brain-numbers.html
- Berry, D. M. (2026) 'What Is Theory Space?', *Stunlaw*.
- Berry, D. M. (2026) 'Renormalising Theory', *Stunlaw*.
- Berry, D. M. (2026) *Artificial Intelligence and Critical Theory*, Manchester University Press.
- Impett, L. and Offert, F. (2026) *Vector Media*, University of Minnesota Press.
- Sohn-Rethel, A. (1978) *Intellectual and Manual Labour: A Critique of Epistemology*, Macmillan.
- Facco, E., d'Errico, M., Rodriguez, A. and Laio, A. (2017) 'Estimating the intrinsic dimension of datasets by a minimal neighbourhood information', *Scientific Reports*, 7.
- Ollivier, Y. (2009) 'Ricci curvature of Markov chains on metric spaces', *Journal of Functional Analysis*, 256(3), pp. 810–864.

## Acknowledgements

Concept and Design by David M. Berry, implemented with Claude Code 4.6. Design system adapted from the [CCS Workbench](https://github.com/dmberry/ccs-wb). Manifoldscope shares its editorial design system, geometry library, NDJSON streaming, provenance plumbing, and FastAPI proxy pattern with its sibling instruments [Vectorscope](https://github.com/dmberry/vectorscope), [Manifold Atlas](https://github.com/dmberry/manifold-atlas), [Theoryscope](https://github.com/dmberry/theoryscope), and [LLMbench](https://github.com/dmberry/LLMbench).

## Licence

MIT
