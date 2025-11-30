"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, Square, Image as ImageIcon, Zap, Timer } from "lucide-react"

interface ProgressiveVisualizationProps {
  imageFile: File | null
  filterType: string
  maskSize: number
  gain: number
  blockDim: [number, number]
  gridDim: [number, number]
}

interface StreamUpdate {
  progress: number
  chunk: number
  total_chunks: number
  rows_processed: number
  total_rows: number
  elapsed_ms: number
  result_image_base64: string
  filter_used: string
  mask_size_used: number
  completed?: boolean
  error?: string
}

export function ProgressiveVisualization({
  imageFile,
  filterType,
  maskSize,
  gain,
  blockDim,
  gridDim
}: ProgressiveVisualizationProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentFrame, setCurrentFrame] = useState<string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [stats, setStats] = useState({
    rowsProcessed: 0,
    totalRows: 0,
    chunk: 0,
    totalChunks: 0,
    elapsedMs: 0,
    filterUsed: "",
  })
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load original image preview
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string)
      }
      reader.readAsDataURL(imageFile)
    }
  }, [imageFile])

  const startVisualization = async () => {
    if (!imageFile) return

    setIsProcessing(true)
    setProgress(0)
    setCurrentFrame(null)

    // Convert image to base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1]

      // Create abort controller for this request
      abortControllerRef.current = new AbortController()

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const response = await fetch(`${apiUrl}/convolve-stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image_base64: base64,
            filter: {
              type: filterType,
              mask_size: maskSize,
              gain: gain,
            },
            cuda_config: {
              block_dim: blockDim,
              grid_dim: gridDim,
            },
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error("No reader available")
        }

        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // Process complete SSE messages (separated by \n\n)
          const messages = buffer.split("\n\n")
          buffer = messages.pop() || "" // Keep incomplete message in buffer

          for (const message of messages) {
            if (message.startsWith("data: ")) {
              const jsonStr = message.substring(6)
              try {
                const update: StreamUpdate = JSON.parse(jsonStr)

                if (update.error) {
                  console.error("Stream error:", update.error)
                  setIsProcessing(false)
                  return
                }

                console.log("Update received:", {
                  progress: update.progress,
                  chunk: update.chunk,
                  rows: update.rows_processed,
                  hasImage: !!update.result_image_base64
                })

                // Update UI with progress
                setProgress(update.progress)
                // Check if base64 already has data URI prefix
                const imageData = update.result_image_base64.startsWith("data:")
                  ? update.result_image_base64
                  : `data:image/png;base64,${update.result_image_base64}`
                console.log("Setting image, length:", imageData.length)
                setCurrentFrame(imageData)
                setStats({
                  rowsProcessed: update.rows_processed,
                  totalRows: update.total_rows,
                  chunk: update.chunk,
                  totalChunks: update.total_chunks,
                  elapsedMs: update.elapsed_ms,
                  filterUsed: update.filter_used,
                })

                if (update.completed) {
                  console.log("Processing completed!")
                  setIsProcessing(false)
                }
              } catch (e) {
                console.error("Failed to parse update:", e, jsonStr.substring(0, 100))
              }
            }
          }
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Visualization stopped by user")
        } else {
          console.error("Error during progressive visualization:", error)
        }
        setIsProcessing(false)
      }
    }

    reader.readAsDataURL(imageFile)
  }

  const stopVisualization = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsProcessing(false)
  }

  const canStart = imageFile && !isProcessing

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Progressive Visualization</CardTitle>
          </div>
          <Badge variant="outline" className="gap-1">
            <Timer className="h-3 w-3" />
            {stats.elapsedMs.toFixed(0)}ms
          </Badge>
        </div>
        <CardDescription>
          Watch how CUDA processes your image pixel by pixel in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={startVisualization}
            disabled={!canStart}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Start Visualization
          </Button>
          <Button
            onClick={stopVisualization}
            disabled={!isProcessing}
            variant="destructive"
            className="gap-2"
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>
        </div>

        {/* Progress Bar */}
        {(isProcessing || progress > 0) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Processing: {stats.rowsProcessed} / {stats.totalRows} rows
              </span>
              <span className="font-medium text-primary">
                {progress.toFixed(1)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Chunk {stats.chunk} / {stats.totalChunks}</span>
              <span>Filter: {stats.filterUsed}</span>
            </div>
          </div>
        )}

        {/* Image Comparison */}
        <div className="grid grid-cols-2 gap-4">
          {/* Original Image */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ImageIcon className="h-4 w-4" />
              Original
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
              {originalImage ? (
                <img
                  src={originalImage}
                  alt="Original"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
          </div>

          {/* Progressive Result */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4 text-primary" />
              Processing
              {isProcessing && (
                <span className="animate-pulse text-primary">●</span>
              )}
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
              {currentFrame ? (
                <img
                  src={currentFrame}
                  alt="Processing"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  {isProcessing ? "Starting..." : "Waiting to start"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats.filterUsed && (
          <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Filter</div>
              <div className="font-medium capitalize">{stats.filterUsed}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Progress</div>
              <div className="font-medium">
                {stats.chunk} / {stats.totalChunks} chunks
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Elapsed</div>
              <div className="font-medium">{stats.elapsedMs.toFixed(0)}ms</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
