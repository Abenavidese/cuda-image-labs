"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, Download, Sparkles, FileSpreadsheet, RefreshCw } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts"
import { ProgressiveVisualization } from "@/components/progressive-visualization"
import * as XLSX from "xlsx"

// filtros que acepta el backend MOCK (valid_filters)
type FilterType = "prewitt" | "laplacian" | "gaussian" | "box_blur"

interface ProcessingResult {
  result_image_base64: string
  execution_time_ms: number
  kernel_time_ms: number
  mask_size_used: number
  block_dim: [number, number]
  grid_dim: [number, number]
  image_width?: number
  image_height?: number
}

interface RunData {
  id: number
  filter: FilterType
  mask_size: number
  execution_time_ms: number
  kernel_time_ms: number
  block_dim: [number, number]
  grid_dim: [number, number]
  image_width: number
  image_height: number
}

export default function AppPage() {
  const [imageBase64, setImageBase64] = useState<string>("")
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [filterType, setFilterType] = useState<FilterType>("gaussian")
  const [maskSize, setMaskSize] = useState<number>(9)
  const [blockDimX, setBlockDimX] = useState<number>(16)
  const [blockDimY, setBlockDimY] = useState<number>(16)
  const [gridDimX, setGridDimX] = useState<number>(16)
  const [gridDimY, setGridDimY] = useState<number>(16)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [runHistory, setRunHistory] = useState<RunData[]>([])
  const [showResetDialog, setShowResetDialog] = useState(false)

  // máscara personalizada
  const [useCustomMask, setUseCustomMask] = useState(false)
  const [maskError, setMaskError] = useState<string | null>(null)
  const [customMaskInput, setCustomMaskInput] = useState("")

  // tamaño real de la imagen cargada (naturalWidth / naturalHeight)
  const [inputWidth, setInputWidth] = useState<number | null>(null)
  const [inputHeight, setInputHeight] = useState<number | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file) // Store the File object

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      const [, pureBase64] = base64String.split(",")
      setImageBase64(pureBase64)
      setPreviewUrl(base64String)
      setResult(null)

      const img = new Image()
      img.onload = () => {
        setInputWidth(img.naturalWidth)
        setInputHeight(img.naturalHeight)
      }
      img.src = base64String
    }
    reader.readAsDataURL(file)
  }

  const handleApplyFilter = async () => {
    if (!imageBase64) return

    // validar máscara
    if (maskError) {
      alert("Corrige el tamaño de la máscara (debe ser un entero positivo impar).")
      return
    }

    if (!Number.isInteger(maskSize) || maskSize <= 0 || maskSize % 2 === 0) {
      setMaskError("La máscara debe ser un entero positivo impar")
      alert("La máscara debe ser un entero positivo impar.")
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      alert("Falta configurar NEXT_PUBLIC_API_URL en frontend/.env.local")
      return
    }

    setIsProcessing(true)

    const payload = {
      image_base64: imageBase64,
      filter: {
        type: filterType,
        mask_size: maskSize,
      },
      cuda_config: {
        block_dim: [blockDimX, blockDimY],
        grid_dim: [gridDimX, gridDimY],
      },
    }

    try {
      console.log("[frontend] Enviando payload:", payload)

      const res = await fetch(`${apiUrl}/convolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        console.error("Error backend:", res.status, errData)
        alert(`Error backend: ${errData?.detail || res.statusText}`)
        return
      }

      const data = await res.json()

      if (data.status !== "ok") {
        console.error("Status no OK:", data)
        alert(`Error backend: ${data.message || "Unknown error"}`)
        return
      }

      const processed: ProcessingResult = {
        result_image_base64: data.result_image_base64,
        execution_time_ms: data.execution_time_ms,
        kernel_time_ms: data.kernel_time_ms,
        mask_size_used: data.mask_size_used,
        block_dim: data.block_dim,
        grid_dim: data.grid_dim,
        image_width: data.image_width,
        image_height: data.image_height,
      }

      setResult(processed)

      // actualizar histórico para gráficas
      setRunHistory((prev) => {
        const nextId = (prev[prev.length - 1]?.id ?? 0) + 1
        const newItem: RunData = {
          id: nextId,
          filter: filterType,
          mask_size: data.mask_size_used,
          execution_time_ms: data.execution_time_ms,
          kernel_time_ms: data.kernel_time_ms,
          block_dim: data.block_dim,
          grid_dim: data.grid_dim,
          image_width: data.image_width || 0,
          image_height: data.image_height || 0,
        }

        const filtered = prev.filter(
          (r) => !(r.filter === newItem.filter && r.mask_size === newItem.mask_size),
        )

        const updated = [...filtered, newItem]
        return updated.slice(-10)
      })
    } catch (error) {
      console.error("Error de red:", error)
      alert("No se pudo conectar con el backend. Verifica que esté corriendo en el puerto correcto.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result?.result_image_base64) return

    const href = result.result_image_base64.startsWith("data:")
      ? result.result_image_base64
      : `data:image/png;base64,${result.result_image_base64}`

    const link = document.createElement("a")
    link.href = href
    link.download = `processed_${filterType}.png`
    link.click()
  }

  const handleDownloadExcel = () => {
    if (runHistory.length === 0) {
      alert("No hay datos para exportar. Procesa al menos una imagen primero.")
      return
    }

    // Baseline: primera ejecución (para calcular Speedup relativo)
    const baselineTime = runHistory[0].execution_time_ms
    const baselineThreads = runHistory[0].block_dim[0] * runHistory[0].block_dim[1]

    // Preparar datos para Excel con métricas académicas
    const excelData = runHistory.map((run, index) => {
      const threadsPerBlock = run.block_dim[0] * run.block_dim[1]
      const totalBlocks = run.grid_dim[0] * run.grid_dim[1]
      
      // Speedup: S = T_baseline / T_current (aceleramiento relativo)
      const speedup = baselineTime / run.execution_time_ms
      
      // Efficiency: E = Speedup / (threads_current / threads_baseline)
      // Normalizado: qué tan bien usamos los threads adicionales
      const threadRatio = threadsPerBlock / baselineThreads
      const efficiency = threadRatio > 0 ? speedup / threadRatio : 0
      
      return {
        "#": index + 1,
        "Filter": run.filter,
        "Mask Size": `${run.mask_size}×${run.mask_size}`,
        "Image Size": `${run.image_width}×${run.image_height}`,
        "Block Dim": `${run.block_dim[0]}×${run.block_dim[1]}`,
        "Grid Dim": `${run.grid_dim[0]}×${run.grid_dim[1]}`,
        "Threads/Block": threadsPerBlock,
        "Total Blocks": totalBlocks,
        "Execution Time (ms)": run.execution_time_ms.toFixed(2),
        "Kernel Time (ms)": run.kernel_time_ms.toFixed(2),
        "Speedup (S)": index === 0 ? "1.00 (baseline)" : speedup.toFixed(2),
        "Efficiency (E)": index === 0 ? "1.00 (baseline)" : efficiency.toFixed(2),
      }
    })

    // Crear workbook y worksheet
    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Processing Results")

    // Ajustar ancho de columnas
    ws["!cols"] = [
      { wch: 5 },  // #
      { wch: 12 }, // Filter
      { wch: 12 }, // Mask Size
      { wch: 14 }, // Image Size
      { wch: 12 }, // Block Dim
      { wch: 12 }, // Grid Dim
      { wch: 14 }, // Threads/Block
      { wch: 12 }, // Total Blocks
      { wch: 18 }, // Execution Time
      { wch: 18 }, // Kernel Time
      { wch: 16 }, // Speedup
      { wch: 16 }, // Efficiency
    ]

    // Descargar archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
    XLSX.writeFile(wb, `cuda-lab-results-${timestamp}.xlsx`)
  }

  const handleResetCharts = () => {
    if (runHistory.length === 0) {
      alert("No hay datos para reiniciar.")
      return
    }
    setShowResetDialog(true)
  }

  const confirmReset = () => {
    setRunHistory([])
    setShowResetDialog(false)
  }

  const processedImgSrc =
    result && result.result_image_base64
      ? result.result_image_base64.startsWith("data:")
        ? result.result_image_base64
        : `data:image/png;base64,${result.result_image_base64}`
      : "/placeholder.svg"

  // datos para gráfico tipo paper (barras)
  const chartData = runHistory.map((run) => ({
    name: `${run.filter} ${run.mask_size}x${run.mask_size}`,
    execution: run.execution_time_ms,
    kernel: run.kernel_time_ms,
  }))

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-16">
        <div className="mb-8 text-center">
          <h1 className="mb-3 font-mono text-4xl font-bold text-foreground">
            CUDA Image <span className="text-primary">Processing Lab</span>
          </h1>
          <p className="text-muted-foreground">Configure your filter and CUDA parameters</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Preview Panel */}
            <Card className="cuda-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted/20">
                    {previewUrl ? (
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Upload className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {inputWidth && inputHeight && (
                    <p className="text-xs font-mono text-muted-foreground">
                      Loaded image size: {inputWidth}×{inputHeight} px
                    </p>
                  )}

                  <Label htmlFor="image-upload">
                    <Button
                      variant="outline"
                      className="w-full border-primary/50 hover:bg-primary/10 bg-transparent"
                      asChild
                    >
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Load Image
                      </span>
                    </Button>
                  </Label>

                  {!previewUrl && (
                    <div className="text-center space-y-2">
                      <p className="text-sm text-foreground">
                        Nothing to try?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Download an image and try it out!{" "}
                        <a 
                          href="https://pixabay.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Pixabay →
                        </a>
                      </p>
                    </div>
                  )}

                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Filter Panel */}
            <Card className="cuda-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Filter Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Filter Type</Label>
                  <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prewitt">Prewitt</SelectItem>
                      <SelectItem value="laplacian">Laplacian</SelectItem>
                      <SelectItem value="gaussian">Gaussian blur</SelectItem>
                      <SelectItem value="box_blur">Box blur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mask Size + Custom */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Mask Size</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="custom-mask-toggle"
                        type="checkbox"
                        className="h-4 w-4 accent-primary"
                        checked={useCustomMask}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setUseCustomMask(checked)
                          setMaskError(null)
                          if (checked) {
                            setCustomMaskInput(maskSize.toString())
                          } else {
                            setCustomMaskInput("")
                          }
                        }}
                      />
                      <Label htmlFor="custom-mask-toggle" className="text-xs text-muted-foreground">
                        Custom size
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Selector de tamaños predefinidos */}
                    <Select
                      value={maskSize.toString()}
                      onValueChange={(v) => {
                        const val = Number(v)
                        setMaskSize(val)
                        if (val % 2 === 1 && val > 0) setMaskError(null)
                      }}
                      disabled={useCustomMask}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3x3</SelectItem>
                        <SelectItem value="5">5x5</SelectItem>
                        <SelectItem value="9">9x9</SelectItem>
                        <SelectItem value="21">21x21</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Input para tamaño personalizado */}
                    <Input
                      type="number"
                      placeholder="odd, e.g. 7"
                      disabled={!useCustomMask}
                      value={useCustomMask ? customMaskInput : ""}
                      onChange={(e) => {
                        const raw = e.target.value
                        setCustomMaskInput(raw)

                        if (!raw) {
                          setMaskError("La máscara no puede estar vacía")
                          return
                        }

                        const val = Number(raw)

                        if (!Number.isInteger(val) || val <= 0) {
                          setMaskError("Debe ser un entero positivo")
                          return
                        }

                        if (val % 2 === 0) {
                          setMaskError("La máscara debe ser impar")
                          return
                        }

                        setMaskError(null)
                        setMaskSize(val)
                      }}
                    />
                  </div>

                  {maskError && <p className="text-xs text-red-400">{maskError}</p>}
                </div>
              </CardContent>
            </Card>

            {/* CUDA Config Panel */}
            <Card className="cuda-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">CUDA Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="blockDimX">Block Dim X</Label>
                    <Input
                      id="blockDimX"
                      type="number"
                      value={blockDimX}
                      onChange={(e) => setBlockDimX(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blockDimY">Block Dim Y</Label>
                    <Input
                      id="blockDimY"
                      type="number"
                      value={blockDimY}
                      onChange={(e) => setBlockDimY(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gridDimX">Grid Dim X</Label>
                    <Input
                      id="gridDimX"
                      type="number"
                      value={gridDimX}
                      onChange={(e) => setGridDimX(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gridDimY">Grid Dim Y</Label>
                    <Input
                      id="gridDimY"
                      type="number"
                      value={gridDimY}
                      onChange={(e) => setGridDimY(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Apply Button */}
            <Button
              onClick={handleApplyFilter}
              disabled={!imageBase64 || isProcessing}
              className="cuda-glow h-12 w-full bg-primary font-semibold text-black hover:bg-primary/90 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing on CUDA...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Apply Filter
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <Card className="cuda-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Results</CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-6">
                    {/* Image Comparison */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">ORIGINAL</p>
                        <div className="overflow-hidden rounded-lg border border-border">
                          <img src={previewUrl || "/placeholder.svg"} alt="Original" className="w-full" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-primary">PROCESSED</p>
                        <div className="overflow-hidden rounded-lg border border-primary/50">
                          <img src={processedImgSrc} alt="Processed" className="w-full" />
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-4 rounded-lg border border-border bg-muted/10 p-4">
                      <h4 className="mb-3 font-mono text-sm font-semibold text-primary">Execution Metrics</h4>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Execution Time</p>
                          <p className="font-mono font-semibold">{result.execution_time_ms} ms</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Kernel Time</p>
                          <p className="font-mono font-semibold">{result.kernel_time_ms} ms</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Mask Size</p>
                          <p className="font-mono font-semibold">
                            {result.mask_size_used}x{result.mask_size_used}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Block Dim</p>
                          <p className="font-mono font-semibold">[{result.block_dim.join(", ")}]</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Grid Dim</p>
                          <p className="font-mono font-semibold">[{result.grid_dim.join(", ")}]</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Image Size</p>
                          <p className="font-mono font-semibold">
                            {inputWidth && inputHeight
                              ? `${inputWidth}x${inputHeight} px`
                              : result.image_width && result.image_height
                              ? `${result.image_width}x${result.image_height} px`
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Performance Charts (barras tipo paper) */}
                    {chartData.length > 0 && (
                      <div className="space-y-4 rounded-lg border border-border bg-muted/10 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-mono text-sm font-semibold text-primary">
                              Execution vs Kernel Time
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Cada punto corresponde a una ejecución (filtro + tamaño de máscara). Se muestran dos gráficas:
                              una para el <span className="font-semibold">Execution Time</span> y otra para el{" "}
                              <span className="font-semibold">Kernel Time</span>.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleDownloadExcel}
                              variant="outline"
                              size="sm"
                              className="border-primary/50 hover:bg-primary/10 bg-transparent"
                            >
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              Export Excel
                            </Button>
                            
                            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  onClick={handleResetCharts}
                                  variant="outline"
                                  size="sm"
                                  className="border-red-500/50 hover:bg-red-500/10 bg-transparent text-red-400 hover:text-red-300"
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Reset
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="border-border bg-card/95 backdrop-blur-sm">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2 text-foreground">
                                    <RefreshCw className="h-5 w-5 text-red-400" />
                                    Reset Performance Data
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    Are you sure you want to reset all charts and performance metrics? This action cannot be undone.
                                    <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                      <p className="text-xs text-red-400 font-medium">
                                        ⚠️ All stored results ({runHistory.length} {runHistory.length === 1 ? 'test' : 'tests'}) will be permanently deleted.
                                      </p>
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-border hover:bg-muted">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={confirmReset}
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                  >
                                    Reset All Data
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Gráfica 1: Execution Time */}
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={chartData}
                                margin={{ top: 30, right: 20, left: 0, bottom: 20 }}  // más espacio arriba, menos abajo
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                  dataKey="name"
                                  angle={-25}
                                  textAnchor="end"
                                  interval={0}
                                  tick={{ fontSize: 10, fill: "#aaa" }}
                                  tickMargin={8}     // espacio extra entre etiqueta y eje
                                />
                                <YAxis
                                  tick={{ fontSize: 10, fill: "#aaa" }}
                                  label={{
                                    value: "Execution Time (ms)",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { fill: "#aaa", fontSize: 11 },
                                  }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#050505",
                                    border: "1px solid #222",
                                    fontSize: 11,
                                  }}
                                />
                                <Legend
                                  verticalAlign="top"
                                  align="right"
                                  wrapperStyle={{ fontSize: 11, paddingBottom: 4 }} // leyenda arriba
                                />
                                <Bar dataKey="execution" name="Execution time" fill="#22c55e" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Gráfica 2: Kernel Time */}
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={chartData}
                                margin={{ top: 30, right: 20, left: 0, bottom: 20 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                  dataKey="name"
                                  angle={-25}
                                  textAnchor="end"
                                  interval={0}
                                  tick={{ fontSize: 10, fill: "#aaa" }}
                                  tickMargin={8}
                                />
                                <YAxis
                                  tick={{ fontSize: 10, fill: "#aaa" }}
                                  label={{
                                    value: "Kernel Time (ms)",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { fill: "#aaa", fontSize: 11 },
                                  }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#050505",
                                    border: "1px solid #222",
                                    fontSize: 11,
                                  }}
                                />
                                <Legend
                                  verticalAlign="top"
                                  align="right"
                                  wrapperStyle={{ fontSize: 11, paddingBottom: 4 }}
                                />
                                <Bar dataKey="kernel" name="Kernel time" fill="#10b981" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Download Button */}
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="w-full border-primary/50 hover:bg-primary/10 bg-transparent"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Processed Image
                    </Button>
                  </div>
                ) : (
                  <div className="flex min-h-[400px] items-center justify-center text-center">
                    <div>
                      <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">Upload an image and apply a filter to see results</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progressive Visualization Section - Full Width */}
        <div className="mt-6">
          <ProgressiveVisualization
            imageFile={imageFile}
            filterType={filterType}
            maskSize={maskSize}
            gain={8.0}
            blockDim={[blockDimX, blockDimY]}
            gridDim={[gridDimX, gridDimY]}
          />
        </div>
      </main>
    </div>
  )
}
