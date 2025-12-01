# CUDA Image Lab 

<div align="center">

![CUDA](https://img.shields.io/badge/CUDA-12.0-76B900?style=for-the-badge&logo=nvidia&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.0-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**GPU-Accelerated Image Processing Platform**

Real-time convolution filters powered by NVIDIA CUDA with progressive visualization

[Features](#features) • [Architecture](#architecture) • [Installation](#installation) • [API](#api-documentation) • [Development](#development)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Backend Technical Details](#backend-technical-details)
- [Frontend Technical Details](#frontend-technical-details)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [CUDA Implementation](#cuda-implementation)
- [Progressive Visualization](#progressive-visualization)
- [Docker Configuration](#docker-configuration)
- [Performance](#performance)
- [Team](#team)

---

## Overview

CUDA Image Lab is a high-performance image processing platform that leverages NVIDIA CUDA for GPU-accelerated convolution operations. The platform features:

- **Real-time Processing**: Sub-100ms execution times for most filters
- **4 Specialized Filters**: Prewitt, Laplacian, Gaussian, Box Blur
- **Progressive Visualization**: Watch pixel-by-pixel processing via Server-Sent Events
- **Dynamic Configuration**: Adjustable CUDA grid/block dimensions and mask sizes
- **Modern UI**: Next.js 16 with Tailwind CSS and shadcn/ui components
- **Production Ready**: Fully Dockerized with GPU passthrough support

---

## Features

### Core Functionality

#### Image Processing
- **Prewitt Edge Detection**: Sobel-style gradient computation with configurable gain
- **Laplacian Edge Detection**: Second derivative operator for edge highlighting
- **Gaussian Blur**: Separable convolution with computed kernel weights
- **Box Blur**: Fast averaging filter with optimized memory access

#### CUDA Capabilities
- **Custom Kernel Compilation**: Direct `nvcc` compilation for Blackwell architecture (sm_89)
- **Separable Convolution**: Optimized 2-pass algorithm for O(n) complexity
- **Dynamic Mask Sizes**: Support for 3×3, 5×5, 9×9, 21×21, and custom odd sizes
- **Flexible Grid Configuration**: User-controllable block and grid dimensions

#### Visualization
- **Progressive Processing**: Server-Sent Events streaming with chunk-based updates
- **Auto Showcase**: Automated demo carousel with 4 filter examples
- **Real-time Metrics**: Execution time, kernel time, and throughput visualization
- **Interactive Charts**: Recharts-powered performance comparisons

#### Developer Experience
- **Mock Backend**: GPU-less testing environment for frontend development
- **Hot Reload**: Next.js Turbopack for instant feedback
- **Type Safety**: Full TypeScript coverage with Zod validation
- **CORS Configured**: Cross-origin support for local development

---

##  System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Browser                       │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Next.js Frontend (Port 3000)                │     │
│  │  • React 18 with Server Components                  │     │
│  │  • Tailwind CSS + shadcn/ui                         │     │
│  │  • Server-Sent Events Client                        │     │
│  │  • Recharts Visualization                           │     │
│  └────────────┬───────────────────────────────────────┘     │
└───────────────┼─────────────────────────────────────────────┘
                │ HTTP/SSE
                │ CORS: localhost:3000
                ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Port 8000)                     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Endpoints:                                         │     │
│  │   • POST /convolve        → Instant processing      │     │
│  │   • POST /convolve-stream → Progressive SSE         │     │
│  │   • GET  /health          → Health check            │     │
│  └────────────┬───────────────────────────────────────┘     │
│               │                                              │
│  ┌────────────▼───────────────────────────────────────┐     │
│  │         Convolution Service Layer                   │     │
│  │  • Image decoding (base64 → NumPy)                  │     │
│  │  • Filter selection & validation                    │     │
│  │  • CUDA orchestration                               │     │
│  │  • Result encoding (NumPy → base64)                 │     │
│  └────────────┬───────────────────────────────────────┘     │
│               │                                              │
│  ┌────────────▼───────────────────────────────────────┐     │
│  │              Filter Modules                         │     │
│  │  • filters/prewitt.py    (Gradient + Gain)          │     │
│  │  • filters/laplacian.py  (2nd Derivative)           │     │
│  │  • filters/gaussian.py   (Separable Blur)           │     │
│  │  • filters/box_blur.py   (Fast Average)             │     │
│  └────────────┬───────────────────────────────────────┘     │
│               │                                              │
│  ┌────────────▼───────────────────────────────────────┐     │
│  │           CUDA Compilation Layer                    │     │
│  │  • compile_cuda_kernel_to_ptx()                     │     │
│  │  • subprocess → nvcc -arch=sm_89 --ptx              │     │
│  │  • drv.module_from_buffer(ptx_code)                 │     │
│  └────────────┬───────────────────────────────────────┘     │
└───────────────┼─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│              NVIDIA GPU (RTX 5070 Ti)                        │
│  • Architecture: Blackwell (sm_89)                           │
│  • CUDA Version: 13.0 (Driver 581.57)                        │
│  • Memory: 12GB VRAM                                         │
│  • Compute Capability: 8.9                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Python | 3.10 | Application runtime |
| **Framework** | FastAPI | 0.115+ | Async REST API server |
| **GPU Computing** | PyCUDA | 2024.1+ | CUDA kernel management |
| **CUDA Toolkit** | NVIDIA CUDA | 12.0 | GPU compilation & execution |
| **Image Processing** | Pillow (PIL) | 11.0+ | Image I/O and manipulation |
| **Numerical Computing** | NumPy | 2.2.1 | Array operations |
| **Base Image** | nvidia/cuda | 12.0.0-devel-ubuntu22.04 | Docker container |

### Frontend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Next.js | 16.0.3 | React metaframework |
| **Runtime** | Node.js | 20 Alpine | JavaScript runtime |
| **Language** | TypeScript | 5.0+ | Type-safe development |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **UI Components** | shadcn/ui | Latest | Radix UI + Tailwind |
| **Charts** | Recharts | 2.13+ | Data visualization |
| **Icons** | Lucide React | Latest | Icon library |
| **State Management** | React Hooks | 18+ | Local state management |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Containerization** | Docker | Application packaging |
| **Orchestration** | Docker Compose | Multi-container deployment |
| **GPU Runtime** | NVIDIA Container Toolkit | GPU passthrough to Docker |
| **Web Server** | Uvicorn | ASGI server for FastAPI |

---

## Backend Technical Details

### Project Structure

```
cuda-lab-back/
├── app.py                      # FastAPI application entry point
├── convolution_service.py      # Orchestration layer
├── progressive_convolution.py  # SSE streaming service
├── cuda_kernels.py             # CUDA compilation utilities
├── image_utils.py              # Base64 ↔ NumPy conversion
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Container definition
└── filters/
    ├── __init__.py             # Filter registry
    ├── prewitt.py              # Edge detection (gradient)
    ├── laplacian.py            # Edge detection (2nd derivative)
    ├── gaussian.py             # Blur (separable)
    └── box_blur.py             # Blur (fast average)
```

### CUDA Kernel Compilation Pipeline

**Problem**: PyCUDA's `SourceModule` auto-detects compute capability incorrectly for RTX 50-series (Blackwell sm_89), defaulting to invalid sm_120.

**Solution**: Direct `nvcc` compilation to PTX, bypassing PyCUDA's auto-detection.

```python
def compile_cuda_kernel_to_ptx(kernel_source: str, arch: str = "sm_89") -> str:
    """
    Compile CUDA kernel to PTX using nvcc subprocess.
    
    Args:
        kernel_source: CUDA C++ source code
        arch: Target GPU architecture (sm_89 for RTX 5070 Ti)
    
    Returns:
        PTX assembly code as string
    """
    with tempfile.NamedTemporaryFile(suffix=".cu", delete=False) as cu_file:
        cu_file.write(kernel_source.encode())
        cu_path = cu_file.name
    
    ptx_path = cu_path.replace(".cu", ".ptx")
    
    result = subprocess.run(
        ["nvcc", f"-arch={arch}", "--ptx", cu_path, "-o", ptx_path],
        capture_output=True, text=True
    )
    
    if result.returncode != 0:
        raise RuntimeError(f"nvcc compilation failed: {result.stderr}")
    
    with open(ptx_path, "r") as f:
        ptx_code = f.read()
    
    os.unlink(cu_path)
    os.unlink(ptx_path)
    
    return ptx_code
```

**Usage in Filters**:

```python
ptx_code = compile_cuda_kernel_to_ptx(GAUSSIAN_KERNEL_SOURCE, arch="sm_89")
module = drv.module_from_buffer(ptx_code.encode())
horizontal_blur = module.get_function("gaussian_horizontal")
vertical_blur = module.get_function("gaussian_vertical")
```

### Separable Convolution Optimization

Gaussian and Box Blur use **separable convolution** for O(n) complexity:

```
Standard 2D Convolution: O(width × height × mask_size²)
Separable Convolution:   O(width × height × mask_size × 2)

Example (512×512, 21×21 mask):
  Standard:   512 × 512 × 441  = 115,605,504 operations
  Separable:  512 × 512 × 21×2 =  11,010,048 operations
  Speedup:    10.5× faster
```

**Implementation**:

```cuda
// Pass 1: Horizontal blur (row-wise)
__global__ void gaussian_horizontal(float* input, float* temp, int width, int height) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    if (x < width && y < height) {
        float sum = 0.0f;
        for (int k = -radius; k <= radius; k++) {
            int nx = clamp(x + k, 0, width - 1);
            sum += input[y * width + nx] * kernel[k + radius];
        }
        temp[y * width + x] = sum;
    }
}

// Pass 2: Vertical blur (column-wise)
__global__ void gaussian_vertical(float* temp, float* output, int width, int height) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    if (x < width && y < height) {
        float sum = 0.0f;
        for (int k = -radius; k <= radius; k++) {
            int ny = clamp(y + k, 0, height - 1);
            sum += temp[ny * width + x] * kernel[k + radius];
        }
        output[y * width + x] = sum;
    }
}
```

### API Endpoints

#### `POST /convolve`

Standard synchronous processing.

**Request**:
```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "filter": {
    "type": "gaussian",
    "mask_size": 9,
    "gain": 8.0
  },
  "cuda_config": {
    "block_dim": [16, 16],
    "grid_dim": [32, 32]
  }
}
```

**Response**:
```json
{
  "status": "ok",
  "result_image_base64": "data:image/png;base64,iVBORw0KGgo...",
  "execution_time_ms": 45.23,
  "kernel_time_ms": 12.87,
  "image_width": 512,
  "image_height": 512,
  "filter_used": "gaussian",
  "mask_size_used": 9,
  "block_dim": [16, 16],
  "grid_dim": [32, 32]
}
```

#### `POST /convolve-stream`

Progressive processing with Server-Sent Events.

**Request**: Same as `/convolve`

**Response Stream**:
```
data: {"progress": 5.18, "chunk": 1, "total_chunks": 193, "rows_processed": 32, "total_rows": 6162, "elapsed_ms": 234, "result_image_base64": "data:image/png;base64,...", "filter_used": "gaussian", "mask_size_used": 9}

data: {"progress": 10.36, "chunk": 2, "total_chunks": 193, ...}

...

data: {"progress": 100, "chunk": 193, "total_chunks": 193, "completed": true, ...}
```

**Configuration**:
- `chunk_size`: 32 rows per update (configurable in `progressive_convolution.py`)
- `delay`: 50ms between chunks (adjustable for visualization speed)

### Error Handling

```python
try:
    result = process_convolution_request(payload)
    return result
except ValueError as e:
    raise HTTPException(status_code=400, detail=str(e))
except RuntimeError as e:
    raise HTTPException(status_code=503, detail=str(e))
except Exception as e:
    import traceback
    raise HTTPException(
        status_code=500, 
        detail=f"Internal error: {str(e)}\n{traceback.format_exc()}"
    )
```

---

## Frontend Technical Details

### Project Structure

```
frontend/
├── app/
│   ├── globals.css             # Tailwind + custom animations
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Redirect to /home
│   ├── home/
│   │   └── page.tsx            # Landing page with showcase
│   └── app/
│       └── page.tsx            # Main application interface
├── components/
│   ├── navbar.tsx              # Navigation header
│   ├── auto-showcase.tsx       # Automated demo carousel
│   ├── progressive-visualization.tsx  # SSE streaming UI
│   └── ui/                     # shadcn/ui components
├── lib/
│   └── utils.ts                # Tailwind className utilities
├── public/                     # Static assets (images)
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind theme customization
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

### Key Components

#### Auto Showcase (`auto-showcase.tsx`)

Automated carousel demonstrating 4 filters with progressive reveal effect.

**Features**:
- 6-second cycle per image (1s original → 3.5s processing → 1.5s result)
- Clip-path animation for scan line effect
- Automatic looping through 4 examples
- Progress indicators with dots

**Implementation**:
```tsx
// Progressive reveal with clip-path
<img
  src={currentItem.processed}
  style={{
    clipPath: `inset(0 0 ${100 - progress}% 0)` 
  }}
/>
<div
  className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_10px_rgba(0,230,118,0.8)]"
  style={{
    top: `${progress}%`,
    transition: "top 0.1s linear"
  }}
/>
```

#### Progressive Visualization (`progressive-visualization.tsx`)

Real-time SSE streaming with live preview.

**Features**:
- Server-Sent Events consumption
- Side-by-side original vs processing comparison
- Progress bar with metrics (rows, chunks, time)
- Abort controller for cancellation

**SSE Parsing**:
```tsx
const reader = response.body?.getReader()
const decoder = new TextDecoder()
let buffer = ""

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  buffer += decoder.decode(value, { stream: true })
  const messages = buffer.split("\n\n")
  buffer = messages.pop() || ""

  for (const message of messages) {
    if (message.startsWith("data: ")) {
      const update = JSON.parse(message.substring(6))
      setProgress(update.progress)
      setCurrentFrame(update.result_image_base64) 
    }
  }
}
```

### Custom Animations

Defined in `globals.css`:

```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes glow {
  0%, 100% { 
    text-shadow: 0 0 10px rgba(0, 230, 118, 0.5), 
                 0 0 20px rgba(0, 230, 118, 0.3); 
  }
  50% { 
    text-shadow: 0 0 20px rgba(0, 230, 118, 0.8), 
                 0 0 40px rgba(0, 230, 118, 0.5); 
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-float { animation: float 3s ease-in-out infinite; }
.animate-glow { animation: glow 2s ease-in-out infinite; }
.animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
```

### Theme Configuration

CUDA-themed dark mode with green accent:

```css
:root {
  --background: oklch(0.1 0 0);        /* Pure black */
  --foreground: oklch(0.98 0 0);       /* White text */
  --primary: oklch(0.75 0.2 145);      /* CUDA Green #00e676 */
  --border: oklch(0.25 0 0);           /* Dark border */
  --ring: oklch(0.75 0.2 145);         /* Green focus ring */
}
```

### State Management

Using React Hooks for local state:

```tsx
// Main app state
const [imageBase64, setImageBase64] = useState<string>("")
const [imageFile, setImageFile] = useState<File | null>(null)
const [filterType, setFilterType] = useState<FilterType>("gaussian")
const [result, setResult] = useState<ProcessingResult | null>(null)
const [runHistory, setRunHistory] = useState<RunData[]>([])

// Progressive visualization state
const [isProcessing, setIsProcessing] = useState(false)
const [progress, setProgress] = useState(0)
const [currentFrame, setCurrentFrame] = useState<string | null>(null)
const abortControllerRef = useRef<AbortController | null>(null)
```

---

## Installation & Setup

### Prerequisites

- **NVIDIA GPU**: CUDA-capable GPU (tested on RTX 5070 Ti)
- **NVIDIA Drivers**: Version 535+ (tested with 581.57)
- **CUDA Toolkit**: 12.0+ installed on host
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **NVIDIA Container Toolkit**: For GPU passthrough

### Quick Start

```bash
# Clone repository
git clone https://github.com/Abenavidese/cuda-image-labs.git
cd cuda-image-labs

# Build and start containers
docker-compose up -d --build

# Verify backend
curl http://localhost:8000/health

# Access frontend
open http://localhost:3000
```

### Manual Backend Setup (Development)

```bash
cd cuda-lab-back

# Create virtual environment
python3.10 -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Verify CUDA
python -c "import pycuda.driver as drv; drv.init(); print(drv.Device(0).name())"

# Run server
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Manual Frontend Setup (Development)

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start dev server
npm run dev
```

---

## Docker Configuration

### Backend Dockerfile

```dockerfile
FROM nvidia/cuda:12.0.0-devel-ubuntu22.04

WORKDIR /app

# Install Python and build tools
RUN apt-get update && apt-get install -y \
    python3.10 python3-pip build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run with Uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./cuda-lab-back
    container_name: cuda-backend
    ports:
      - "8000:8000"
    environment:
      - CUDA_VISIBLE_DEVICES=0
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    networks:
      - cuda-lab_default

  frontend:
    build: ./frontend
    container_name: cuda-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend
    networks:
      - cuda-lab_default

networks:
  cuda-lab_default:
    driver: bridge
```

---

## Performance

### Benchmark Results (RTX 5070 Ti)

| Filter | Image Size | Mask Size | Execution Time | Kernel Time | Throughput |
|--------|-----------|-----------|----------------|-------------|------------|
| **Gaussian** | 512×512 | 9×9 | 45ms | 12ms | 5.8 Mpx/s |
| **Box Blur** | 512×512 | 9×9 | 38ms | 9ms | 6.9 Mpx/s |
| **Prewitt** | 512×512 | 3×3 | 52ms | 15ms | 5.0 Mpx/s |
| **Laplacian** | 512×512 | 3×3 | 48ms | 13ms | 5.4 Mpx/s |
| **Gaussian** | 1920×1080 | 21×21 | 187ms | 124ms | 11.1 Mpx/s |

**Configuration**: Block Dim [16, 16], Grid Dim [32, 32]

### Memory Usage

- **Input Buffer**: Image size (e.g., 512×512 = 1MB for float32)
- **Output Buffer**: Same as input
- **Temp Buffer**: Same as input (for separable convolution)
- **Total GPU Memory**: ~3MB for 512×512 image + kernel overhead

### Optimization Strategies

1. **Separable Convolution**: 10× speedup for Gaussian/Box Blur
2. **Shared Memory**: Tile-based processing reduces global memory access
3. **Coalesced Access**: Aligned memory reads for optimal bandwidth
4. **PTX Compilation**: Direct nvcc avoids PyCUDA overhead
5. **Async Execution**: Overlapping CPU/GPU operations

---

## Team

**CUDA Image Lab** - Fall 2025

- **Henry Granda** - CUDA Kernel Development & Optimization
- **Anthony Benavides** - Backend Architecture & Docker Infrastructure  
- **Bryam Peralta** - Frontend Development & UI/UX Design

---

##  License

This project is developed for academic purposes as part of a GPU Computing course.

---

## Additional Documentation

- [Backend Spanish README](./cuda-lab-back/README.MD) - Detailed Spanish documentation
- [Progressive Visualization Guide](./cuda-lab-back/PROGRESSIVE_VISUALIZATION.md) - SSE implementation details
- [Docker Setup Guide](./cuda-lab-back/DOCKER.md) - Container configuration

---

<div align="center">

**Built with and CUDA**

[Report Bug](https://github.com/Abenavidese/cuda-image-labs/issues) • [Request Feature](https://github.com/Abenavidese/cuda-image-labs/issues)

</div>