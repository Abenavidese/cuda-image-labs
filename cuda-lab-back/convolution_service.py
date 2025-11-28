#TODO# backend/convolution_service.py

def process_convolution_request(payload: dict) -> dict:
    """
    Por ahora solo devuelve algo fijo, para probar que el endpoint funciona.
    Luego aquí metes la lógica real.
    """
    # Aquí podrías ya extraer campos solo para ver que llegan bien:
    image_b64 = payload.get("image_base64", "")[:30]  # primeros 30 chars
    filter_type = payload.get("filter", {}).get("type", "unknown")

    return {
        "status": "ok",
        "message": "stub - convolution not implemented yet",
        "received_filter": filter_type,
        "image_b64_sample": image_b64
    }
