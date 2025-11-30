# cuda-lab-back/app.py


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import json

from convolution_service import process_convolution_request
from progressive_convolution import process_progressive_convolution
from image_utils import decode_image_base64

app = FastAPI(title="CUDA Image Lab Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# ---------- Pydantic Models ----------

class FilterConfig(BaseModel):
    type: str           # filter type, e.g., "blur", "sharpen"
    mask_size: int      # filter mask size
    gain: float = 8.0   # gain for edge enhancement (Prewitt), default 8.0
    
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
    except RuntimeError as e:
        # CUDA errors (no GPU, compilation failed, etc.)
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        # Unexpected errors - show details for debugging
        import traceback
        error_detail = f"Internal server error: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)


@app.post("/convolve-stream")
async def convolve_stream(req: ConvolutionRequest):
    """
    Stream endpoint that applies convolution progressively and streams results.
    Returns Server-Sent Events (SSE) with progressive updates showing pixel-by-pixel processing.
    """
    try:
        # Decode image first
        img_np = decode_image_base64(req.image_base64)
        
        filter_type = req.filter.type
        mask_size = req.filter.mask_size
        gain = req.filter.gain
        block_dim = tuple(req.cuda_config.block_dim)
        grid_dim = tuple(req.cuda_config.grid_dim)
        
        # Generator function for SSE
        def event_stream():
            try:
                for update in process_progressive_convolution(
                    img_np, filter_type, mask_size, gain, block_dim, grid_dim
                ):
                    # Format as SSE: data: {json}\n\n
                    yield f"data: {json.dumps(update)}\n\n"
            except Exception as e:
                import traceback
                error_data = {
                    "error": str(e),
                    "traceback": traceback.format_exc()
                }
                yield f"data: {json.dumps(error_data)}\n\n"
        
        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",  # Disable nginx buffering
            }
        )
    except Exception as e:
        import traceback
        error_detail = f"Stream initialization error: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)
