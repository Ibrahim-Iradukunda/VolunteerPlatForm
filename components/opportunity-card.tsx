import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Accessibility, Calendar } from "lucide-react"
import type { Opportunity } from "@/lib/types"
import Link from "next/link"

interface OpportunityCardProps {
  opportunity: Opportunity
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-xl leading-tight">{opportunity.title}</CardTitle>
          <Badge variant={opportunity.type === "remote" ? "secondary" : "default"}>{opportunity.type}</Badge>
        </div>
        <CardDescription className="text-sm">{opportunity.organizationName}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{opportunity.description}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span>{opportunity.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span>{opportunity.applications} applications</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span>Posted {new Date(opportunity.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {opportunity.accessibilityFeatures.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Accessibility className="h-4 w-4" aria-hidden="true" />
              <span>Accessibility Features</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {opportunity.accessibilityFeatures.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {opportunity.skills.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/opportunities/${opportunity._id || opportunity.id}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
