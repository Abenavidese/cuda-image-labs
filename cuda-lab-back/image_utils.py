# cuda-lab-back/image_utils.py

import base64
import io
from typing import Tuple

import numpy as np
from PIL import Image


def _strip_data_url_prefix(image_base64: str) -> str:
    """
    If the input is something like 'data:image/png;base64,AAAA...', remove the 'data:...base64,' prefix.
    """
    if "," in image_base64:
        return image_base64.split(",", 1)[1]
    return image_base64


def decode_image_base64(image_base64: str) -> np.ndarray:
    """
    Receives a base64 image string (possibly with data URL prefix)
    and returns a NumPy array in grayscale (float32) of shape (H, W).
    """
    if not image_base64:
        raise ValueError("image_base64 is empty")

    b64_data = _strip_data_url_prefix(image_base64)

    try:
        img_bytes = base64.b64decode(b64_data)
    except Exception:
        raise ValueError("Invalid base64 image string")

    img = Image.open(io.BytesIO(img_bytes)).convert("L")  # L = grayscale
    img_np = np.array(img).astype(np.float32)
    return img_np


def encode_image_base64(img_np: np.ndarray) -> str:
    """
    Receives a np.ndarray (H, W), normalizes/clips it to [0, 255] uint8,
    converts it to PNG in memory, and returns 'data:image/png;base64,...'.
    """
    if img_np.ndim != 2:
        raise ValueError("Expected 2D array for grayscale image")

    # Clip and convert to uint8
    img_clipped = np.clip(img_np, 0, 255).astype(np.uint8)

    img = Image.fromarray(img_clipped, mode="L")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    b64_bytes = base64.b64encode(buffer.read())
    b64_str = b64_bytes.decode("utf-8")

    return f"data:image/png;base64,{b64_str}"
