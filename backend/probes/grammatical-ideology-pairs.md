# Grammatical Ideology Pairs

**Name:** grammatical-ideology-pairs
**Register:** Critique
**Curator:** David M. Berry
**Date:** 2026-04-21
**Version:** 0.1.0

## What the probe measures

For each pair of sentences expressing the same event in active vs passive
voice (or agential vs impersonal construction), the probe embeds both
sentences and computes their cosine distance. A small distance indicates
that the manifold has collapsed the grammatical distinction: active and
passive constructions of the same event sit in near-identical regions,
meaning the geometry does not preserve the political difference that the
active voice names (who acted on whom) versus the passive voice conceals
(the event as if it had no agent). A larger distance indicates that the
manifold preserves the distinction.

Vector theory predicts that manifolds trained on large amounts of
journalistic and corporate prose, where passive-voice agency-hiding is
pervasive, will collapse active / passive distinctions more aggressively
than manifolds trained on texts that foreground agency. This probe is a
fast first-order test of that prediction.

The per-pair distances are reported alongside a sample-level summary.
Sample points are coloured on the 3D scatter by the mean cosine similarity
to the first sentence of each pair (the active constructions), so that the
reading locates the probe's events relative to the sample.

## Partiality note

The pairs below are in English, contemporary, and drawn from the registers
most relevant to critical theory of technology and political economy: the
labour process, state action, algorithmic decision, environmental harm,
and economic coercion. They are not neutral: the selection of which events
are probed is itself a critical-theoretical selection. A richer probe
would test legal, medical, academic, and affective registers separately.
The pairs are editable and the hash travels with the provenance record.

## Pairs

Each line is `active :: passive`. Both halves are full sentences.

```pairs
The firm fired the worker. :: The worker was fired.
The police shot the protester. :: The protester was shot.
The algorithm denied the loan. :: The loan was denied.
The company polluted the river. :: The river was polluted.
The landlord evicted the tenant. :: The tenant was evicted.
The officer arrested the suspect. :: The suspect was arrested.
The platform suspended the user. :: The user was suspended.
The state deported the migrant. :: The migrant was deported.
The model predicted the risk. :: The risk was predicted.
The buyer outbid the family. :: The family was outbid.
The developer released the feature. :: The feature was released.
The judge sentenced the defendant. :: The defendant was sentenced.
The manager restructured the team. :: The team was restructured.
The bank foreclosed the property. :: The property was foreclosed.
The regulator fined the company. :: The company was fined.
```
