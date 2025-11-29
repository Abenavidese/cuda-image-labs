# CUDA Image Lab - Mock Backend (Testing)

Backend simulado para desarrollo del frontend **SIN CUDA**.

## 🎯 Propósito

Este backend **NO procesa imágenes**, solo devuelve la misma imagen que recibe. Permite al frontend:
- ✅ Probar la integración de la API
- ✅ Desarrollar sin necesitar GPU/CUDA
- ✅ Validar request/response structure
- ✅ Probar manejo de errores

## 📦 Instalación

### 1. Crear entorno virtual
```bash
python -m venv venv
```

### 2. Activar entorno virtual
```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Instalar dependencias (solo FastAPI, sin PyCUDA)
```bash
pip install -r requirements.txt
```

### 4. Iniciar servidor
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

or you can try with

```bash
python -m uvicorn app:app --reload
```

El servidor estará disponible en: `http://localhost:8000`

---

## 🌐 API Endpoints

### 1. Root
**GET** `/`

Confirma que es la versión mock.

---

### 2. Health Check
**GET** `/health`

```json
{
  "status": "ok"
}
```

---

### 3. Convolve (Mock)
**POST** `/convolve`

**Request:**
```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "filter": {
    "type": "prewitt",
    "mask_size": 3,
    "gain": 8.0
  },
  "cuda_config": {
    "block_dim": [16, 16],
    "grid_dim": [1, 1]
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "result_image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "execution_time_ms": 0.42,
  "kernel_time_ms": 0.38,
  "image_width": 640,
  "image_height": 480,
  "filter_used": "prewitt",
  "mask_size_used": 3,
  "block_dim": [16, 16],
  "grid_dim": [1, 1]
}
```

---

## 🔧 Diferencias con Backend Real

| Aspecto | Backend Real | Backend Mock |
|---------|--------------|--------------|
| **Dependencias** | FastAPI + PyCUDA + CUDA Toolkit | Solo FastAPI |
| **GPU** | NVIDIA GPU requerida | No requiere GPU |
| **Procesamiento** | Aplica filtros CUDA | NO aplica filtros |
| **Imagen resultado** | Imagen procesada | Misma imagen de entrada |
| **Validaciones** | Completas | Solo básicas (filter type, mask_size) |

---

## 📝 Validaciones Incluidas

El mock backend valida:
- ✅ `filter.type` debe ser: `prewitt`, `laplacian`, `gaussian`, `box_blur`
- ✅ `mask_size` debe ser impar
- ✅ Request body debe cumplir schema Pydantic

**Errores que devuelve:**
- `400 Bad Request` - Validación fallida
- `500 Internal Server Error` - Otro error

---

## 🚀 Uso para Frontend

### Desarrollo Local
```javascript
// Apuntar al mock backend
const API_URL = "http://localhost:8000";

// Mismo código que backend real
const response = await fetch(`${API_URL}/convolve`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    image_base64: imageBase64,
    filter: { type: "prewitt", mask_size: 3, gain: 8.0 },
    cuda_config: { block_dim: [16, 16], grid_dim: [1, 1] }
  })
});
```

### Producción (cambiar a backend real)
```javascript
// Cambiar a backend real (con CUDA)
const API_URL = "http://localhost:8000"; // o IP del servidor con GPU
```

---

## ⚠️ Notas Importantes

1. **NO usar en producción** - Este backend NO procesa imágenes
2. **Solo para desarrollo** - Permite al frontend trabajar sin GPU
3. **Compatible 100%** - Misma estructura de request/response
4. **Switch fácil** - Solo cambiar URL para usar backend real

---

## 🔄 Migración a Backend Real

Cuando tengas acceso al backend real:

1. Cambiar URL del backend
2. **Código del frontend NO cambia** (misma API)
3. ¡Listo! Imágenes procesadas con CUDA

---

## 📄 Ejemplo de Prueba

```bash
# Probar health
curl http://localhost:8000/health

# Probar convolve (PowerShell)
$body = @{
  image_base64 = "iVBORw0KGgo..."
  filter = @{
    type = "gaussian"
    mask_size = 5
  }
  cuda_config = @{
    block_dim = @(16, 16)
    grid_dim = @(1, 1)
  }
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/convolve -Method POST -Body $body -ContentType "application/json"
```

---

You can go to check the doc here

http://127.0.0.1:8000/docs#/default/convolve_convolve_post

## 👥 Colaboración

Este mock backend permite que:
- 🎨 **Frontend** desarrolle sin GPU
- 🔧 **Backend** trabaje en paralelo con CUDA
- 🤝 **Integración** sea plug-and-play (solo cambiar URL)
