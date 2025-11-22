import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart, Users, Globe, Sparkles, ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-24 px-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Building an Inclusive Future Together</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Inclusive Volunteer Opportunities for Everyone
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
            Connecting youth and people with disabilities to meaningful volunteer opportunities across Africa. Build
            skills, make impact, and grow together.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-in fade-in-50 slide-in-from-bottom-8 duration-700 delay-150">
          <Link href="/auth/register">
            <Button size="lg" className="text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-all duration-200 group">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#opportunities">
            <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-background/80 backdrop-blur-sm border-2 hover:bg-background transition-all duration-200">
              Browse Opportunities
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto animate-in fade-in-50 slide-in-from-bottom-8 duration-700 delay-300">
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <Heart className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-xl">Inclusive by Design</h3>
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Every opportunity is tagged with accessibility features to ensure equal participation
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <Users className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-xl">Community Driven</h3>
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Connect with NGOs and organizations committed to diversity and inclusion
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <Globe className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-xl">Pan-African Reach</h3>
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Opportunities across the continent, from local communities to regional initiatives
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
