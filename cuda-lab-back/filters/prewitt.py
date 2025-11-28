import numpy as np

def prewitt_kernels() -> tuple[np.ndarray, np.ndarray]:
    gx = np.array(
        [
            [-1, 0, 1],
            [-1, 0, 1],
            [-1, 0, 1],
        ],
        dtype=np.float32,
    )

    gy = np.array(
        [
            [-1, -1, -1],
            [ 0,  0,  0],
            [ 1,  1,  1],
        ],
        dtype=np.float32,
    )

    return gx, gy
