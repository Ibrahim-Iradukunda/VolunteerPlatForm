"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, User, Building2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth-context"

export function AdminUsers() {
  const { toast } = useToast()
  const { token, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "volunteer" | "organization">("all")
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let initialLoad = true

    const loadUsers = async () => {
      if (!isAuthenticated) {
        if (isMounted) {
          setUsers([])
          setIsLoading(false)
        }
        return
      }

      if (initialLoad) {
        setIsLoading(true)
      }

      try {
        const headers: HeadersInit = { "Content-Type": "application/json" }
        if (token) {
          (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
        }

        const response = await fetch("/api/admin/users", {
          headers,
        })

        if (!isMounted) return

        if (response.ok) {
          const data = await response.json()
          const newUsers = data.users || []
          
          // Only update if data actually changed
          setUsers((prev) => {
            const prevIds = new Set(prev.map((u) => u.id || u._id).sort())
            const newIds = new Set(newUsers.map((u) => u.id || u._id).sort())
            if (prevIds.size !== newIds.size || [...prevIds].some((id) => !newIds.has(id))) {
              return newUsers
            }
            return prev
          })
        } else {
          const error = await response.json().catch(() => ({}))
          console.error("Failed to load users:", error)
          setUsers([])
        }
      } catch (error) {
        if (!isMounted) return
        console.error("Error loading users:", error)
        setUsers([])
      } finally {
        if (isMounted) {
          if (initialLoad) {
            setIsLoading(false)
            initialLoad = false
          }
        }
      }
    }

    loadUsers()
    // Only refresh on window focus, not automatically
    const handleFocus = () => {
      if (isMounted) {
        loadUsers()
      }
    }
    window.addEventListener("focus", handleFocus)

    return () => {
      isMounted = false
      window.removeEventListener("focus", handleFocus)
    }
  }, [isAuthenticated])

  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => {
      const matchesSearch =
        searchQuery === "" ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.orgName?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRole = roleFilter === "all" || u.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [users, searchQuery, roleFilter])

  const handleDeleteUser = async (userId: string) => {
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" }
      if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers,
      })

      if (response.ok) {
        // Close the dialog first
        setDeleteDialogOpen(null)
        // Remove from state using both id and _id for compatibility
        setUsers((prev) => prev.filter((u: any) => {
          const uId = u.id || u._id
          return uId !== userId
        }))
        toast({
          title: "User deleted",
          description: "The user and related data have been removed.",
        })
        // Refresh the list to ensure consistency
        const refreshResponse = await fetch("/api/admin/users", {
          headers,
        })
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setUsers(data.users || [])
        }
      } else {
        const error = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: error.error || "Failed to delete user.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "volunteer":
        return <User className="h-4 w-4" />
      case "organization":
        return <Building2 className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "volunteer":
        return "Volunteer"
      case "organization":
        return "Organization"
      default:
        return role
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">User Management</h2>
        <p className="text-muted-foreground">View and manage all platform users</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder=""
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="volunteer">Volunteers</SelectItem>
            <SelectItem value="organization">Organizations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">Loading users...</p>
            </CardContent>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No users found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user: any) => (
            <Card key={user.id || user._id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{user.name || user.orgName || "Unknown"}</CardTitle>
                      <Badge variant="secondary">{getRoleBadge(user.role)}</Badge>
                      {user.role === "organization" && (
                        <Badge variant={user.verified ? "default" : "outline"}>
                          {user.verified ? "Verified" : "Unverified"}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <div className="text-muted-foreground">{getRoleIcon(user.role)}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">User ID</p>
                    <p className="text-sm font-mono">{user.id || user._id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Joined</p>
                    <p className="text-sm">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                </div>
                {user.role === "volunteer" && (
                  <div className="space-y-2">
                    {user.skills && user.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {user.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {user.disabilityStatus && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Disability Status</p>
                        <p className="text-sm">{user.disabilityStatus}</p>
                      </div>
                    )}
                  </div>
                )}
                {user.role === "organization" && (
                  <div className="space-y-2">
                    {user.description && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                        <p className="text-sm">{user.description}</p>
                      </div>
                    )}
                    {user.contactInfo && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Contact Info</p>
                        <p className="text-sm">{user.contactInfo}</p>
                      </div>
                    )}
                  </div>
                )}
                {user.role !== "admin" && (
                  <div className="flex gap-2 pt-2 border-t">
                    <AlertDialog 
                      open={deleteDialogOpen === (user.id || user._id)}
                      onOpenChange={(open) => {
                        setDeleteDialogOpen(open ? (user.id || user._id) : null)
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete User
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete user?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete "{user.name || user.orgName || "this user"}" and all related opportunities, applications, likes, and comments. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              await handleDeleteUser(user.id || user._id)
                            }}
                            className="bg-destructive"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

