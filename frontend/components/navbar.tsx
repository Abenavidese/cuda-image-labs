import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/home" className="flex items-center gap-3">
        <Image
          src="/logo_cuda.jpg"
          alt="CUDA Image Lab"
          width={300}
          height={90}
          className="h-16 w-auto object-contain"
          priority
        />
        </Link>

        <div className="flex items-center gap-8">
          <Link href="/home" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="/app" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
            App
          </Link>
          <Link href="/docs" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
            Docs
          </Link>
        </div>
      </div>
    </nav>
  )
}
