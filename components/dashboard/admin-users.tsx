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

export function AdminUsers() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "volunteer" | "organization">("all")
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    // Load users from localStorage
    loadUsers()
  }, [])

  const loadUsers = () => {
    try {
      const mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]")
      setUsers(mockUsers)
    } catch (error) {
      setUsers([])
    }
  }

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

  const handleDeleteUser = (userId: string) => {
    try {
      // Don't allow deleting admin users
      const userToDelete = users.find((u: any) => u.id === userId)
      if (userToDelete?.role === "admin") {
        toast({
          title: "Cannot delete admin",
          description: "Admin users cannot be deleted.",
          variant: "destructive",
        })
        return
      }

      const updatedUsers = users.filter((u: any) => u.id !== userId)
      localStorage.setItem("mockUsers", JSON.stringify(updatedUsers))
      setUsers(updatedUsers)
      
      // Also delete related applications
      const { getApplications, saveApplications } = require("@/lib/mock-data")
      const applications = getApplications()
      const updatedApplications = applications.filter((app: any) => app.volunteerId !== userId)
      saveApplications(updatedApplications)

      toast({
        title: "User deleted",
        description: "The user and their related data have been removed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
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
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="volunteer">Volunteers</SelectItem>
            <SelectItem value="organization">Organizations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No users found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user: any) => (
            <Card key={user.id}>
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
                    <p className="text-sm font-mono">{user.id}</p>
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete User
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the user "{user.name || user.orgName || "this user"}" and all their
                            related data. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive">
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

