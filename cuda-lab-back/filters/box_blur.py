# filters/box_blur.py
# Filtro Box Blur: Promedio simple de vecinos

import numpy as np

ALLOWED_SIZES = [3, 5, 7, 9, 21]

def box_blur_kernel(mask_size: int) -> np.ndarray:
    """
    Genera un kernel Box Blur de tamaño mask_size x mask_size.
    
    El Box Blur es un filtro de suavizado que promedia todos los píxeles
    en una ventana cuadrada. Todos los valores del kernel son iguales a 1/(N*N).
    
    Args:
        mask_size: Tamaño del kernel (debe ser impar). Valores permitidos: 3, 5, 7, 9, 21
    
    Returns:
        np.ndarray: Kernel normalizado de shape (mask_size, mask_size)
    
    Raises:
        ValueError: Si mask_size no está en ALLOWED_SIZES
    """
    if mask_size not in ALLOWED_SIZES:
        raise ValueError(
            f"Invalid mask_size {mask_size} for box_blur. Allowed: {ALLOWED_SIZES}"
        )
    
    if mask_size % 2 == 0:
        raise ValueError(f"mask_size must be odd, got {mask_size}")
    
    # Crear kernel de unos y normalizar
    k = np.ones((mask_size, mask_size), dtype=np.float32)
    return k / (mask_size * mask_size)
