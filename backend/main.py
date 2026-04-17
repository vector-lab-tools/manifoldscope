"""
Manifoldscope backend — FastAPI server for intensive manifold reading.

Phase 0 exposes:
    GET  /status                       liveness + version + phase
    GET  /samples                      list available samples
    POST /measure/intrinsic-dimension  per-point TwoNN field + 3D projection
    POST /critique/market-colonisation gradient of market vocabulary + Measure
                                       attestation for provenance binding

Later phases will add further Measure operations (curvature, geodesic map,
density gradient field, void atlas, projection-distortion meter, sampling-bias
diagnostic) and further Critique operations (ideological topography, hegemonic
gravity, colonial geometry probe, archaeology of absence, dead zones map,
grammatical ideology, dissensus detector, counter-reading layer).
"""

from __future__ import annotations

import asyncio
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from operations.intrinsic_dimension import compute_intrinsic_dimension_field
from operations.market_colonisation import compute_market_colonisation_index
from sample.loader import AVAILABLE as AVAILABLE_SAMPLES

app = FastAPI(title="Manifoldscope Backend", version="0.0.1")

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


class MarketColonisationRequest(BaseModel):
    sample_name: str = Field(default="philosophy-of-technology-v1")
    k: int = Field(default=20, ge=3, le=200)
    model_id: Optional[str] = None


# --- routes ----------------------------------------------------------------


@app.get("/status")
async def status() -> Dict[str, Any]:
    return {
        "status": "ok",
        "tool": "manifoldscope",
        "version": "0.0.1",
        "phase": "0",
        "samples_available": AVAILABLE_SAMPLES,
        "operations_available": {
            "measure": ["intrinsic_dimension_field"],
            "critique": ["market_colonisation_index"],
        },
    }


@app.get("/samples")
async def samples() -> Dict[str, Any]:
    return {"samples": AVAILABLE_SAMPLES}


@app.post("/measure/intrinsic-dimension")
async def intrinsic_dimension(req: IntrinsicDimensionRequest) -> Dict[str, Any]:
    kwargs: Dict[str, Any] = {"sample_name": req.sample_name, "k": req.k}
    if req.model_id:
        kwargs["model_id"] = req.model_id
    try:
        return await asyncio.to_thread(compute_intrinsic_dimension_field, **kwargs)
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
        return await asyncio.to_thread(compute_market_colonisation_index, **kwargs)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
