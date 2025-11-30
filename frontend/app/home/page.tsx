import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Settings, Zap, ImageIcon } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <h1 className="mb-6 text-balance font-mono text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
            GPU-Accelerated Image Convolution with <span className="text-primary">CUDA</span>
          </h1>

          <p className="mb-12 text-balance text-lg text-muted-foreground md:text-xl">
            Upload an image, choose a filter, and process it on a real CUDA-powered backend.
            <br />
            Experience the raw power of parallel GPU computing.
          </p>

          <Link href="/app">
            <Button
              size="lg"
              className="cuda-glow h-14 bg-primary px-10 text-base font-semibold text-black hover:bg-primary/90"
            >
              Go to the App
              <Zap className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          {/* Decorative Grid */}
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Prewwit", url: "/prewitt_home.jpg" },
              { label: "Laplaciano", url: "/laplaciano_home.png" },
              { label: "Gaussiano", url: "/gausiano_home.png" },
              { label: "Box Blur", url: "/boxblur_home.png" },
            ].map((item, i) => (
              <div key={i} className="group relative overflow-hidden rounded-lg border border-border">
                <img
                  src={item.url || "/placeholder.svg"}
                  alt={item.label}
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-sm font-semibold text-primary">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center font-mono text-4xl font-bold text-foreground">
            How It <span className="text-primary">Works</span>
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Upload,
                title: "Upload your image",
                description: "Select any image from your device. It will be converted to base64 for processing.",
              },
              {
                icon: Settings,
                title: "Choose a filter and CUDA configuration",
                description:
                  "Select from blur, sharpen, sobel, or gaussian filters. Configure block and grid dimensions.",
              },
              {
                icon: Zap,
                title: "Get processed results in seconds",
                description: "Our CUDA-powered backend processes your image on GPU and returns execution metrics.",
              },
            ].map((step, i) => (
              <Card key={i} className="cuda-border bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Showcase */}
      <section className="border-t border-border py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center font-mono text-4xl font-bold text-foreground">
            Available <span className="text-primary">Filters</span>
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Prewitt",
                description: "Apply Gaussian blur to smooth and reduce noise in images.",
                icon: "▢",
              },
              {
                name: "Laplacian",
                description: "Enhance edges and fine details for crisper image quality.",
                icon: "◆",
              },
              {
                name: "Gaussian",
                description: "Edge detection filter that highlights boundaries and gradients.",
                icon: "⬚",
              },
              {
                name: "Box Blur",
                description: "Advanced blur using Gaussian distribution for natural smoothing.",
                icon: "◯",
              },
            ].map((filter, i) => (
              <Card key={i} className="cuda-border bg-card/50 backdrop-blur-sm transition-all hover:cuda-border-glow">
                <CardHeader>
                  <div className="mb-2 font-mono text-3xl text-primary">{filter.icon}</div>
                  <CardTitle>{filter.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{filter.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="border-t border-border py-32 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-balance font-mono text-4xl font-bold text-foreground md:text-5xl">
            Ready to try <span className="text-primary">GPU convolution?</span>
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">
            Experience real-time GPU-accelerated image processing powered by NVIDIA CUDA.
          </p>
          <Link href="/app">
            <Button
              size="lg"
              className="cuda-glow h-14 bg-primary px-10 text-base font-semibold text-black hover:bg-primary/90"
            >
              Launch App
              <ImageIcon className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          <p className="mb-2 font-semibold">CUDA Image Lab © 2025</p>
          <p>Team Members: HENRY GRANDA • ANTHONY BENAVIDES • BRYAM PERALTA</p>
        </div>
      </footer>
    </div>
  )
}
