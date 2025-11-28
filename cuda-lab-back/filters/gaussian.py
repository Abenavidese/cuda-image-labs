import numpy as np

ALLOWED_SIZES = [3, 5, 7, 9, 21]

def gaussian_kernel(mask_size: int, sigma: float | None = None) -> np.ndarray:
    if mask_size not in ALLOWED_SIZES or mask_size % 2 == 0:
        raise ValueError(
            f"Invalid mask_size {mask_size} for gaussian. Allowed odd sizes: {ALLOWED_SIZES}"
        )

    if sigma is None:
        sigma = mask_size / 6.0

    ax = np.linspace(-(mask_size - 1) / 2.0, (mask_size - 1) / 2.0, mask_size)
    xx, yy = np.meshgrid(ax, ax)
    kernel = np.exp(-(xx**2 + yy**2) / (2.0 * sigma**2))
    kernel = kernel / np.sum(kernel)
    return kernel.astype(np.float32)
