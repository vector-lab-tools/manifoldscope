# Synonymic Erosion Pairs

**Name:** synonymic-pairs
**Register:** Critique
**Curator:** David M. Berry
**Date:** 2026-04-21
**Version:** 0.1.0

## What the probe measures

Each pair is two terms that carry different meanings in critical theory
or political economy, but that a manifold trained on contemporary
Anglophone text will often pull close together. The per-pair cosine
distance measures how much the distinction has survived (large distance
= preserved) or collapsed (small distance = eroded). The sample-level
**erosion score** is the mean cosine similarity across pairs: higher
means more collapse.

The name "synonymic erosion" comes from vector theory: manifolds trained
on large volumes of contemporary text tend to smooth distinctions that
were sharp in earlier discourse. The first version of the operation
runs on a single manifold; a diachronic variant (same pairs across
multiple model versions) is planned for a later phase once
multi-version model access is available.

## Partiality note

The pairs below lean on standing critical-theory distinctions that the
vector medium is hypothesised to smooth: political economy, citizenship,
care, community, labour, moral vocabulary. They are English,
contemporary, and limited in range. A richer probe would add pairs from
feminist theory (for example `work / care`, `public / domestic`),
decolonial theory (`development / sumak kawsay`, `progress /
buen vivir`), and STS (`natural / social`, `given / constructed`).
The pairs are editable and the list hash travels in the provenance
record.

## Pairs

Each line is `term_a :: term_b`.

```pairs
citizen :: consumer
care :: service
liberation :: freedom
reform :: revolution
community :: network
solidarity :: cooperation
friend :: contact
labour :: work
autonomy :: choice
use-value :: exchange-value
duty :: obligation
subject :: user
public :: audience
commons :: shared resource
dissent :: feedback
judgement :: evaluation
learning :: training
study :: research
writing :: content
reading :: consumption
teacher :: instructor
student :: learner
memory :: storage
thinking :: processing
dialogue :: interaction
```
