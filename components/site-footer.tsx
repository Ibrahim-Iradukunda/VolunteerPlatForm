"use client"

import Link from "next/link"
import { Heart, Mail, Globe, Facebook, Twitter, Linkedin, Github } from "lucide-react"

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30 mt-auto w-full">
      <div className="w-full max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8 lg:gap-12">
          {/* About Section */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-lg" aria-hidden="true">
                  IV
                </span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Inclusive Volunteers
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Connecting youth and people with disabilities to inclusive and meaningful volunteer opportunities across
              Africa. Build skills, make impact, and grow together.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-block"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/#opportunities"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-block"
                >
                  Opportunities
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-block"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">For Users</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/auth/register"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-block"
                >
                  Volunteer Registration
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-block"
                >
                  Organization Registration
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-block"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-block"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} Inclusive Volunteer Opportunities Finder. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-primary fill-current animate-pulse" aria-hidden="true" />
            <span>for Africa</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
