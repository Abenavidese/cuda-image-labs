# cuda-lab-back-testing/app.py
# Mock backend for frontend testing - NO CUDA REQUIRED
# Returns the same image without processing

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import time

app = FastAPI(title="CUDA Image Lab Backend - MOCK VERSION")

# ---------- Pydantic Models (same as real backend) ----------

class FilterConfig(BaseModel):
    type: str           # filter type: "prewitt", "laplacian", "gaussian", "box_blur"
    mask_size: int      # filter mask size
    gain: float = 8.0   # gain for edge enhancement (Prewitt)
    
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
    """Health check endpoint - same as real backend"""
    return {"status": "ok"}

@app.post("/convolve")
def convolve(req: ConvolutionRequest):
    """
    Mock convolution endpoint - returns the SAME image without processing.
    Simulates real backend response structure for frontend testing.
    """
    try:
        # Simulate some processing time
        time.sleep(0.01)
        
        # Extract request data
        image_b64 = req.image_base64
        filter_type = req.filter.type
        mask_size = req.filter.mask_size
        gain = req.filter.gain
        block_dim = req.cuda_config.block_dim
        grid_dim = req.cuda_config.grid_dim
        
        # Validate filter type (just to match real backend)
        valid_filters = ["prewitt", "laplacian", "gaussian", "box_blur"]
        if filter_type.lower() not in valid_filters:
            raise ValueError(f"Unknown filter type: {filter_type}. Valid types: {valid_filters}")
        
        # Validate mask_size is odd
        if mask_size % 2 == 0:
            raise ValueError(f"mask_size must be odd, got {mask_size}")
        
        # Mock response - return SAME image without processing
        return {
            "status": "ok",
            "result_image_base64": image_b64,  # SAME IMAGE - NO PROCESSING
            "execution_time_ms": 0.42,         # Fake timing
            "kernel_time_ms": 0.38,            # Fake timing
            "image_width": 640,                # Hardcoded
            "image_height": 480,               # Hardcoded
            "filter_used": filter_type.lower(),
            "mask_size_used": mask_size,
            "block_dim": block_dim,
            "grid_dim": grid_dim,
        }
        
    except ValueError as e:
        # Data validation errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Any other error
        raise HTTPException(status_code=500, detail=f"Mock backend error: {str(e)}")


@app.get("/")
def root():
    """Root endpoint - indicates this is the mock version"""
    return {
        "message": "CUDA Image Lab Backend - MOCK VERSION",
        "description": "This is a mock backend for frontend testing. No CUDA required.",
        "note": "Images are returned WITHOUT processing (same as input)",
        "endpoints": {
            "health": "GET /health",
            "convolve": "POST /convolve"
        }
    }
