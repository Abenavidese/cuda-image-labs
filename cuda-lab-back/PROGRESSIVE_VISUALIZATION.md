# Visualización Progresiva de Procesamiento CUDA

## Descripción

Esta funcionalidad permite visualizar en tiempo real cómo CUDA procesa una imagen píxel por píxel, mostrando el progreso de aplicación de filtros de convolución de forma progresiva.

## ¿Cómo Funciona?

### Backend (`/convolve-stream`)

El nuevo endpoint utiliza **Server-Sent Events (SSE)** para transmitir actualizaciones en tiempo real:

1. **División en Chunks**: La imagen se divide en franjas horizontales (por defecto 32 filas por chunk)
2. **Procesamiento Secuencial**: Cada chunk se procesa con el filtro CUDA completo
3. **Transmisión Progresiva**: Después de procesar cada chunk, se envía el estado actual de la imagen
4. **Delay Configurable**: Pequeña pausa entre chunks (50ms) para hacer la visualización visible

### Frontend (`ProgressiveVisualization`)

Componente React que:

- **Consume SSE**: Lee el stream de eventos del backend
- **Actualiza en Tiempo Real**: Muestra la imagen procesándose línea por línea
- **Visualiza Métricas**: Progress bar, rows procesadas, chunks completados, tiempo transcurrido
- **Comparación Side-by-Side**: Muestra imagen original vs procesada simultáneamente

## Uso

1. **Cargar Imagen**: Selecciona una imagen en el panel principal
2. **Configurar Filtro**: Elige tipo de filtro, tamaño de máscara, y parámetros CUDA
3. **Iniciar Visualización**: Haz clic en "Start Visualization" en el panel de visualización progresiva
4. **Observar Proceso**: Verás cómo la imagen se procesa progresivamente de arriba hacia abajo
5. **Detener (opcional)**: Puedes cancelar el proceso en cualquier momento con "Stop"

## Parámetros Técnicos

### `progressive_convolution.py`

```python
chunk_size: int = 32  # Número de filas por chunk (ajustable)
time.sleep(0.05)      # Delay entre chunks en segundos (50ms)
```

- **chunk_size más pequeño** → Más frames, animación más fluida, mayor overhead
- **chunk_size más grande** → Menos frames, procesamiento más rápido, menos granularidad visual
- **delay más largo** → Visualización más lenta pero más fácil de seguir
- **delay más corto** → Procesamiento más rápido pero puede ser difícil de apreciar

## Casos de Uso

### Educativo
- Demostración de cómo funcionan los filtros de convolución
- Visualización del orden de procesamiento paralelo de CUDA
- Comprensión del impacto de diferentes tamaños de máscara

### Debugging
- Identificar problemas en los kernels CUDA observando artefactos visuales
- Verificar que el procesamiento es correcto en toda la imagen
- Comparar rendimiento entre diferentes configuraciones

### Demo/Presentación
- Mostrar capacidades de procesamiento GPU en tiempo real
- Efecto visual impactante para audiencias no técnicas
- Demostración de velocidad de CUDA vs CPU (potencial comparación)

## Arquitectura

```
Frontend (Next.js)                    Backend (FastAPI)
     │                                       │
     │  POST /convolve-stream               │
     ├──────────────────────────────────────>│
     │                                       │
     │                                  ┌────┴────┐
     │                                  │ Divide  │
     │                                  │ en      │
     │                                  │ Chunks  │
     │                                  └────┬────┘
     │                                       │
     │  SSE: data: {progress, image}    ┌───▼───┐
     │<─────────────────────────────────┤Process│
     │                                  │Chunk 1│
     │                                  └───┬───┘
     │                                      │
     │  SSE: data: {progress, image}    ┌──▼───┐
     │<─────────────────────────────────┤Process│
     │                                  │Chunk 2│
     │                                  └───┬───┘
     │                                      │
     │                ...                  ...
     │                                      │
     │  SSE: data: {completed: true}    ┌──▼───┐
     │<─────────────────────────────────┤ Done │
     │                                  └──────┘
```

## Performance

- **Overhead**: ~50ms por chunk (configurable)
- **Chunks**: Imagen de 512x512 con chunk_size=32 → 16 chunks
- **Tiempo Total**: Tiempo procesamiento + (chunks × delay)
- **Ejemplo**: Si procesamiento normal toma 100ms, con 16 chunks y 50ms delay → 100ms + (16 × 50ms) = 900ms total

## Mejoras Futuras

- [ ] Configurar `chunk_size` y `delay` desde el frontend
- [ ] Modo "instantáneo" vs "educativo" (delay 0 vs delay visible)
- [ ] Visualización de grid CUDA sobre la imagen
- [ ] Zoom en región específica durante procesamiento
- [ ] Comparación lado-a-lado con procesamiento CPU (NumPy/SciPy)
- [ ] Guardar video/GIF de la visualización progresiva
- [ ] Métricas de throughput (píxeles/segundo)

## Notas de Implementación

### Por qué SSE y no WebSockets?

- **SSE**: Unidireccional (servidor → cliente), perfecto para streaming de progreso
- **Más Simple**: No requiere biblioteca adicional, funciona sobre HTTP
- **Robusto**: Reconexión automática en caso de error
- **Suficiente**: No necesitamos comunicación bidireccional para esta funcionalidad

### Limitaciones

- La visualización es una simulación del procesamiento secuencial
- CUDA realmente procesa en paralelo (todos los píxeles simultáneamente)
- La división en chunks es artificial para propósitos educativos/visuales
- No refleja el verdadero patrón de ejecución de threads/blocks en GPU

### Autenticidad del Procesamiento

✅ **Cada chunk SÍ se procesa con el kernel CUDA real**
✅ **La imagen final es idéntica al endpoint `/convolve` normal**
✅ **Los tiempos de ejecución reflejan procesamiento real de GPU**

⚠️ **La división secuencial es artificial (GPU procesa en paralelo)**
⚠️ **El delay es cosmético (no refleja latencia real de GPU)**
