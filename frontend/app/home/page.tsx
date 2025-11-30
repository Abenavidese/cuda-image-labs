"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Settings, Zap, ImageIcon, Cpu } from "lucide-react"
import { AutoShowcase } from "@/components/auto-showcase"

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] animate-pulse" />
      </div>

      {/* Floating particles effect */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
        {/* Dynamic gradient that follows mouse */}
        <div 
          className="absolute inset-0 opacity-30 transition-opacity duration-700"
          style={{
            background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(118, 255, 94, 0.15), transparent 80%)`
          }}
        />
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent animate-pulse-slow" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm animate-fade-in">
            <Cpu className="h-4 w-4 animate-pulse" />
            Powered by NVIDIA CUDA
          </div>

          <h1 className="mb-6 text-balance font-mono text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl animate-fade-in-up">
            GPU-Accelerated Image Convolution with <span className="text-primary animate-glow">CUDA</span>
          </h1>

          <p className="mb-12 text-balance text-lg text-muted-foreground md:text-xl animate-fade-in-up animation-delay-200">
            Upload an image, choose a filter, and process it on a real CUDA-powered backend.
            <br />
            Experience the raw power of parallel GPU computing.
          </p>

          <div className="animate-fade-in-up animation-delay-400">
            <Link href="/app">
              <Button
                size="lg"
                className="cuda-glow h-14 bg-primary px-10 text-base font-semibold text-black hover:bg-primary/90 hover:scale-105 transition-all duration-300 group"
              >
                Go to the App
                <Zap className="ml-2 h-5 w-5 group-hover:animate-pulse" />
              </Button>
            </Link>
          </div>

          {/* Decorative Grid with stagger animation */}
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Prewitt", url: "/prewitt_home.jpg" },
              { label: "Laplaciano", url: "/laplaciano_home.png" },
              { label: "Gaussiano", url: "/gausiano_home.png" },
              { label: "Box Blur", url: "/boxblur_home.png" },
            ].map((item, i) => (
              <div 
                key={i} 
                className="group relative overflow-hidden rounded-lg border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in-up cursor-pointer hover:scale-105"
                style={{ animationDelay: `${600 + i * 100}ms` }}
              >
                <img
                  src={item.url || "/placeholder.svg"}
                  alt={item.label}
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="text-sm font-semibold text-primary">{item.label}</span>
                </div>
                <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center font-mono text-4xl font-bold text-foreground animate-fade-in">
            How It <span className="text-primary">Works</span>
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Upload,
                title: "Upload your image",
                description: "Select any image from your device. It will be converted to base64 for processing.",
                delay: "0ms",
              },
              {
                icon: Settings,
                title: "Choose a filter and CUDA configuration",
                description:
                  "Select from blur, sharpen, sobel, or gaussian filters. Configure block and grid dimensions.",
                delay: "100ms",
              },
              {
                icon: Zap,
                title: "Get processed results in seconds",
                description: "Our CUDA-powered backend processes your image on GPU and returns execution metrics.",
                delay: "200ms",
              },
            ].map((step, i) => (
              <Card 
                key={i} 
                className="cuda-border bg-card/50 backdrop-blur-sm transition-all duration-500 hover:bg-card/80 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 animate-fade-in-up group"
                style={{ animationDelay: step.delay }}
              >
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                    <step.icon className="h-6 w-6 text-primary group-hover:animate-pulse" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{step.title}</CardTitle>
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
          <h2 className="mb-16 text-center font-mono text-4xl font-bold text-foreground animate-fade-in">
            Available <span className="text-primary">Filters</span>
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Prewitt",
                description: "Edge detection using first derivative operators for gradient computation.",
                icon: "▢",
                delay: "0ms",
              },
              {
                name: "Laplacian",
                description: "Second derivative edge detection highlighting rapid intensity changes.",
                icon: "◆",
                delay: "100ms",
              },
              {
                name: "Gaussian",
                description: "Advanced blur using Gaussian distribution for natural smoothing.",
                icon: "⬚",
                delay: "200ms",
              },
              {
                name: "Box Blur",
                description: "Fast averaging filter for quick smoothing operations.",
                icon: "◯",
                delay: "300ms",
              },
            ].map((filter, i) => (
              <Card 
                key={i} 
                className="cuda-border bg-card/50 backdrop-blur-sm transition-all duration-500 hover:cuda-border-glow hover:scale-105 hover:shadow-2xl hover:shadow-primary/10 animate-fade-in-up group cursor-pointer"
                style={{ animationDelay: filter.delay }}
              >
                <CardHeader>
                  <div className="mb-2 font-mono text-3xl text-primary group-hover:scale-110 transition-transform duration-300">{filter.icon}</div>
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">{filter.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{filter.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Auto Showcase - See For Yourself */}
      <AutoShowcase />

      {/* CTA Final */}
      <section className="border-t border-border py-32 px-6">
        <div className="mx-auto max-w-4xl text-center animate-fade-in">
          <h2 className="mb-6 text-balance font-mono text-4xl font-bold text-foreground md:text-5xl">
            Ready to try <span className="text-primary animate-glow">GPU convolution?</span>
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">
            Experience real-time GPU-accelerated image processing powered by NVIDIA CUDA.
          </p>
          <Link href="/app">
            <Button
              size="lg"
              className="cuda-glow h-14 bg-primary px-10 text-base font-semibold text-black hover:bg-primary/90 hover:scale-110 transition-all duration-300 group"
            >
              Launch App
              <ImageIcon className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
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
