import numpy as np

ALLOWED_SIZES = [3, 5, 7, 9, 21]

def box_blur_kernel(mask_size: int) -> np.ndarray:
    if mask_size not in ALLOWED_SIZES:
        raise ValueError(
            f"Invalid mask_size {mask_size} for box_blur. Allowed: {ALLOWED_SIZES}"
        )
    k = np.ones((mask_size, mask_size), dtype=np.float32)
    return k / (mask_size * mask_size)
