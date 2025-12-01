"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Zap, Filter, Settings, Box, Layers, Aperture, Wind } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-mono text-4xl font-bold text-foreground">
            <span className="text-primary">Documentation</span> & API Reference
          </h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to integrate CUDA Image Lab into your workflow
          </p>
        </div>

        {/* Quick Start */}
        <Card className="mb-8 cuda-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Quick Start</CardTitle>
            </div>
            <CardDescription>Get started with CUDA Image Lab in minutes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Access the Application</h4>
                  <p className="text-sm text-muted-foreground">
                    Navigate to <code className="px-2 py-1 bg-muted rounded text-primary">localhost:3000/app</code> to access the processing interface
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Upload Your Image</h4>
                  <p className="text-sm text-muted-foreground">
                    Click "Load Image" and select any image from your computer. Supported formats: PNG, JPG, JPEG, WebP
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Choose a Filter</h4>
                  <p className="text-sm text-muted-foreground">
                    Select from Prewitt, Laplacian, Gaussian, or Box Blur filters
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Configure & Process</h4>
                  <p className="text-sm text-muted-foreground">
                    Adjust mask size and CUDA parameters, then click "Apply Filter" to process with GPU acceleration
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Documentation Tabs */}
        <Tabs defaultValue="api" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api">API Reference</TabsTrigger>
            <TabsTrigger value="filters">Filters Guide</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          {/* API Reference Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card className="cuda-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  <CardTitle>REST API Endpoint</CardTitle>
                </div>
                <CardDescription>Process images programmatically via HTTP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Standard Processing */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge>POST</Badge>
                    <code className="text-sm">/convolve</code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Synchronous image processing endpoint - returns processed image immediately
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Request Body:</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code className="text-xs text-foreground">{`{
  "image_base64": "iVBORw0KGgoAAAANS...",
  "filter": {
    "type": "gaussian",
    "mask_size": 9,
    "gain": 8.0
  },
  "cuda_config": {
    "block_dim": [16, 16],
    "grid_dim": [32, 32]
  }
}`}</code>
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Response:</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code className="text-xs text-foreground">{`{
  "status": "ok",
  "result_image_base64": "data:image/png;base64,iVBORw...",
  "execution_time_ms": 45.23,
  "kernel_time_ms": 12.87,
  "image_width": 512,
  "image_height": 512,
  "filter_used": "gaussian",
  "mask_size_used": 9
}`}</code>
                    </pre>
                  </div>
                </div>

                {/* Progressive Processing */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">POST</Badge>
                    <code className="text-sm">/convolve-stream</code>
                    <Badge variant="secondary" className="text-xs">SSE</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Progressive processing with Server-Sent Events - watch pixel-by-pixel progress in real-time
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Stream Response (SSE):</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code className="text-xs text-foreground">{`data: {"progress": 5.18, "chunk": 1, "rows_processed": 32, "result_image_base64": "..."}

data: {"progress": 10.36, "chunk": 2, "rows_processed": 64, "result_image_base64": "..."}

...

data: {"progress": 100, "completed": true, "result_image_base64": "..."}`}</code>
                    </pre>
                  </div>
                </div>

                {/* Parameters */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground">Parameters Reference:</h4>
                  <div className="grid gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-sm text-primary">image_base64</code>
                        <Badge variant="outline" className="text-xs">string</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Base64-encoded image data (with or without data URI prefix)</p>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-sm text-primary">filter.type</code>
                        <Badge variant="outline" className="text-xs">enum</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Filter type: "prewitt" | "laplacian" | "gaussian" | "box_blur"</p>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-sm text-primary">filter.mask_size</code>
                        <Badge variant="outline" className="text-xs">integer</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Convolution kernel size (must be odd: 3, 5, 9, 21...)</p>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-sm text-primary">filter.gain</code>
                        <Badge variant="outline" className="text-xs">float</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Edge enhancement factor for Prewitt (default: 8.0)</p>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-sm text-primary">cuda_config.block_dim</code>
                        <Badge variant="outline" className="text-xs">[int, int]</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">CUDA block dimensions (e.g., [16, 16] = 256 threads)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Filters Guide Tab */}
          <TabsContent value="filters" className="space-y-6">
            {/* Performance Metrics Section */}
            <Card className="cuda-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle>Performance Metrics</CardTitle>
                </div>
                <CardDescription>Understanding Speedup and Efficiency calculations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Speedup */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Speedup (S)</h3>
                  <p className="text-sm text-muted-foreground">
                    Measures how much faster your current configuration is compared to the baseline (first execution).
                  </p>
                  
                  <div className="p-4 bg-muted/20 rounded-lg border border-border">
                    <div className="font-mono text-sm mb-2 text-primary">Formula:</div>
                    <code className="text-foreground">S = T_baseline / T_current</code>
                    
                    <div className="mt-4 space-y-2">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Where:</span>
                      </div>
                      <div className="text-xs space-y-1 ml-4">
                        <div><code className="text-primary">T_baseline</code> = Execution time of first test (reference)</div>
                        <div><code className="text-primary">T_current</code> = Execution time of current test</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Interpretation:</h4>
                    <div className="grid gap-2">
                      <div className="flex items-start gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">S = 1.00</Badge>
                        <span className="text-muted-foreground">No improvement (same as baseline)</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">S = 2.50</Badge>
                        <span className="text-muted-foreground">2.5× faster than baseline (150% improvement)</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">S &lt; 1.00</Badge>
                        <span className="text-muted-foreground">Slower than baseline (worse configuration)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="text-xs text-foreground">
                      <span className="font-semibold">Example:</span> If baseline is 45.23ms and current is 22.61ms:
                      <div className="mt-1 font-mono text-primary">S = 45.23 / 22.61 = 2.00 (2× faster)</div>
                    </div>
                  </div>
                </div>

                {/* Efficiency */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground">Efficiency (E)</h3>
                  <p className="text-sm text-muted-foreground">
                    Measures how well additional threads improve performance. Shows if scaling is optimal.
                  </p>
                  
                  <div className="p-4 bg-muted/20 rounded-lg border border-border">
                    <div className="font-mono text-sm mb-2 text-primary">Formula:</div>
                    <code className="text-foreground">E = Speedup / (Threads_current / Threads_baseline)</code>
                    
                    <div className="mt-4 space-y-2">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Where:</span>
                      </div>
                      <div className="text-xs space-y-1 ml-4">
                        <div><code className="text-primary">Speedup</code> = S value calculated above</div>
                        <div><code className="text-primary">Threads_current</code> = Block_X × Block_Y (current test)</div>
                        <div><code className="text-primary">Threads_baseline</code> = Block_X × Block_Y (first test)</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Interpretation:</h4>
                    <div className="grid gap-2">
                      <div className="flex items-start gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">E = 1.00</Badge>
                        <span className="text-muted-foreground">Perfect scaling (linear speedup)</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">E &gt; 1.00</Badge>
                        <span className="text-muted-foreground">Superlinear! (cache effects or better algorithm)</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">E &lt; 1.00</Badge>
                        <span className="text-muted-foreground">Sublinear (overhead, sync, memory bottleneck)</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">E &lt;&lt; 0.5</Badge>
                        <span className="text-muted-foreground">Very inefficient (too many idle threads)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="text-xs text-foreground">
                      <span className="font-semibold">Example:</span> Baseline: 256 threads (16×16), 45.23ms. Current: 512 threads (32×16), 38.15ms:
                      <div className="mt-1 space-y-1">
                        <div className="font-mono text-primary">S = 45.23 / 38.15 = 1.19</div>
                        <div className="font-mono text-primary">Thread_ratio = 512 / 256 = 2.0</div>
                        <div className="font-mono text-primary">E = 1.19 / 2.0 = 0.60 (60% efficient)</div>
                      </div>
                      <div className="mt-2 text-muted-foreground">Doubled threads but only 19% faster → 60% efficiency</div>
                    </div>
                  </div>
                </div>

                {/* Why Relative Speedup */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground">📌 Why Relative Speedup?</h4>
                  <p className="text-xs text-muted-foreground">
                    This implementation uses <span className="font-semibold">relative speedup</span> (GPU vs GPU) instead of 
                    absolute speedup (CPU vs GPU) because there's no sequential CPU implementation. This approach still 
                    demonstrates parallel computing principles by comparing different CUDA configurations and algorithms.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Prewitt */}
              <Card className="cuda-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-primary" />
                      <CardTitle>Prewitt</CardTitle>
                    </div>
                    <Badge>Edge Detection</Badge>
                  </div>
                  <CardDescription>Gradient-based edge detection with directional sensitivity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">How It Works</h4>
                    <p className="text-sm text-muted-foreground">
                      Computes image gradients in X and Y directions using first derivative operators. 
                      Combines both gradients to highlight edges: <code className="text-primary">|Gx| + |Gy|</code>
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Best For</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Object boundary detection</li>
                      <li>Shape analysis</li>
                      <li>Feature extraction</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mask Size:</span>
                        <code className="text-primary">3, 5, 9, 21</code>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gain:</span>
                        <code className="text-primary">1.0 - 10.0+</code>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      💡 <span className="font-semibold">Tip:</span> Use gain 6-8 for balanced edge enhancement
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Laplacian */}
              <Card className="cuda-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      <CardTitle>Laplacian</CardTitle>
                    </div>
                    <Badge>Edge Detection</Badge>
                  </div>
                  <CardDescription>Second derivative edge detection for all directions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">How It Works</h4>
                    <p className="text-sm text-muted-foreground">
                      Uses second derivative to find rapid intensity changes. Detects edges in all directions 
                      simultaneously, highlighting zero-crossings.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Best For</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Fine edge detail detection</li>
                      <li>Medical imaging analysis</li>
                      <li>Texture analysis</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Modes</h4>
                    <div className="space-y-2">
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="text-sm font-medium">3×3: Classic Laplacian</div>
                        <div className="text-xs text-muted-foreground">Fast, sharp edges</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="text-sm font-medium">5×5+: Laplacian of Gaussian (LoG)</div>
                        <div className="text-xs text-muted-foreground">Noise reduction + edge detection</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      💡 <span className="font-semibold">Tip:</span> Use larger masks (9×9, 21×21) to reduce noise
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Gaussian */}
              <Card className="cuda-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Aperture className="h-5 w-5 text-primary" />
                      <CardTitle>Gaussian</CardTitle>
                    </div>
                    <Badge variant="secondary">Blur</Badge>
                  </div>
                  <CardDescription>High-quality smoothing with Gaussian distribution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">How It Works</h4>
                    <p className="text-sm text-muted-foreground">
                      Applies weighted averaging using Gaussian bell curve. Separable convolution 
                      (horizontal + vertical passes) for optimal performance.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Best For</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Noise reduction</li>
                      <li>Image preprocessing</li>
                      <li>Natural-looking blur</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Blur Intensity</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Light:</span>
                        <code className="text-primary">3×3, 5×5</code>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Medium:</span>
                        <code className="text-primary">9×9, 21×21</code>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Heavy:</span>
                        <code className="text-primary">61×61+</code>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      💡 <span className="font-semibold">Tip:</span> Use 9×9 or 21×21 for balanced quality/speed
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Box Blur */}
              <Card className="cuda-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Box className="h-5 w-5 text-primary" />
                      <CardTitle>Box Blur</CardTitle>
                    </div>
                    <Badge variant="secondary">Blur</Badge>
                  </div>
                  <CardDescription>Fast uniform averaging for quick smoothing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">How It Works</h4>
                    <p className="text-sm text-muted-foreground">
                      Simple uniform averaging of neighboring pixels. All weights equal (1/N²). 
                      Fastest blur algorithm due to simplicity.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Best For</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Quick smoothing operations</li>
                      <li>Performance-critical applications</li>
                      <li>Real-time processing</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Performance</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm text-foreground">⚡ Fastest blur algorithm</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ~2-3× faster than Gaussian blur
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      💡 <span className="font-semibold">Tip:</span> May show "blocky" artifacts - use Gaussian for quality
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <Card className="cuda-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Common Use Cases</CardTitle>
                <CardDescription>Real-world examples and recommended configurations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Example 1 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Photo Enhancement</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Remove noise from photos while preserving important details
                  </p>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs font-mono text-foreground space-y-1">
                      <div>Filter: <span className="text-primary">Gaussian</span></div>
                      <div>Mask Size: <span className="text-primary">9×9</span></div>
                      <div>Use Case: Portrait photography, product shots</div>
                    </div>
                  </div>
                </div>

                {/* Example 2 */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Object Detection Preprocessing</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Extract edges for computer vision pipelines
                  </p>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs font-mono text-foreground space-y-1">
                      <div>Filter: <span className="text-primary">Prewitt</span></div>
                      <div>Mask Size: <span className="text-primary">3×3</span></div>
                      <div>Gain: <span className="text-primary">8.0</span></div>
                      <div>Use Case: Feature extraction, shape recognition</div>
                    </div>
                  </div>
                </div>

                {/* Example 3 */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Medical Image Analysis</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Highlight fine details in medical scans
                  </p>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs font-mono text-foreground space-y-1">
                      <div>Filter: <span className="text-primary">Laplacian</span></div>
                      <div>Mask Size: <span className="text-primary">21×21</span> (LoG mode)</div>
                      <div>Use Case: X-ray enhancement, MRI processing</div>
                    </div>
                  </div>
                </div>

                {/* Example 4 */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Real-Time Video Processing</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fast blur for video streams
                  </p>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-xs font-mono text-foreground space-y-1">
                      <div>Filter: <span className="text-primary">Box Blur</span></div>
                      <div>Mask Size: <span className="text-primary">5×5</span></div>
                      <div>Use Case: Background blur, motion effects</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Tips */}
            <Card className="cuda-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Performance Optimization</CardTitle>
                <CardDescription>Tips for faster processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">💡</Badge>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Use Appropriate Mask Sizes</h4>
                      <p className="text-xs text-muted-foreground">
                        Larger masks (21×21+) increase processing time exponentially. Start with 3×3 or 5×5 for testing.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">⚡</Badge>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Optimize Block Dimensions</h4>
                      <p className="text-xs text-muted-foreground">
                        Use [16, 16] or [32, 16] for block_dim. These values maximize GPU thread utilization.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">🎯</Badge>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Choose the Right Filter</h4>
                      <p className="text-xs text-muted-foreground">
                        Box Blur is fastest, Gaussian offers best quality, edge detectors are moderate speed.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
