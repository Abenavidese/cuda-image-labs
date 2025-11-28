# backend/convolution_service.py

from typing import Dict, Any, Tuple

import numpy as np

from image_utils import decode_image_base64, encode_image_base64
from filters import get_filter_kernel
from cuda_kernels import (
    convolve_gpu_single,
    convolve_gpu_prewitt,
)


def process_convolution_request(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Processes a convolution request.
    Steps:
    1. Extract parameters from payload
    2. Decode base64 image to NumPy array
    3. Get filter kernel(s)
    4. Execute convolution (CUDA)
    5. Encode result to base64
    6. Build response
    """

    # -------- 1. Extraer parámetros del payload --------
    try:
        image_b64: str = payload["image_base64"]
        filter_conf: Dict[str, Any] = payload["filter"]
        cuda_conf: Dict[str, Any] = payload["cuda_config"]
    except KeyError as e:
        raise ValueError(f"Missing field in payload: {e!s}")

    filter_type: str = filter_conf.get("type", "").lower()
    mask_size: int = int(filter_conf.get("mask_size", 0))

    block_dim_list = cuda_conf.get("block_dim", [])
    grid_dim_list = cuda_conf.get("grid_dim", [])

    if len(block_dim_list) != 2 or len(grid_dim_list) != 2:
        raise ValueError("cuda_config.block_dim and grid_dim must have length 2")

    block_dim: Tuple[int, int] = (int(block_dim_list[0]), int(block_dim_list[1]))
    grid_dim: Tuple[int, int] = (int(grid_dim_list[0]), int(grid_dim_list[1]))

    if block_dim[0] <= 0 or block_dim[1] <= 0:
        raise ValueError("block_dim values must be > 0")
    if grid_dim[0] <= 0 or grid_dim[1] <= 0:
        raise ValueError("grid_dim values must be > 0")

    # -------- 2. Decodificar imagen base64 -> NumPy --------
    img_np: np.ndarray = decode_image_base64(image_b64)
    height, width = img_np.shape

    # -------- 3. Obtener kernel(s) según filtro --------
    # get_filter_kernel puede lanzar ValueError si el tipo o mask_size es inválido
    filter_info = get_filter_kernel(filter_type, mask_size)
    filter_used: str = filter_info["type"]
    mask_size_used: int = int(filter_info["mask_size_used"])

    # -------- execute --------

    if filter_used == "prewitt":
        kernel_x = filter_info["kernel_x"]
        kernel_y = filter_info["kernel_y"]

        result_np, timings = convolve_gpu_prewitt(
            img_np,
            kernel_x,
            kernel_y,
            block_dim=block_dim,
            grid_dim=grid_dim,
        )
    else:
        kernel = filter_info["kernel"]

        result_np, timings = convolve_gpu_single(
            img_np,
            kernel,
            block_dim=block_dim,
            grid_dim=grid_dim,
        )

    # -------- 5. Codificar resultado a base64 --------
    result_b64: str = encode_image_base64(result_np)

    # -------- 6. Armar respuesta --------
    execution_time_ms = float(timings.get("execution_time_ms", 0.0))
    kernel_time_ms = float(timings.get("kernel_time_ms", 0.0))

    response: Dict[str, Any] = {
        "status": "ok",
        "result_image_base64": result_b64,
        "execution_time_ms": execution_time_ms,
        "kernel_time_ms": kernel_time_ms,
        "image_width": int(width),
        "image_height": int(height),
        "filter_used": filter_used,
        "mask_size_used": mask_size_used,
        "block_dim": [block_dim[0], block_dim[1]],
        "grid_dim": [grid_dim[0], grid_dim[1]],
    }

    return response
