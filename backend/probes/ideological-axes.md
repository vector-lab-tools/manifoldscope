# Ideological Axes Probe

**Name:** ideological-axes
**Register:** Critique
**Curator:** David M. Berry
**Date:** 2026-04-17
**Version:** 0.1.0

## What the probe measures

Projects a basis of contested axes onto the sample manifold. For each axis
the probe defines two poles, A and B. The axis vector is `centroid(A) −
centroid(B)` in the ambient embedding space. Each sample point's position
on the axis is its cosine similarity to the unit axis vector. A positive
position leans toward pole A, negative toward pole B, zero is neutral. The
Ideological Topography operation renders these positions as per-axis
heatmaps so that the political orientation of whole regions becomes visible,
rather than only the orientation of individually probed concepts.

## Partiality note

Axis choices are political. The five axes below are standing concerns of
critical theory of technology and of David Berry's own vector-theory
programme. Each pole is defined by a small vocabulary that is more
representative than exhaustive; the probe is editable, and the list hash
travels in the provenance record so that alternative curations produce
traceable alternative readings.

Known limits: poles are English; the A / B labels are conventional and do
not encode normative preference on their own; a richer instrument would
add axis weightings per-operation, which is deferred.

## Axes

```axes
axis: market_commons
  A: market, commerce, trade, customer, transaction, commodity, exchange, profit, price, efficiency
  B: commons, mutual aid, care, gift, reciprocity, solidarity, cooperation, sharing, subsistence, stewardship
axis: liberal_radical
  A: liberal, rights, choice, procedure, consent, autonomy, individual, freedom, rule of law, due process
  B: radical, emancipation, collective, liberation, struggle, solidarity, revolution, abolition, transformation, praxis
axis: extractive_regenerative
  A: extraction, exploitation, accumulation, depletion, expansion, growth, consumption, throughput, yield, acquisition
  B: regeneration, repair, restoration, reciprocity, cycle, renewal, stewardship, maintenance, cultivation, return
axis: western_non_western
  A: reason, logic, individual, rights, science, enlightenment, progress, modernity, universal, system
  B: cosmotechnics, ubuntu, wu wei, sumak kawsay, ren, dharma, qi, ancestral, relational, situated
axis: human_more_than_human
  A: human, person, subject, rational, autonomous, agency, intentional, cognitive, individual, consciousness
  B: more-than-human, animal, plant, ecosystem, microbial, atmospheric, geological, mineral, entangled, companion
```
