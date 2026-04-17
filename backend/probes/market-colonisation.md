# Market-Colonisation Probe

**Name:** market-colonisation
**Register:** Critique
**Curator:** David M. Berry
**Date:** 2026-04-17
**Version:** 0.1.0

## What the probe measures

How far commercial and transactional vocabulary has seeped into non-market
domains. The operation embeds the probe list below alongside the sample, then
computes each sample point's mean cosine similarity to the probe-list centroid.
Points with high similarity sit close to market vocabulary in the manifold;
low similarity indicates relative distance from it. The gradient across the
sample is the colonisation index.

## Partiality note

This probe list is English, contemporary, and biased toward the vocabulary
familiar to critiques of platform capitalism. "Customer", "client", "service",
"product", "transaction", "market", "efficiency" are recognisable signatures
of market discourse in this tradition. The list is not universal and does not
claim to map all possible registers of transactional vocabulary. Alternative
curations (including non-English commercial registers, historical market
vocabularies, and platform-specific argots) would produce different readings.
The list is editable; its hash travels in the provenance record so that any
finding can be re-run with a different probe.

Known omissions: financial derivatives and actuarial vocabulary ("underwriting",
"hedge", "premium"), gig-economy neologisms ("gigging", "rating", "score"),
and platform-specific nouns ("upvote", "subscriber", "engagement") are
deliberately out of scope for this first probe. They belong to adjacent probes
that should be built separately.

## Probe list

```
market
customer
client
consumer
buyer
seller
product
commodity
service
transaction
exchange
price
cost
value
profit
revenue
sale
purchase
contract
deal
brand
advertising
marketing
efficiency
productivity
optimisation
competition
demand
supply
investment
return
monetisation
platform
subscription
pricing
```
