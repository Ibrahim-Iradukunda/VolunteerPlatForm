import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Accessibility, Calendar, ArrowRight, Building2 } from "lucide-react"
import type { Opportunity } from "@/lib/types"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface OpportunityCardProps {
  opportunity: Opportunity
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <Card className="h-full flex flex-col group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <CardTitle className="text-xl leading-tight flex-1 group-hover:text-primary transition-colors">
            {opportunity.title}
          </CardTitle>
          <Badge 
            variant={opportunity.type === "remote" ? "secondary" : "default"} 
            className="shrink-0 capitalize font-semibold"
          >
            {opportunity.type}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{opportunity.organizationName}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {opportunity.description}
        </p>

        <div className="space-y-2.5 pt-2 border-t">
          <div className="flex items-center gap-2.5 text-sm">
            <MapPin className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span className="text-foreground">{opportunity.location}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Users className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span className="text-muted-foreground">
              {opportunity.applications} {opportunity.applications === 1 ? "application" : "applications"}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Calendar className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span className="text-muted-foreground">
              Posted {new Date(opportunity.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </span>
          </div>
        </div>

        {opportunity.accessibilityFeatures.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Accessibility className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Accessibility Features</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {opportunity.accessibilityFeatures.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-primary/5 border-primary/20">
                  {feature}
                </Badge>
              ))}
              {opportunity.accessibilityFeatures.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{opportunity.accessibilityFeatures.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {opportunity.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {opportunity.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs font-medium">
                {skill}
              </Badge>
            ))}
            {opportunity.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{opportunity.skills.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4 border-t">
        <Link href={`/opportunities/${opportunity.id || opportunity._id}`} className="w-full">
          <Button className="w-full group/btn" variant="default">
            View Details
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
