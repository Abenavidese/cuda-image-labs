# CUDA Image Lab - Frontend Documentation 🎨

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0.3-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Modern React Frontend for GPU-Accelerated Image Processing**

</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Core Components](#core-components)
- [Pages](#pages)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Styling & Theme](#styling--theme)
- [Animations](#animations)
- [Development](#development)
- [Building & Deployment](#building--deployment)
- [Environment Variables](#environment-variables)
- [Performance Optimization](#performance-optimization)

---

## Overview

The frontend is a **Next.js 16** application built with **TypeScript** and **React 18**, featuring:

- **Server Components**: Optimized rendering with React Server Components
- **Turbopack**: Lightning-fast development with Next.js Turbopack bundler
- **Tailwind CSS**: Utility-first styling with custom CUDA theme
- **shadcn/ui**: High-quality accessible components built on Radix UI
- **Recharts**: Beautiful data visualization for performance metrics
- **SSE Support**: Server-Sent Events for real-time progressive processing
- **Responsive Design**: Mobile-first approach with adaptive layouts

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Client                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Next.js Application                    │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │         App Router (app/)                     │  │     │
│  │  │  • /home   → Landing page with showcase      │  │     │
│  │  │  • /app    → Main processing interface       │  │     │
│  │  │  • layout  → Root layout with metadata       │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │         Components Layer                      │  │     │
│  │  │  • Navbar         → Navigation header        │  │     │
│  │  │  • AutoShowcase   → Automated demo carousel  │  │     │
│  │  │  • ProgressiveViz → SSE streaming UI         │  │     │
│  │  │  • UI Components  → shadcn/ui library        │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │         State Management (React Hooks)        │  │     │
│  │  │  • useState    → Local component state       │  │     │
│  │  │  • useEffect   → Side effects & lifecycle    │  │     │
│  │  │  • useRef      → Mutable refs (AbortController) │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │         API Integration Layer                 │  │     │
│  │  │  • fetch() → REST API calls                  │  │     │
│  │  │  • EventSource (SSE) → Progressive updates   │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/SSE
                            ▼
                  ┌──────────────────────┐
                  │   FastAPI Backend    │
                  │   localhost:8000     │
                  └──────────────────────┘
```

---

## Technology Stack

### Core Framework

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.0.3 | React metaframework with SSR/SSG |
| **React** | 18+ | UI library with hooks & server components |
| **TypeScript** | 5.0+ | Type-safe JavaScript with static analysis |
| **Node.js** | 20 Alpine | JavaScript runtime (production container) |

### Styling & UI

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Tailwind CSS** | 3.4+ | Utility-first CSS framework |
| **shadcn/ui** | Latest | Pre-built accessible components |
| **Radix UI** | Latest | Headless UI primitives (via shadcn) |
| **Lucide React** | Latest | Beautiful icon library |
| **tw-animate-css** | Latest | Extended Tailwind animations |

### Data Visualization

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Recharts** | 2.13+ | Composable charting library |
| **React Charts** | - | Bar charts, line charts for metrics |

### Development Tools

| Technology | Purpose |
|-----------|---------|
| **Turbopack** | Next.js 16 bundler (faster than Webpack) |
| **ESLint** | Code linting and style enforcement |
| **PostCSS** | CSS transformations and optimizations |
| **TypeScript Compiler** | Type checking and compilation |

---

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── globals.css               # Global styles + custom animations
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Root redirect (→ /home)
│   │
│   ├── home/                     # Landing page route
│   │   └── page.tsx              # Landing page with hero & showcase
│   │
│   └── app/                      # Main application route
│       └── page.tsx              # Image processing interface
│
├── components/                   # React components
│   ├── navbar.tsx                # Navigation header
│   ├── auto-showcase.tsx         # Automated demo carousel
│   ├── progressive-visualization.tsx  # SSE streaming component
│   │
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx            # Button variants
│       ├── card.tsx              # Card container
│       ├── input.tsx             # Form inputs
│       ├── select.tsx            # Dropdown select
│       ├── progress.tsx          # Progress bar
│       ├── badge.tsx             # Label badges
│       ├── label.tsx             # Form labels
│       └── ...                   # 40+ more components
│
├── lib/                          # Utilities
│   └── utils.ts                  # cn() helper for className merging
│
├── public/                       # Static assets
│   ├── *.jpg, *.png              # Demo images
│   └── icons/                    # Favicon assets
│
├── hooks/                        # Custom React hooks
│   ├── use-toast.ts              # Toast notifications
│   └── use-mobile.ts             # Mobile detection
│
├── styles/                       # Additional styles
│   └── globals.css               # (symlink to app/globals.css)
│
├── components.json               # shadcn/ui configuration
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind theme & plugins
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.mjs            # PostCSS plugins
├── package.json                  # Dependencies & scripts
├── pnpm-lock.yaml                # Lock file (if using pnpm)
├── .env.local                    # Environment variables (not in git)
├── Dockerfile                    # Container definition
└── README.md                     # This file
```

---

## Core Components

### 1. Navbar (`components/navbar.tsx`)

Navigation header with logo and route links.

**Features:**
- Responsive design (mobile hamburger menu)
- Active route highlighting
- CUDA branding with logo
- Sticky positioning

**Usage:**
```tsx
import { Navbar } from "@/components/navbar"

export default function Layout() {
  return (
    <>
      <Navbar />
      {/* Page content */}
    </>
  )
}
```

---

### 2. Auto Showcase (`components/auto-showcase.tsx`)

Automated carousel demonstrating 4 filters with progressive reveal animation.

**Features:**
- **6-second cycle per image**
  - 1 second: Display original
  - 3.5 seconds: Progressive processing animation
  - 1.5 seconds: Display result
- **Scan line effect**: Green line moving from top to bottom
- **Clip-path animation**: Gradual reveal of processed image
- **Automatic looping**: Cycles through 4 examples infinitely
- **Progress indicators**: Dots showing current image

**State Management:**
```tsx
const [currentIndex, setCurrentIndex] = useState(0)
const [showProcessed, setShowProcessed] = useState(false)
const [isProcessing, setIsProcessing] = useState(false)
const [progress, setProgress] = useState(0)
```

**Animation Logic:**
```tsx
useEffect(() => {
  const showOriginalTimer = setTimeout(() => {
    setIsProcessing(true)
    
    const progressInterval = setInterval(() => {
      setProgress(prev => prev + 1.43) 
      
      if (progress >= 100) {
        clearInterval(progressInterval)
        setShowProcessed(true)
        
        setTimeout(() => {
          setCurrentIndex(prev => (prev + 1) % 4)
        }, 1500)
      }
    }, 50)
  }, 1000)
}, [currentIndex])
```

**Progressive Reveal CSS:**
```tsx
<img
  src={processedImage}
  style={{
    clipPath: `inset(0 0 ${100 - progress}% 0)` 
  }}
/>

{/* Scan line */}
<div
  className="absolute w-full h-1 bg-primary shadow-glow"
  style={{ top: `${progress}%` }}
/>
```

---

### 3. Progressive Visualization (`components/progressive-visualization.tsx`)

Real-time Server-Sent Events streaming component for watching pixel-by-pixel processing.

**Features:**
- **SSE Integration**: Consumes `/convolve-stream` endpoint
- **Side-by-side comparison**: Original vs Processing
- **Live metrics**: Progress bar, rows processed, chunks, elapsed time
- **Abort support**: Cancel processing mid-stream
- **Error handling**: Graceful failure with user feedback

**Props Interface:**
```tsx
interface ProgressiveVisualizationProps {
  imageFile: File | null
  filterType: string
  maskSize: number
  gain: number
  blockDim: [number, number]
  gridDim: [number, number]
}
```

**SSE Consumption:**
```tsx
const startVisualization = async () => {
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
        setStats({
          rowsProcessed: update.rows_processed,
          totalRows: update.total_rows,
          chunk: update.chunk,
          totalChunks: update.total_chunks,
          elapsedMs: update.elapsed_ms,
          filterUsed: update.filter_used
        })
      }
    }
  }
}
```

**Abort Controller:**
```tsx
const abortControllerRef = useRef<AbortController | null>(null)

const stopVisualization = () => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort()
  }
  setIsProcessing(false)
}
```

---

## Pages

### 1. Home Page (`app/home/page.tsx`)

Landing page with hero section, feature showcase, and call-to-action.

**Sections:**
1. **Hero Section**
   - Animated background grid
   - Mouse-tracking gradient effect
   - 20 floating particles
   - "Powered by NVIDIA CUDA" badge
   - Large title with glow animation
   - CTA button → `/app`

2. **How It Works**
   - 3 step cards explaining the process
   - Staggered fade-in animations
   - Hover effects (scale, shadow)

3. **Available Filters**
   - 4 filter cards (Prewitt, Laplacian, Gaussian, Box Blur)
   - Technical descriptions
   - Hover animations (scale, border glow)

4. **Auto Showcase** (See It For Yourself)
   - Embedded `<AutoShowcase />` component
   - Automated demo of 4 filters

5. **CTA Section**
   - Final call-to-action
   - Button with rotation animation

6. **Footer**
   - Team credits

**Interactive Effects:**
```tsx
const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }
  window.addEventListener("mousemove", handleMouseMove)
  return () => window.removeEventListener("mousemove", handleMouseMove)
}, [])

<div 
  style={{
    background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, 
                rgba(118, 255, 94, 0.15), transparent 80%)`
  }}
/>
```

---

### 2. App Page (`app/app/page.tsx`)

Main image processing interface with full configuration and visualization.

**Layout:**
- **Left Column**
  1. Preview panel (image upload)
  2. Filter settings (type, mask size)
  3. CUDA configuration (block/grid dimensions)

- **Right Column**
  1. Result display (processed image)
  2. Performance metrics (execution time, kernel time)
  3. Charts (bar charts, line charts)
  4. Download button

- **Full Width (Bottom)**
  - Progressive Visualization component

**State Management:**
```tsx

const [imageBase64, setImageBase64] = useState<string>("")
const [imageFile, setImageFile] = useState<File | null>(null)
const [previewUrl, setPreviewUrl] = useState<string>("")

const [filterType, setFilterType] = useState<FilterType>("gaussian")
const [maskSize, setMaskSize] = useState<number>(9)
const [blockDimX, setBlockDimX] = useState<number>(16)
const [blockDimY, setBlockDimY] = useState<number>(16)
const [gridDimX, setGridDimX] = useState<number>(16)
const [gridDimY, setGridDimY] = useState<number>(16)

const [result, setResult] = useState<ProcessingResult | null>(null)
const [runHistory, setRunHistory] = useState<RunData[]>([])
const [isProcessing, setIsProcessing] = useState(false)
```

**API Integration:**
```tsx
const handleApplyFilter = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const payload = {
    image_base64: imageBase64,
    filter: {
      type: filterType,
      mask_size: maskSize,
      gain: 8.0
    },
    cuda_config: {
      block_dim: [blockDimX, blockDimY],
      grid_dim: [gridDimX, gridDimY]
    }
  }

  const res = await fetch(`${apiUrl}/convolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  const data = await res.json()
  setResult(data)
  setRunHistory(prev => [...prev, newRunData].slice(-10))
}
```

**Chart Visualization:**
```tsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
    <XAxis dataKey="name" tick={{ fill: "#aaa" }} />
    <YAxis tick={{ fill: "#aaa" }} />
    <Tooltip
      contentStyle={{ backgroundColor: "#050505", border: "1px solid #222" }}
    />
    <Legend />
    <Bar dataKey="execution" name="Total Time" fill="#22c55e" />
    <Bar dataKey="kernel" name="Kernel Time" fill="#10b981" />
  </BarChart>
</ResponsiveContainer>
```

---

## Styling & Theme

### Tailwind Configuration

**Theme Customization (`tailwind.config.ts`):**
```typescript
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}
```

### CUDA Theme Colors

Defined in `app/globals.css`:

```css
:root {
  --background: oklch(0.1 0 0);           /* #000000 - Pure black */
  --foreground: oklch(0.98 0 0);          /* #FAFAFA - White text */
  --primary: oklch(0.75 0.2 145);         /* #00E676 - CUDA Green */
  --primary-foreground: oklch(0.1 0 0);   /* Black on green */
  --border: oklch(0.25 0 0);              /* #404040 - Dark border */
  --ring: oklch(0.75 0.2 145);            /* Green focus ring */
}
```

### Custom CSS Classes

**CUDA-specific styles:**
```css
.cuda-glow {
  box-shadow: 0 0 20px rgba(0, 230, 118, 0.3), 
              0 0 40px rgba(0, 230, 118, 0.1);
  transition: box-shadow 0.3s ease;
}

.cuda-glow:hover {
  box-shadow: 0 0 30px rgba(0, 230, 118, 0.5), 
              0 0 60px rgba(0, 230, 118, 0.2);
}

.cuda-border {
  border: 1px solid rgba(0, 230, 118, 0.3);
}

.cuda-border-glow {
  border: 1px solid rgba(0, 230, 118, 0.5);
  box-shadow: 0 0 15px rgba(0, 230, 118, 0.2);
}
```

---

## Animations

### Custom Keyframes

Defined in `app/globals.css`:

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

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
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

@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Animation Classes

```css
.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out;
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}
```

### Staggered Animations

Using `animation-delay` utilities:

```css
.delay-200 { animation-delay: 200ms; }
.delay-400 { animation-delay: 400ms; }
.delay-600 { animation-delay: 600ms; }
```

**Usage:**
```tsx
<div className="animate-fade-in-up delay-200">
  Appears with 200ms delay
</div>
```

---

## Development

### Installation

```bash
cd frontend

npm install

pnpm install

yarn install
```

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

### Hot Reload

Next.js 16 with Turbopack provides instant hot module replacement:
- Component changes reflect immediately
- CSS updates without full reload
- State preservation during edits

---

## Building & Deployment

### Production Build

```bash
npm run build
```

Output: `.next/` directory with optimized bundles

### Start Production Server

```bash
npm start
```

Runs on port 3000 (production mode)

### Docker Build

```bash
docker build -t cuda-lab-frontend .

docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
  cuda-lab-frontend
```

### Static Export (Optional)

For static hosting without Node.js server:

```bash
export default {
  output: 'export',
}

npm run build

```

---

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` | Yes |

**Usage in code:**
```tsx
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

fetch(`${apiUrl}/convolve`, { ... })
```

---

## ⚡ Performance Optimization

### Next.js Optimizations

1. **Automatic Code Splitting**
   - Each route is lazy-loaded
   - Shared chunks for common dependencies

2. **Image Optimization**
   - `next/image` for automatic WebP conversion
   - Responsive images with srcset
   - Lazy loading by default

3. **Font Optimization**
   - Automatic font inlining
   - Preload critical fonts

4. **Server Components**
   - Reduce client-side JavaScript
   - Faster initial page load

### Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.mjs
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Analyze bundle
ANALYZE=true npm run build
```

### Performance Metrics

| Metric | Value | Target |
|--------|-------|--------|
| **First Contentful Paint** | ~0.8s | < 1.8s |
| **Time to Interactive** | ~1.2s | < 3.8s |
| **Largest Contentful Paint** | ~1.0s | < 2.5s |
| **Cumulative Layout Shift** | 0.01 | < 0.1 |
| **Total Bundle Size** | ~400KB | < 500KB |

---

## Testing

### Type Checking

```bash
npm run type-check
"scripts": {
  "type-check": "tsc --noEmit"
}
```

### Linting

```bash
npm run lint
```

ESLint configuration in `.eslintrc.json`

---

## Dependencies

### Production Dependencies

```json
{
  "dependencies": {
    "next": "^16.0.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.0.0",
    "@radix-ui/react-*": "Latest",
    "recharts": "^2.13.3",
    "lucide-react": "Latest",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "Latest",
    "clsx": "Latest",
    "tailwind-merge": "Latest"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^16.0.3",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## Common Issues

### Issue: "NEXT_PUBLIC_API_URL is undefined"

**Solution:** Create `.env.local` file:
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

### Issue: CORS errors

**Solution:** Backend must include CORS headers:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)
```

### Issue: Images not loading

**Solution:** Check `/public` directory permissions and ensure images exist.

### Issue: SSE connection fails

**Solution:**
1. Verify backend is running on port 8000
2. Check browser console for error messages
3. Ensure `/convolve-stream` endpoint exists

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Recharts](https://recharts.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## Team

- **Henry Granda** - CUDA Kernel Development
- **Anthony Benavides** - Backend Architecture
- **Bryam Peralta** - Frontend Development & UI/UX

---

<div align="center">

**Built with  and Next.js**

[Main README](../README.MD) • [Backend Docs](../cuda-lab-back/README.MD)

</div>