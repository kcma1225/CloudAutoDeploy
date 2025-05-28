"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center cursor-pointer">
              <div className="h-8 w-8 bg-blue-600 dark:bg-blue-500 rounded mr-2 flex items-center justify-center transition-colors duration-300">
                <span className="text-white font-bold text-sm">CA</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                CloudAutoDeploy
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant={pathname === "/" ? "default" : "ghost"} asChild className="transition-colors duration-200">
              <Link href="/">Dashboard</Link>
            </Button>
            <Button
              variant={pathname === "/deployments" ? "default" : "ghost"}
              asChild
              className="transition-colors duration-200"
            >
              <Link href="/deployments">Deployments</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
