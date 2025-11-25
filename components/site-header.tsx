"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Compass, Info, LayoutDashboard, LogIn, LogOut, Menu, UserPlus, X } from "lucide-react"
import { useState } from "react"

export function SiteHeader() {
  const { isAuthenticated, user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg" aria-hidden="true">
              IV
            </span>
          </div>
          <span className="font-bold text-lg hidden sm:inline">Inclusive Volunteers</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#opportunities" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5">
            <Compass className="h-4 w-4" aria-hidden="true" />
            Opportunities
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5">
            {/* <Info className="h-4 w-4" aria-hidden="true" /> */}
            About
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="gap-2">
                  {/* <LogIn className="h-4 w-4" aria-hidden="true" /> */}
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container flex flex-col gap-4 p-4">
            <Link
              href="/#opportunities"
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              Opportunities
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Info className="h-4 w-4" aria-hidden="true" />
              About
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full gap-2"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full gap-2">
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
