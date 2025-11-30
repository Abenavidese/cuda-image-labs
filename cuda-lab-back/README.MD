# CUDA Image Lab - Backend

Backend de procesamiento de imágenes con aceleración GPU usando CUDA y FastAPI.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Arquitectura](#arquitectura)
- [API Endpoints](#api-endpoints)
- [Filtros Disponibles](#filtros-disponibles)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Parámetros CUDA](#parámetros-cuda)

---

## 🎯 Descripción

Sistema de procesamiento de imágenes en tiempo real con aceleración GPU NVIDIA CUDA. Implementa 4 filtros de convolución optimizados:

- **Prewitt**: Detección de bordes (primera derivada)
- **Laplacian**: Detección de bordes (segunda derivada) / LoG
- **Gaussian**: Suavizado con distribución gaussiana
- **Box Blur**: Suavizado rápido con promedio simple

Cada filtro utiliza **convolución separable** para máxima eficiencia: O(2N) vs O(N²).

---

## 🔧 Requisitos

### Hardware
- GPU NVIDIA con soporte CUDA (Compute Capability >= 3.0)
- Mínimo 2GB VRAM recomendado

### Software
- Python 3.10+
- CUDA Toolkit 11.0+ 
- Visual Studio Build Tools (Windows)
- NVIDIA GPU Drivers actualizados

### Dependencias Python
```txt
fastapi
uvicorn
pycuda
numpy
pillow
pydantic
```

---

## 📦 Instalación

### 1. Activar entorno virtual
```powershell
.\venv\Scripts\Activate.ps1
```

### 2. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 3. Verificar CUDA
```bash
nvidia-smi
```

### 4. Iniciar servidor
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

O sin auto-reload:
```bash
python -c "import uvicorn; uvicorn.run('app:app', host='0.0.0.0', port=8000)"
```

---

## 🏗️ Arquitectura

```
cuda-lab-back/
├── app.py                      # FastAPI application
├── convolution_service.py      # Main orchestrator
├── cuda_kernels.py             # Shared CUDA context
├── image_utils.py              # Image encoding/decoding
├── filters/
│   ├── __init__.py            # Filter router
│   ├── prewitt.py             # Prewitt filter (5 CUDA kernels)
│   ├── laplacian.py           # Laplacian/LoG (3 CUDA kernels)
│   ├── gaussian.py            # Gaussian (4 CUDA kernels)
│   └── box_blur.py            # Box Blur (2 CUDA kernels)
└── tests/
    └── ...
```

**Principios de diseño:**
- ✅ Lazy CUDA initialization (contexto compartido)
- ✅ Cada filtro auto-contenido en `filters/`
- ✅ Grid dimensions auto-calculadas
- ✅ Kernels separables para eficiencia
- ✅ Manejo de errores robusto

---

## 🌐 API Endpoints

### 1. Health Check

**Endpoint:** `GET /health`

**Respuesta:**
```json
{
  "status": "ok"
}
```

---

### 2. Aplicar Filtro de Convolución

**Endpoint:** `POST /convolve`

**Request Body:**
```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "filter": {
    "type": "prewitt | laplacian | gaussian | box_blur",
    "mask_size": 3,
    "gain": 8.0
  },
  "cuda_config": {
    "block_dim": [16, 16],
    "grid_dim": [29, 40]
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "result_image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "execution_time_ms": 0.45,
  "kernel_time_ms": 0.42,
  "image_width": 640,
  "image_height": 480,
  "filter_used": "prewitt",
  "mask_size_used": 3,
  "block_dim": [16, 16],
  "grid_dim": [29, 40]
}
```

---

## 🎨 Filtros Disponibles

### 1. 🔍 Prewitt - Detección de Bordes Direccional

**Descripción:** Detecta bordes usando gradientes en X e Y (primera derivada).

**Algoritmo:** Separable - 5 kernels CUDA
1. `box_vert_u8_to_f` - Suma vertical
2. `prewitt_x_from_V` - Gradiente X con pesos [-1, 0, +1]
3. `box_horiz_u8_to_f` - Suma horizontal  
4. `prewitt_y_from_H` - Gradiente Y con pesos [-1, 0, +1]
5. `combine_mag_to_gray` - Combina: |gx| + |gy| con gain

**Parámetros:**
- `mask_size`: Tamaño del kernel (3, 5, 7, 9, 21...) - debe ser impar
- `gain`: Factor de realce de bordes (1.0-10.0+)
  - 1.0 - 3.0: Bordes sutiles
  - 4.0 - 6.0: Moderado
  - 7.0 - 10.0: Fuerte (default 8.0)
  - 10.0+: Muy intenso

**Ejemplo:**
```json
{
  "filter": {
    "type": "prewitt",
    "mask_size": 3,
    "gain": 8.0
  }
}
```

**Resultado:** Imagen con bordes resaltados en blanco sobre fondo oscuro.

---

### 2. ⚡ Laplacian - Detección de Bordes Omnidireccional

**Descripción:** Detecta bordes usando segunda derivada (cambios rápidos de intensidad).

**Modos:**

#### A) Laplacian Clásico 3x3
```
[-1 -1 -1]
[-1  8 -1]
[-1 -1 -1]
```
**Uso:** `mask_size: 3`

#### B) Laplacian of Gaussian (LoG) NxN
Combina suavizado Gaussiano + Laplaciano para reducir ruido.

Fórmula: `LoG(x,y) = -((r² - 2σ²)/σ⁴) * exp(-r²/(2σ²))`  
donde `σ = N / 6`

**Algoritmo LoG:** 3 kernels CUDA
1. `conv_log_u8_to_f` - Convolución NxN con kernel LoG
2. `f_abs_to_u8` - Valor absoluto + clamp [0,255]

**Parámetros:**
- `mask_size`: 
  - `3` → Laplacian clásico (rápido)
  - `5, 7, 9, 21, 65...` → LoG (más suave, menos ruido)

**Ejemplo:**
```json
{
  "filter": {
    "type": "laplacian",
    "mask_size": 9
  }
}
```

**Resultado:** Bordes finos en todas direcciones.

---

### 3. 🌫️ Gaussian - Suavizado de Alta Calidad

**Descripción:** Suavizado con distribución gaussiana 2D - reduce ruido preservando bordes.

**Algoritmo:** Separable - 4 kernels CUDA
1. `u8_to_f` - Convierte uint8 → float
2. `gauss_horiz_f` - Convolución horizontal 1D
3. `gauss_vert_f` - Convolución vertical 1D
4. `f_to_u8` - Convierte float → uint8

**Fórmula Kernel 1D:**  
`G(x) = exp(-x²/(2σ²))` normalizado, donde `σ = N / 6`

**Parámetros:**
- `mask_size`: Tamaño del kernel (3, 5, 7, 9, 21, 61, 121...)
  - Más grande = más suavizado
  - N=3: Suavizado mínimo
  - N=21: Suavizado medio
  - N=121: Suavizado intenso

**Ejemplo:**
```json
{
  "filter": {
    "type": "gaussian",
    "mask_size": 21
  }
}
```

**Resultado:** Imagen suavizada sin artefactos, preserva estructura.

---

### 4. 📦 Box Blur - Suavizado Rápido

**Descripción:** Promedio simple de vecinos - el más rápido, calidad media.

**Algoritmo:** Separable - 2 kernels CUDA
1. `box_horiz_u8_to_f` - Suma horizontal
2. `box_vert_f_to_u8` - Suma vertical + normalización (1/N²)

**Parámetros:**
- `mask_size`: Tamaño del kernel (3, 5, 7, 9, 21...)
  - N=3: Suavizado ligero
  - N=9: Suavizado moderado
  - N=21: Suavizado fuerte

**Ejemplo:**
```json
{
  "filter": {
    "type": "box_blur",
    "mask_size": 9
  }
}
```

**Resultado:** Imagen suavizada uniformemente (puede verse "blocky").

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Prewitt con Gain Ajustable

```json
{
  "image_base64": "/9j/4AAQSkZJRg...",
  "filter": {
    "type": "prewitt",
    "mask_size": 5,
    "gain": 6.0
  },
  "cuda_config": {
    "block_dim": [16, 16],
    "grid_dim": [1, 1]
  }
}
```

### Ejemplo 2: LoG 65x65 (Alta Calidad)

```json
{
  "image_base64": "/9j/4AAQSkZJRg...",
  "filter": {
    "type": "laplacian",
    "mask_size": 65
  },
  "cuda_config": {
    "block_dim": [16, 16],
    "grid_dim": [1, 1]
  }
}
```

### Ejemplo 3: Gaussian Suave

```json
{
  "image_base64": "/9j/4AAQSkZJRg...",
  "filter": {
    "type": "gaussian",
    "mask_size": 21
  },
  "cuda_config": {
    "block_dim": [32, 16],
    "grid_dim": [1, 1]
  }
}
```

### Ejemplo 4: Box Blur Rápido

```json
{
  "image_base64": "/9j/4AAQSkZJRg...",
  "filter": {
    "type": "box_blur",
    "mask_size": 9
  },
  "cuda_config": {
    "block_dim": [16, 16],
    "grid_dim": [1, 1]
  }
}
```

---

## ⚙️ Parámetros CUDA

### Block Dimensions (`block_dim`)

**Descripción:** Tamaño del bloque de threads CUDA.

**Valores recomendados:**
- `[16, 16]` - Balanceado (256 threads)
- `[32, 16]` - Más threads en X (512 threads)
- `[8, 8]` - Menor uso (64 threads)

**Límites:**
- Máximo: 1024 threads por bloque
- Común: 256-512 threads

### Grid Dimensions (`grid_dim`)

**Descripción:** Número de bloques en la grid. **Se auto-calcula internamente.**

**Fórmula:**
```
gridX = (image_width + blockX - 1) / blockX
gridY = (image_height + blockY - 1) / blockY
```

**Nota:** Puedes enviar `[1, 1]` - será recalculado automáticamente.

---

## 📊 Comparación de Filtros

| Filtro | Propósito | Velocidad | Calidad | Separable | Kernels CUDA |
|--------|-----------|-----------|---------|-----------|--------------|
| **Prewitt** | Bordes direccionales | ⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ | 5 |
| **Laplacian** | Bordes omnidireccionales | ⚡⚡⚡ | ⭐⭐⭐⭐ | ❌ | 3 |
| **Gaussian** | Suavizado calidad | ⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ | 4 |
| **Box Blur** | Suavizado rápido | ⚡⚡⚡⚡ | ⭐⭐⭐ | ✅ | 2 |

---

## 🐛 Solución de Problemas

### Error: "CUDA initialization error"
- Verifica drivers NVIDIA: `nvidia-smi`
- Instala CUDA Toolkit
- Reinicia el sistema

### Error: "cuModuleLoadDataEx failed"
- Verifica Visual Studio Build Tools instalado
- Instala Windows SDK
- Reinicia terminal como administrador

### Imagen resultante en negro
- Verifica que la imagen base64 esté correcta
- Revisa el `gain` en Prewitt (no uses valores muy altos)
- Prueba con `mask_size` más pequeño primero

### Rendimiento lento
- Aumenta `block_dim` a `[32, 16]`
- Usa kernels más pequeños (`mask_size: 3-9`)
- Verifica que no haya otros procesos usando la GPU

---

## 📝 Notas Técnicas

### Convolución Separable
Todos los filtros excepto Laplacian 3x3 usan convolución separable:
- Complejidad: O(2N×W×H) vs O(N²×W×H)
- Ejemplo: N=21 → 42 operaciones vs 441 operaciones por pixel

### Lazy CUDA Initialization
El contexto CUDA se inicializa solo cuando se necesita:
```python
_initialize_cuda()  # Llamado en el primer uso
```

### Manejo de Memoria
Cada filtro gestiona su propia memoria GPU:
- Prewitt: 6 buffers (gray, V, H, gx, gy, out)
- Laplacian 3x3: 2 buffers (gray, out)
- Laplacian LoG: 4 buffers (gray, K, tmpF, out)
- Gaussian: 6 buffers (u8, in, tmp, out, k1d, result)
- Box Blur: 3 buffers (in, out, tmp)

---

## 🚀 Roadmap

- [ ] Soporte para imágenes RGB (actualmente solo grayscale)
- [ ] Sobel filter
- [ ] Canny edge detection
- [ ] Bilateral filter
- [ ] Batch processing (múltiples imágenes)
- [ ] WebSocket streaming

---

## 📄 Licencia

MIT License

---

## 👥 Contribuciones

Desarrollado como proyecto académico de CUDA Parallel Computing.
