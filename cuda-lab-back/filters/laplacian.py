import numpy as np

def laplacian_kernel() -> np.ndarray:
    k = np.array(
        [
            [0,  1, 0],
            [1, -4, 1],
            [0,  1, 0],
        ],
        dtype=np.float32,
    )
    return k
