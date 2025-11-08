"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  getAuthHeaders: () => HeadersInit
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Guard against SSR - localStorage is only available in the browser
    if (typeof window === "undefined") return

    // Initialize admin user if it doesn't exist
    const mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]")
    const adminExists = mockUsers.some(
      (u: any) => u.email === "adminibra@gmail.com" && u.role === "admin"
    )

    if (!adminExists) {
      const { generateId } = require("@/lib/utils/id")
      const adminUser = {
        id: generateId(),
        email: "adminibra@gmail.com",
        password: "admin00",
        name: "Admin User",
        role: "admin" as const,
        createdAt: new Date().toISOString(),
        verified: true,
      }
      mockUsers.push(adminUser)
      localStorage.setItem("mockUsers", JSON.stringify(mockUsers))
    }

    // Check for stored user session
    const storedUser = localStorage.getItem("user")
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUser(user)
        setIsAuthenticated(true)
        // Token is optional for localStorage
        const storedToken = localStorage.getItem("token")
        if (storedToken) {
          setToken(storedToken)
        }
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    if (typeof window === "undefined") return false
    // Use localStorage directly
    const mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]")
    const foundUser = mockUsers.find((u: any) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      setIsAuthenticated(true)
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
      // Token is optional for localStorage, but set a dummy token for compatibility
      if (!localStorage.getItem("token")) {
        localStorage.setItem("token", "localStorage-auth")
      }
      setToken("localStorage-auth")
      return true
    }
    
    return false
  }

  const register = async (userData: any): Promise<boolean> => {
    if (typeof window === "undefined") return false
    // Use localStorage directly
    const mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]")

    if (mockUsers.some((u: any) => u.email === userData.email)) {
      return false
    }

    const { generateId } = require("@/lib/utils/id")
    
    const newUser = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      verified: userData.role === "organization" ? false : true,
    }

    mockUsers.push(newUser)
    localStorage.setItem("mockUsers", JSON.stringify(mockUsers))

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    setIsAuthenticated(true)
    localStorage.setItem("user", JSON.stringify(userWithoutPassword))
    return true
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    }
  }

  const getAuthHeaders = (): HeadersInit => {
    const headers: HeadersInit = { "Content-Type": "application/json" }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    return headers
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
