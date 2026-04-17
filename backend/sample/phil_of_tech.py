"""
Philosophy of Technology default sample.

Shared with Theoryscope's Phase 0 corpus for continuity across the Vector Lab.
About 200 terms spanning the continental tradition, the Anglo-American
postphenomenology and pragmatic lineage, recent critical theory of computation
and non-Western thought, and the operational vocabulary the field uses.

This sample is a theoretical claim in its own right. Its partiality is
declared in PARTIALITY_NOTE below and travels with the provenance record.
"""

from __future__ import annotations

SAMPLE_NAME = "philosophy-of-technology-v1"

PARTIALITY_NOTE = (
    "Anglophone-weighted sample drawn from David Berry's reading lists and from "
    "the vocabulary visible in the major journals of philosophy of technology "
    "through 2025. Classical continental philosophy of technology, Anglo-American "
    "postphenomenology, and recent critical theory of computation are all "
    "represented. Non-Western philosophy of technology is included but thin "
    "relative to the breadth of the traditions it names. Feminist and queer "
    "technoscience are present but under-sampled. Science and technology studies "
    "as a distinct field is largely absent by design, since the sample is of "
    "philosophy of technology in the narrower sense."
)

CONCEPTS = [
    # Continental classical
    "technology", "technique", "technē", "poiesis", "praxis",
    "enframing", "Gestell", "Bestand", "standing reserve", "revealing",
    "autonomous technology", "la technique", "megamachine",
    "polytechnic", "monotechnic", "technics", "mechanisation",
    "individuation", "transindividual", "milieu associé", "milieu",
    "concretisation", "abstraction",
    "pharmakon", "tertiary retention", "grammatisation", "exosomatisation",

    # Anglo-American postphenomenology and pragmatic
    "embodiment relation", "hermeneutic relation", "alterity relation",
    "background relation", "mediation", "device paradigm", "focal practice",
    "instrumentalisation", "democratic rationalisation", "technical code",
    "artefact", "affordance", "script", "delegation",
    "actor-network", "translation", "assembly",
    "autonomy", "politics of artefacts", "technological determinism",

    # Critical theory of computation / media
    "computation", "algorithm", "software", "hardware", "code",
    "protocol", "platform", "interface", "infrastructure",
    "network", "data", "database", "archive", "memory",
    "model", "training", "inference", "representation",
    "vector", "manifold", "embedding", "latent", "dimension",
    "recursion", "cosmotechnics", "technodiversity",
    "cyborg", "situated knowledge", "prosthesis",
    "cognitive assemblage", "distributed cognition",
    "vector theory", "vector medium",

    # Operational vocabulary
    "automation", "mechanisation", "optimisation", "efficiency",
    "calculability", "standardisation", "abstraction",
    "tool", "apparatus", "machine", "device", "instrument",
    "labour", "work", "skill", "use", "design",
    "risk", "innovation", "progress", "development",
    "extraction", "accumulation", "reification",

    # Political economy and critique
    "capital", "commodity", "exchange value", "use value",
    "alienation", "reification", "real abstraction",
    "dead labour", "living labour", "general intellect",
    "surveillance", "governmentality", "biopolitics",
    "discipline", "control", "modulation",
    "enclosure", "commons", "proprietary",

    # Ethics and values
    "agency", "responsibility", "accountability",
    "autonomy", "freedom", "rights",
    "privacy", "consent", "transparency",
    "bias", "fairness", "justice",
    "care", "vulnerability",

    # Non-Western and subaltern
    "ubuntu", "wu wei", "sumak kawsay",
    "cosmotechnics", "recursion",
    "situated knowledge", "standpoint",
    "subaltern", "coloniality",
    "decolonial", "indigenous knowledge",

    # Phenomenological and aesthetic
    "experience", "perception", "body", "flesh",
    "world", "horizon", "lifeworld",
    "attention", "habit", "style",
    "image", "sound", "text",
    "art", "aesthetic", "work of art",

    # AI-specific contemporary
    "large language model", "transformer", "attention",
    "prompt", "completion", "generation",
    "hallucination", "grounding", "alignment",
    "RLHF", "fine-tuning", "scaling",
    "foundation model", "multimodal",
    "chatbot", "assistant", "agent",

    # Recent critical vocabulary
    "extractive intermediation", "vector conformism",
    "geometric reason", "geometric ideology",
    "diffusionisation", "synthetic media",
    "the vidual", "gradience",
    "stochastic parrot", "bliss attractor",
    "real subsumption", "formal subsumption",
    "Formbestimmung", "value-form",
    "vector-form", "geometric foreclosure",

    # Critical digital humanities
    "critical code studies", "platform studies",
    "media archaeology", "software studies",
    "computational thinking", "iteracy",
    "digital humanities", "critical digital humanities",
]


def get_sample() -> list[str]:
    """Return the canonical PoT concept list. De-duplicated while preserving order."""
    seen: set[str] = set()
    unique: list[str] = []
    for c in CONCEPTS:
        if c not in seen:
            seen.add(c)
            unique.append(c)
    return unique
