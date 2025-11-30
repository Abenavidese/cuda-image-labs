"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

interface ShowcaseItem {
  name: string
  original: string
  processed: string
  filter: string
  description: string
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    name: "Cuenca",
    original: "/cuenca_box_blur.jpg",
    processed: "/cuenca-procesed.png",
    filter: "Box Blur",
    description: "Smoothing filter for noise reduction"
  },
  {
    name: "Taj Mahal",
    original: "/tajmaha_prewitt.jpg",
    processed: "/tajmahal-procesed.jpg",
    filter: "Prewitt",
    description: "Edge detection filter"
  },
  {
    name: "Husky",
    original: "/husky_gauss.jpg",
    processed: "/husky-procesed.png",
    filter: "Gaussian",
    description: "Blur with gaussian distribution"
  },
  {
    name: "Bird",
    original: "/bird_laplacian.jpg",
    processed: "/bird_procesed.png",
    filter: "Laplacian",
    description: "Second derivative edge detection"
  }
]

export function AutoShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showProcessed, setShowProcessed] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const currentItem = SHOWCASE_ITEMS[currentIndex]

  useEffect(() => {
    // Reset state when changing image
    setShowProcessed(false)
    setIsProcessing(false)
    setProgress(0)

    // Wait 1 second showing original
    const showOriginalTimer = setTimeout(() => {
      // Start "processing" animation
      setIsProcessing(true)
      
      // Simulate progressive processing over 3.5 seconds
      const duration = 3500 // 3.5 seconds
      const steps = 70 // 70 frames para suavidad
      const interval = duration / steps

      let currentStep = 0
      const progressInterval = setInterval(() => {
        currentStep++
        const newProgress = (currentStep / steps) * 100
        setProgress(newProgress)

        if (currentStep >= steps) {
          clearInterval(progressInterval)
          setShowProcessed(true)
          setIsProcessing(false)

          // Show processed result for 1.5 seconds, then move to next
          setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length)
          }, 1500)
        }
      }, interval)

      return () => clearInterval(progressInterval)
    }, 1000)

    return () => clearTimeout(showOriginalTimer)
  }, [currentIndex])

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl font-bold animate-fade-in">
            See It <span className="text-primary">For Yourself</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Watch CUDA process images in real-time with different filters
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
            {/* Progress Bar */}
            <div className="relative h-2 bg-muted">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Header with Filter Info */}
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold">{currentItem.name}</h3>
                    {isProcessing && (
                      <Zap className="h-5 w-5 text-primary animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentItem.description}
                  </p>
                </div>
                <Badge variant="outline" className="text-base px-4 py-2">
                  {currentItem.filter}
                </Badge>
              </div>
            </div>

            {/* Image Display */}
            <div className="grid md:grid-cols-2 divide-x divide-border">
              {/* Original */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Original
                  </span>
                  {!isProcessing && !showProcessed && (
                    <span className="text-xs text-primary animate-pulse">
                      ● Ready
                    </span>
                  )}
                </div>
                <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted/20">
                  <img
                    src={currentItem.original}
                    alt={`${currentItem.name} original`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Processed */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {isProcessing ? "Processing..." : "Processed"}
                  </span>
                  {isProcessing && (
                    <span className="text-xs text-primary font-mono">
                      {progress.toFixed(0)}%
                    </span>
                  )}
                  {showProcessed && (
                    <span className="text-xs text-green-500">
                      ✓ Complete
                    </span>
                  )}
                </div>
                <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted/20 relative">
                  {isProcessing ? (
                    /* Progressive Reveal Effect */
                    <div className="relative w-full h-full">
                      <img
                        src={currentItem.processed}
                        alt={`${currentItem.name} processed`}
                        className="w-full h-full object-cover"
                        style={{
                          clipPath: `inset(0 0 ${100 - progress}% 0)`
                        }}
                      />
                      {/* Scan line effect */}
                      <div
                        className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_10px_rgba(0,230,118,0.8)]"
                        style={{
                          top: `${progress}%`,
                          transition: "top 0.1s linear"
                        }}
                      />
                    </div>
                  ) : showProcessed ? (
                    <img
                      src={currentItem.processed}
                      alt={`${currentItem.name} processed`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <Zap className="h-12 w-12 opacity-20" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="p-4 border-t border-border bg-muted/20">
              <div className="flex justify-center gap-2">
                {SHOWCASE_ITEMS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "w-8 bg-primary"
                        : "w-2 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
