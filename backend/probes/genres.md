# Genre Markers (Training-Data Fingerprinting)

**Name:** genres
**Register:** Critique
**Curator:** David M. Berry
**Date:** 2026-04-21
**Version:** 0.1.0

## What the probe measures

For each sample concept, compute its cosine similarity to the centroid of
each genre&apos;s marker vocabulary, then normalise to a distribution over
genres. The result is a per-concept "genre fingerprint" describing which
textual register of training data the concept is geometrically closest
to. Aggregated across the sample, the genre distribution reveals which
registers dominated the manifold&apos;s construction for this sample&apos;s
vocabulary. The instrument does not identify specific corpora (that
information is not exposed by the embedding model) but it does make
genre weighting legible.

## Partiality note

The genre markers below are English-language and broadly Anglophone; the
selection leans on registers visible in the major critiques of
contemporary training data (Wikipedia, Reddit, academic, journalistic,
legal, literary, technical, corporate). A richer probe would include
vernacular registers, non-Western genres, multilingual markers, and
domain-specific scientific registers; those are out of scope for this
first-order reading. The marker lists are editable and their combined
hash travels in the provenance record.

## Genres

```genres
genre: wikipedia
  markers: article, citation, infobox, category, encyclopedia, source, notability, disambiguation, revision, editor, consensus, reference, stub, redirect
genre: reddit
  markers: post, thread, comment, upvote, downvote, subreddit, OP, karma, moderator, edit, TIL, AMA, repost, flair
genre: academic
  markers: abstract, methodology, hypothesis, findings, peer review, bibliography, literature review, empirical, citation, journal, conference, preprint, corpus, analysis
genre: news
  markers: reporter, headline, breaking, anonymous source, statement, official said, developing story, press release, dateline, byline, correspondent, wire
genre: legal
  markers: plaintiff, defendant, jurisdiction, statute, appeal, brief, counsel, ruling, precedent, dissent, docket, pleading, affidavit
genre: literary
  markers: narrator, chapter, metaphor, stanza, protagonist, setting, imagery, voice, character, prose, verse, dialogue, scene
genre: technical
  markers: function, API, endpoint, parameter, configuration, dependency, compile, runtime, deployment, repository, commit, pull request, exception
genre: corporate
  markers: stakeholder, deliverable, synergy, roadmap, quarterly, KPI, alignment, strategic, touch base, circle back, leverage, bandwidth, disruption
```
