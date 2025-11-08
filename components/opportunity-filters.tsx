"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Search } from "lucide-react"

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Opportunities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
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
              className="pl-9"
              aria-label="Search opportunities"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Opportunity Type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger id="type" aria-label="Filter by opportunity type">
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
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            aria-label="Filter by location"
          />
        </div>

        <div className="space-y-3">
          <Label>Accessibility Features</Label>
          <div className="space-y-2">
            {accessibilityOptions.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  id={option}
                  checked={accessibilityFilters.includes(option)}
                  onCheckedChange={(checked) => handleAccessibilityChange(option, checked as boolean)}
                  aria-label={option}
                />
                <Label htmlFor={option} className="text-sm font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
