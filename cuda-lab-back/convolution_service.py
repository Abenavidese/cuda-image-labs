from filters import get_filter_kernel
from image_utils import decode_image_base64, encode_image_base64
from cuda_kernels import convolve_gpu_single

def process_convolution_request(payload: dict) -> dict:
    """Main orchestrator - delegates to each filter implementation."""
    image_b64 = payload["image_base64"]
    filter_conf = payload["filter"]
    cuda_conf = payload["cuda_config"]

    filter_type = filter_conf["type"]
    mask_size = int(filter_conf["mask_size"])
    gain = float(filter_conf.get("gain", 8.0))  # Para Prewitt

    block_dim = tuple(cuda_conf["block_dim"])
    grid_dim = tuple(cuda_conf["grid_dim"])

    img_np = decode_image_base64(image_b64)
    height, width = img_np.shape

    # Get filter
    filter_info = get_filter_kernel(filter_type, mask_size)
    filter_used = filter_info["type"]
    mask_size_used = filter_info["mask_size_used"]

    # Execute filter based on type
    if filter_used == "prewitt":
        # Prewitt has its own complete CUDA function in filters/prewitt.py
        prewitt_func = filter_info["cuda_function"]
        result_np, timings = prewitt_func(img_np, block_dim, grid_dim, gain=gain, mask_size=mask_size_used)
    elif filter_used == "laplacian":
        # Laplacian has its own complete CUDA function in filters/laplacian.py
        laplacian_func = filter_info["cuda_function"]
        result_np, timings = laplacian_func(img_np, block_dim, grid_dim, mask_size=mask_size_used)
    elif filter_used == "gaussian":
        # Gaussian has its own complete CUDA function in filters/gaussian.py
        gaussian_func = filter_info["cuda_function"]
        result_np, timings = gaussian_func(img_np, block_dim, grid_dim, mask_size=mask_size_used)
    else:
        # Other filters use generic kernel (only box_blur now)
        result_np, timings = convolve_gpu_single(
            img_np,
            filter_info["kernel"],
            block_dim,
            grid_dim,
        )

    # Encode result
    result_b64 = encode_image_base64(result_np)

    return {
        "status": "ok",
        "result_image_base64": result_b64,
        "execution_time_ms": float(timings.get("execution_time_ms", 0.0)),
        "kernel_time_ms": float(timings.get("kernel_time_ms", 0.0)),
        "image_width": width,
        "image_height": height,
        "filter_used": filter_used,
        "mask_size_used": mask_size_used,
        "block_dim": list(block_dim),
        "grid_dim": list(grid_dim),
    }
