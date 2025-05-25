"use client"

import Link from "next/link"
import { Database, Github } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <span className="font-semibold text-base sm:text-lg">Clustory</span>
        </Link>

        {/* Right: GitHub and Theme Toggle */}
        <div className="flex items-center gap-4">
          <Link 
            href="https://github.com/username/clustory" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-2 rounded-md hover:bg-muted transition-colors"
          >
            <Github className="h-5 w-5" />
          </Link>
          <div className="p-2 rounded-md hover:bg-muted transition-colors">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
