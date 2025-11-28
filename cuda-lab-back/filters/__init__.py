# filters/__init__.py

from .box_blur import box_blur_kernel
from .gaussian import gaussian_kernel
from .laplacian import laplacian_kernel
from .prewitt import prewitt_kernels


def get_filter_kernel(filter_type: str, mask_size: int) -> dict:
    """
    Devuelve la info necesaria para la convolución según el filtro.
    - Para box_blur y gaussian: un solo kernel.
    - Para laplacian: un solo kernel 3x3.
    - Para prewitt: dos kernels (Gx, Gy).
    """
    ft = filter_type.lower()

    if ft == "box_blur":
        k = box_blur_kernel(mask_size)
        return {"type": "box_blur", "kernel": k, "mask_size_used": k.shape[0]}

    if ft == "gaussian":
        k = gaussian_kernel(mask_size)
        return {"type": "gaussian", "kernel": k, "mask_size_used": k.shape[0]}

    if ft == "laplacian":
        k = laplacian_kernel()
        return {"type": "laplacian", "kernel": k, "mask_size_used": k.shape[0]}

    if ft == "prewitt":
        gx, gy = prewitt_kernels()
        return {
            "type": "prewitt",
            "kernel_x": gx,
            "kernel_y": gy,
            "mask_size_used": gx.shape[0],
        }

    raise ValueError(f"Unknown filter type: {filter_type}")
