# cuda-lab-back/app.py


from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

from convolution_service import process_convolution_request  

app = FastAPI(title="CUDA Image Lab Backend")

# ---------- Pydantic Models ----------

class FilterConfig(BaseModel):
    type: str           # filter type, e.g., "blur", "sharpen"
    mask_size: int      # filter mask size
class CudaConfig(BaseModel):
    block_dim: List[int]   # [blockDimX, blockDimY]
    grid_dim: List[int]    # [gridDimX, gridDimY]

class ConvolutionRequest(BaseModel):
    image_base64: str
    filter: FilterConfig
    cuda_config: CudaConfig


# ---------- Routes ----------

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/convolve")
def convolve(req: ConvolutionRequest):
    """
    Main endpoint that applies convolution on the GPU.
    Receives a ConvolutionRequest, passes it to convolution_service, and returns the result.
    """
    try:
        payload = req.model_dump()  # dict with image_base64, filter, cuda_config
        result = process_convolution_request(payload)
        return result
    except ValueError as e:
        # Data validation errors (mask_size, filter, etc.)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Unexpected errors
        raise HTTPException(status_code=500, detail="Internal server error")
