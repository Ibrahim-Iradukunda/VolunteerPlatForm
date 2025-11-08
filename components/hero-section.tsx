import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart, Users, Globe } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-6xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
            Inclusive Volunteer Opportunities for Everyone
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Connecting youth and people with disabilities to meaningful volunteer opportunities across Africa. Build
            skills, make impact, and grow together.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/register">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
          <Link href="#opportunities">
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              Browse Opportunities
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-3 p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-lg">Inclusive by Design</h3>
            <p className="text-sm text-muted-foreground text-center">
              Every opportunity is tagged with accessibility features to ensure equal participation
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-lg">Community Driven</h3>
            <p className="text-sm text-muted-foreground text-center">
              Connect with NGOs and organizations committed to diversity and inclusion
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-lg">Pan-African Reach</h3>
            <p className="text-sm text-muted-foreground text-center">
              Opportunities across the continent, from local communities to regional initiatives
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
