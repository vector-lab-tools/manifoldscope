"""
Manifoldscope backend — FastAPI server for intensive manifold reading.

Phase 0 + 1a + 1b exposes:
    GET  /status                         liveness + version + phase
    GET  /samples                        list available samples
    POST /measure/intrinsic-dimension    per-point TwoNN field + 3D projection
    POST /measure/curvature              Forman-Ricci field on k-NN graph
    POST /measure/density-gradient       inverse-kNN-distance density field
    POST /measure/geodesic-map           per-point geodesic-vs-cosine delta
    POST /measure/sampling-bias          bootstrap over TwoNN field
    POST /critique/market-colonisation   gradient of market vocabulary + Measure
                                         attestation
    POST /critique/ideological-topography 5 contested axes projected onto sample
                                         + Measure attestation
    POST /critique/hegemonic-gravity     incoming-kNN attractor score
                                         + Measure attestation
    POST /critique/normative-transition  is/ought gradient + centroid cosine
                                         + Measure attestation

Phase 1a.2 will add Void Atlas (persistent homology) and the
Projection-Distortion Meter. Phase 1b.2 will add Dissensus Detector and
Grammatical Ideology Probe.
"""

from __future__ import annotations

import asyncio
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from operations.curvature import compute_curvature_estimation
from operations.density_gradient import compute_density_gradient_field
from operations.geodesic_map import compute_geodesic_map
from operations.hegemonic_gravity import compute_hegemonic_gravity_map
from operations.ideological_topography import compute_ideological_topography
from operations.intrinsic_dimension import compute_intrinsic_dimension_field
from operations.market_colonisation import compute_market_colonisation_index
from operations.normative_transition import compute_normative_transition
from operations.sampling_bias import compute_sampling_bias_diagnostic
from sample.loader import AVAILABLE as AVAILABLE_SAMPLES

app = FastAPI(title="Manifoldscope Backend", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- request models --------------------------------------------------------


class IntrinsicDimensionRequest(BaseModel):
    sample_name: str = Field(default="philosophy-of-technology-v1")
    k: int = Field(default=20, ge=3, le=200)
    model_id: Optional[str] = None


class CurvatureRequest(BaseModel):
    sample_name: str = Field(default="philosophy-of-technology-v1")
    k: int = Field(default=10, ge=3, le=100)
    model_id: Optional[str] = None


class DensityGradientRequest(BaseModel):
    sample_name: str = Field(default="philosophy-of-technology-v1")
    k: int = Field(default=10, ge=3, le=100)
    model_id: Optional[str] = None


class GeodesicMapRequest(BaseModel):
    sample_name: str = Field(default="philosophy-of-technology-v1")
    k: int = Field(default=10, ge=3, le=100)
    model_id: Optional[str] = None


class SamplingBiasRequest(BaseModel):
    sample_name: str = Field(default="philosophy-of-technology-v1")
    k: int = Field(default=20, ge=3, le=200)
    n_bootstrap: int = Field(default=50, ge=5, le=500)
    seed: int = Field(default=0)
    model_id: Optional[str] = None


class MarketColonisationRequest(BaseModel):
    sample_name: str = Field(default="philosophy-of-technology-v1")
    k: int = Field(default=20, ge=3, le=200)
    model_id: Optional[str] = None


class IdeologicalTopographyRequest(BaseModel):
    sample_name: str = Field(default="philosophy-of-technology-v1")
    k: int = Field(default=20, ge=3, le=200)
    model_id: Optional[str] = None


class HegemonicGravityRequest(BaseModel):
    sample_name: str = Field(default="philosophy-of-technology-v1")
    k: int = Field(default=10, ge=3, le=100)
    model_id: Optional[str] = None


class NormativeTransitionRequest(BaseModel):
    sample_name: str = Field(default="philosophy-of-technology-v1")
    k: int = Field(default=20, ge=3, le=200)
    model_id: Optional[str] = None


# --- routes ----------------------------------------------------------------


@app.get("/status")
async def status() -> Dict[str, Any]:
    return {
        "status": "ok",
        "tool": "manifoldscope",
        "version": "0.2.0",
        "phase": "1b",
        "samples_available": AVAILABLE_SAMPLES,
        "operations_available": {
            "measure": [
                "intrinsic_dimension_field",
                "curvature_estimation",
                "density_gradient_field",
                "geodesic_map",
                "sampling_bias_diagnostic",
            ],
            "critique": [
                "market_colonisation_index",
                "ideological_topography",
                "hegemonic_gravity_map",
                "normative_transition",
            ],
        },
    }


@app.get("/samples")
async def samples() -> Dict[str, Any]:
    return {"samples": AVAILABLE_SAMPLES}


def _dispatch(fn, **kwargs):
    return asyncio.to_thread(fn, **kwargs)


@app.post("/measure/intrinsic-dimension")
async def intrinsic_dimension(req: IntrinsicDimensionRequest) -> Dict[str, Any]:
    kwargs: Dict[str, Any] = {"sample_name": req.sample_name, "k": req.k}
    if req.model_id:
        kwargs["model_id"] = req.model_id
    try:
        return await _dispatch(compute_intrinsic_dimension_field, **kwargs)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/measure/curvature")
async def curvature(req: CurvatureRequest) -> Dict[str, Any]:
    kwargs: Dict[str, Any] = {"sample_name": req.sample_name, "k": req.k}
    if req.model_id:
        kwargs["model_id"] = req.model_id
    try:
        return await _dispatch(compute_curvature_estimation, **kwargs)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/measure/density-gradient")
async def density_gradient(req: DensityGradientRequest) -> Dict[str, Any]:
    kwargs: Dict[str, Any] = {"sample_name": req.sample_name, "k": req.k}
    if req.model_id:
        kwargs["model_id"] = req.model_id
    try:
        return await _dispatch(compute_density_gradient_field, **kwargs)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/measure/geodesic-map")
async def geodesic_map(req: GeodesicMapRequest) -> Dict[str, Any]:
    kwargs: Dict[str, Any] = {"sample_name": req.sample_name, "k": req.k}
    if req.model_id:
        kwargs["model_id"] = req.model_id
    try:
        return await _dispatch(compute_geodesic_map, **kwargs)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/measure/sampling-bias")
async def sampling_bias(req: SamplingBiasRequest) -> Dict[str, Any]:
    kwargs: Dict[str, Any] = {
        "sample_name": req.sample_name,
        "k": req.k,
        "n_bootstrap": req.n_bootstrap,
        "seed": req.seed,
    }
    if req.model_id:
        kwargs["model_id"] = req.model_id
    try:
        return await _dispatch(compute_sampling_bias_diagnostic, **kwargs)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/critique/market-colonisation")
async def market_colonisation(req: MarketColonisationRequest) -> Dict[str, Any]:
    kwargs: Dict[str, Any] = {"sample_name": req.sample_name, "k": req.k}
    if req.model_id:
        kwargs["model_id"] = req.model_id
    try:
        return await _dispatch(compute_market_colonisation_index, **kwargs)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/critique/ideological-topography")
async def ideological_topography(req: IdeologicalTopographyRequest) -> Dict[str, Any]:
    kwargs: Dict[str, Any] = {"sample_name": req.sample_name, "k": req.k}
    if req.model_id:
        kwargs["model_id"] = req.model_id
    try:
        return await _dispatch(compute_ideological_topography, **kwargs)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/critique/hegemonic-gravity")
async def hegemonic_gravity(req: HegemonicGravityRequest) -> Dict[str, Any]:
    kwargs: Dict[str, Any] = {"sample_name": req.sample_name, "k": req.k}
    if req.model_id:
        kwargs["model_id"] = req.model_id
    try:
        return await _dispatch(compute_hegemonic_gravity_map, **kwargs)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/critique/normative-transition")
async def normative_transition(req: NormativeTransitionRequest) -> Dict[str, Any]:
    kwargs: Dict[str, Any] = {"sample_name": req.sample_name, "k": req.k}
    if req.model_id:
        kwargs["model_id"] = req.model_id
    try:
        return await _dispatch(compute_normative_transition, **kwargs)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
