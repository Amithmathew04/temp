"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "./mode-toggle"
import { useState } from "react"
import { Menu } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-900 bg-opacity-90 backdrop-blur-sm">
      <div className="flex items-center justify-between h-16 w-full px-4 relative">

        {/* Left: Logo + ModeToggle */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-white">
            Drone <span className="text-blue-400">Sync</span>
          </Link>
          <ModeToggle />
        </div>

        {/* Right: Hamburger Menu */}
        <div className="relative">
          <button
            className="text-white hover:text-blue-400"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={24} />
          </button>

          {menuOpen && (
            <div className="absolute top-10 right-0 bg-gray-800 rounded shadow-lg p-2 w-40 z-50">
              <Link
                href="/"
                className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                  pathname === "/" ? "bg-blue-600 text-white" : "text-gray-300"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/history"
                className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                  pathname === "/history" ? "bg-blue-600 text-white" : "text-gray-300"
                }`}
              >
                Analysis
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}
