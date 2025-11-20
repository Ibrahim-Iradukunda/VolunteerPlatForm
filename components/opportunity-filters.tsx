"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OpportunityFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  typeFilter: string
  setTypeFilter: (type: string) => void
  locationFilter: string
  setLocationFilter: (location: string) => void
  accessibilityFilters: string[]
  setAccessibilityFilters: (filters: string[]) => void
}

const accessibilityOptions = [
  "Wheelchair accessible",
  "Sign language support available",
  "Flexible schedule",
  "Fully remote",
  "Screen reader compatible materials",
  "Transportation provided",
  "Adaptive equipment available",
]

export function OpportunityFilters({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  locationFilter,
  setLocationFilter,
  accessibilityFilters,
  setAccessibilityFilters,
}: OpportunityFiltersProps) {
  const handleAccessibilityChange = (option: string, checked: boolean) => {
    if (checked) {
      setAccessibilityFilters([...accessibilityFilters, option])
    } else {
      setAccessibilityFilters(accessibilityFilters.filter((f) => f !== option))
    }
  }

  const hasActiveFilters =
    searchQuery !== "" ||
    typeFilter !== "all" ||
    locationFilter !== "" ||
    accessibilityFilters.length > 0

  const clearFilters = () => {
    setSearchQuery("")
    setTypeFilter("all")
    setLocationFilter("")
    setAccessibilityFilters([])
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-bold">Filters</CardTitle>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-semibold">Search</Label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="search"
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 transition-all focus:ring-2 focus:ring-primary/20"
              aria-label="Search opportunities"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-semibold">Opportunity Type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger id="type" aria-label="Filter by opportunity type" className="h-11">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-semibold">Location</Label>
          <Input
            id="location"
            placeholder="Enter location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
            aria-label="Filter by location"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold">Accessibility Features</Label>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {accessibilityOptions.map((option) => (
              <div key={option} className="flex items-start gap-3 group">
                <Checkbox
                  id={option}
                  checked={accessibilityFilters.includes(option)}
                  onCheckedChange={(checked) => handleAccessibilityChange(option, checked as boolean)}
                  aria-label={option}
                  className="mt-0.5"
                />
                <Label
                  htmlFor={option}
                  className="text-sm font-normal cursor-pointer leading-relaxed group-hover:text-foreground transition-colors"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
          {accessibilityFilters.length > 0 && (
            <p className="text-xs text-muted-foreground pt-2 border-t">
              {accessibilityFilters.length} {accessibilityFilters.length === 1 ? "feature" : "features"} selected
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
