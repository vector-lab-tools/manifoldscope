# Dissensus Contextual Templates

**Name:** dissensus-contexts
**Register:** Critique
**Curator:** David M. Berry
**Date:** 2026-04-21
**Version:** 0.1.0

## What the probe measures

For each concept in the sample, the probe embeds the bare concept alongside
a battery of contextual framings. The per-concept dissensus score is the
spread (standard deviation of pairwise cosine distances) across the framed
embeddings. Concepts with high spread are volatile under context; their
meaning shifts substantially as the framing changes. Concepts with low
spread are stable; the manifold has smoothed their contextual variation
into a single region. Volatility is the critical signal: it marks where
meaning remains genuinely contested within the model's own representation,
rather than having been compressed into a hegemonic default.

## Partiality note

The templates are deliberately short, English-language, and domain-light.
They lean on the classical critical-theory registers (political, economic,
care, aesthetic, ecological) and a small set of everyday registers (work,
home, ordinary life). They are not exhaustive: a more ambitious probe would
vary tense, modality, pronoun framing, and discourse genre. The aim here is
to produce a fast first-order reading of contextual volatility, not a
complete typology. The template list is editable and its hash travels in
the provenance record.

## Templates

```templates
{}
{} in political context
{} in economic context
{} in an everyday context
{} at work
{} at home
{} under capitalism
{} in nature
{} in public life
{} as a political demand
{} as a personal concern
{} as a cultural value
```
