# Normative Transition Probe

**Name:** normative-transition
**Register:** Critique
**Curator:** David M. Berry
**Date:** 2026-04-17
**Version:** 0.1.0

## What the probe measures

Where does the manifold pass from *is* to *ought*? The probe defines two
vocabularies, descriptive (is) and normative (ought), computes each
sample point's cosine similarity to the two centroids, and reports the
**normative gradient** as the difference between the two. A point with
strong positive gradient sits near ought-vocabulary; strong negative sits
near is-vocabulary; zero is neutral.

Vector theory predicts that the transition is frictionless in contemporary
embedding manifolds, that is-vocabulary and ought-vocabulary co-occur
densely in training data and are therefore geometrically adjacent. If the
prediction holds, the gradient should be small in magnitude across most
sample points, with is/ought distinctions available only as local
perturbations rather than as a structural boundary. The operation measures
this predicted frictionlessness.

## Partiality note

The is and ought vocabularies are English. The is list draws from
descriptive, factual, and empirical registers; the ought list draws from
deontic, evaluative, and moral registers. Both miss important registers
(legal modality, prudential reasoning, aesthetic evaluation) that would
sharpen the distinction in specialised domains. The lists are editable
and the hash travels with the provenance record.

## is vocabulary

```is
is
exists
occurs
happens
consists
contains
includes
comprises
constitutes
represents
depicts
describes
records
reports
measures
observes
quantifies
classifies
identifies
names
exhibits
displays
manifests
demonstrates
instantiates
```

## ought vocabulary

```ought
ought
should
must
shall
may
required
obligated
forbidden
permitted
just
unjust
right
wrong
good
bad
fair
unfair
legitimate
illegitimate
responsible
accountable
deserve
warrant
entitle
commit
```
