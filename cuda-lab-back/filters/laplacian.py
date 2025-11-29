# filters/laplacian.py
# Filtro Laplaciano: Detector de bordes basado en segunda derivada

import numpy as np

def laplacian_kernel() -> np.ndarray:
    """
    Genera el kernel Laplaciano 3x3 para detección de bordes.
    
    El Laplaciano es un operador de segunda derivada que detecta regiones
    de cambio rápido de intensidad (bordes). Usa la máscara de 4 vecinos:
    
    [ 0  1  0]
    [ 1 -4  1]
    [ 0  1  0]
    
    El valor central negativo detecta diferencias con los vecinos ortogonales.
    
    Returns:
        np.ndarray: Kernel Laplaciano de shape (3, 3)
    
    Note:
        Este filtro siempre retorna una máscara 3x3, independiente del
        mask_size solicitado por el usuario (se ignora en get_filter_kernel).
    """
    k = np.array(
        [
            [0,  1, 0],
            [1, -4, 1],
            [0,  1, 0],
        ],
        dtype=np.float32,
    )
    return k
