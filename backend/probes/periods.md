# Period Markers (Temporal Sedimentation)

**Name:** periods
**Register:** Critique
**Curator:** David M. Berry
**Date:** 2026-04-21
**Version:** 0.1.0

## What the probe measures

For each sample concept, compute its cosine similarity to the centroid of
each period&apos;s marker vocabulary, then normalise to a distribution
over periods. The per-concept period fingerprint reveals which era of
Anglophone technical / media discourse the concept sits closest to. The
sample-level aggregation gives a "sedimentation profile" — where in
time the manifold&apos;s representation of this vocabulary sits.

The operation does not prove that a given period&apos;s texts were in
the training corpus. It reports that a given concept&apos;s geometric
neighbourhood is dominated by vocabulary characteristic of that period.
The critical reading: manifolds present themselves as synchronic, but
their vocabulary has historical sediment that a period probe makes
visible.

## Partiality note

The period markers are Anglophone and technology-centric. A more
thorough probe would add political, aesthetic, and everyday-life
markers for each period, and would extend the timeline back before
1900 and into non-Western chronologies. The lists are editable and
their combined hash travels in the provenance record.

## Periods

```periods
period: pre-1950
  markers: telegraph, wireless, picture palace, moving picture, radio drama, typewriter, phonograph, gramophone, cinematograph, stenography, kinetoscope, zoetrope
period: 1950s-1970s
  markers: punch card, mainframe, transistor, atomic age, space race, cybernetics, systems theory, televisual, magnetic tape, timesharing, radar
period: 1970s-1990s
  markers: personal computer, modem, bulletin board, floppy disk, dial-up, shareware, usenet, minicomputer, microchip, BASIC, MS-DOS, macroprocessor
period: 1990s-2000s
  markers: web page, dot-com, broadband, blog, forum, search engine, homepage, HTML, hyperlink, e-commerce, chat room, portal
period: 2000s-2010s
  markers: social network, smartphone, app store, cloud computing, big data, startup, platform, status update, timeline, newsfeed, wiki, podcast
period: 2010s-2020s
  markers: algorithm, gig economy, influencer, streaming service, deep learning, blockchain, cryptocurrency, microtargeting, dark pattern, like button, recommender
period: 2020s
  markers: large language model, foundation model, prompt, RLHF, vibecoding, generative AI, agentic, chatbot assistant, multimodal, hallucination, alignment, jailbreak
```
