# filters/gaussian.py
# Filtro Gaussiano: Suavizado basado en distribución Gaussiana 2D

import numpy as np

ALLOWED_SIZES = [3, 5, 7, 9, 21]

def gaussian_kernel(mask_size: int, sigma: float | None = None) -> np.ndarray:
    """
    Genera un kernel Gaussiano de tamaño mask_size x mask_size.
    
    El filtro Gaussiano es un filtro de suavizado que pondera los píxeles
    según una distribución gaussiana 2D: G(x,y) = e^(-(x²+y²)/(2σ²))
    
    Args:
        mask_size: Tamaño del kernel (debe ser impar). Valores permitidos: 3, 5, 7, 9, 21
        sigma: Desviación estándar de la gaussiana. Si es None, se calcula como mask_size/6.0
    
    Returns:
        np.ndarray: Kernel gaussiano normalizado de shape (mask_size, mask_size)
    
    Raises:
        ValueError: Si mask_size no está en ALLOWED_SIZES o es par
    """
    if mask_size not in ALLOWED_SIZES or mask_size % 2 == 0:
        raise ValueError(
            f"Invalid mask_size {mask_size} for gaussian. Allowed odd sizes: {ALLOWED_SIZES}"
        )

    # Calcular sigma automáticamente si no se proporciona
    if sigma is None:
        sigma = mask_size / 6.0

    # Crear malla de coordenadas centradas en 0
    ax = np.linspace(-(mask_size - 1) / 2.0, (mask_size - 1) / 2.0, mask_size)
    xx, yy = np.meshgrid(ax, ax)
    
    # Aplicar función gaussiana 2D
    kernel = np.exp(-(xx**2 + yy**2) / (2.0 * sigma**2))
    
    # Normalizar para que la suma sea 1
    kernel = kernel / np.sum(kernel)
    
    return kernel.astype(np.float32)
