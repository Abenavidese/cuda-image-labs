# backend/cuda_kernels.py

from typing import Dict, Tuple

import time
import numpy as np


def _conv2d_naive(image: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    """
    Convolución 2D naive en CPU (solo para pruebas iniciales).
    image: (H, W)
    kernel: (K, K), K impar
    """
    if image.ndim != 2 or kernel.ndim != 2:
        raise ValueError("image and kernel must be 2D arrays")

    H, W = image.shape
    K, K2 = kernel.shape

    if K != K2:
        raise ValueError("kernel must be square")

    if K % 2 == 0:
        raise ValueError("kernel size must be odd")

    r = K // 2

    # salida del mismo tamaño
    out = np.zeros_like(image, dtype=np.float32)

    # pad de bordes replicando valores
    padded = np.pad(image, pad_width=r, mode="edge").astype(np.float32)

    # conv clásica (sin flip de kernel, en procesamiento de imágenes es más correlación que conv pura)
    for y in range(H):
        for x in range(W):
            region = padded[y : y + K, x : x + K]  # zona KxK
            out[y, x] = float(np.sum(region * kernel))

    return out


def convolve_gpu_single(
    image: np.ndarray,
    kernel: np.ndarray,
    block_dim: Tuple[int, int],
    grid_dim: Tuple[int, int],
) -> Tuple[np.ndarray, Dict[str, float]]:
    """
    VERSION TEMPORAL EN CPU.
    Luego se reemplaza por implementación en PyCUDA.
    """

    start = time.perf_counter()
    result = _conv2d_naive(image, kernel)
    end = time.perf_counter()

    elapsed_ms = (end - start) * 1000.0

    timings = {
        "execution_time_ms": elapsed_ms,
        "kernel_time_ms": elapsed_ms,  # por ahora igual, luego separas si quieres
    }
    return result.astype(np.float32), timings


def convolve_gpu_prewitt(
    image: np.ndarray,
    kernel_x: np.ndarray,
    kernel_y: np.ndarray,
    block_dim: Tuple[int, int],
    grid_dim: Tuple[int, int],
) -> Tuple[np.ndarray, Dict[str, float]]:
    """
    VERSION TEMPORAL EN CPU para Prewitt.
    Aplica Gx y Gy y combina magnitud.
    """

    start = time.perf_counter()
    gx = _conv2d_naive(image, kernel_x)
    gy = _conv2d_naive(image, kernel_y)

    # Magnitud aproximada
    magnitude = np.sqrt(gx**2 + gy**2)
    end = time.perf_counter()

    elapsed_ms = (end - start) * 1000.0

    timings = {
        "execution_time_ms": elapsed_ms,
        "kernel_time_ms": elapsed_ms,
    }
    return magnitude.astype(np.float32), timings
