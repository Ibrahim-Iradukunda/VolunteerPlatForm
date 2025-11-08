"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Users, Globe, Heart, Lightbulb, Shield } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">About Our Mission</h1>
            <p className="text-xl text-muted-foreground">
              Building a better future for Africa through equal opportunities, integrity, and humanity
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" aria-hidden="true" />
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Our goal is to build a better future for our people and continent through the promotion of equal
                  opportunities, integrity, and humanity. This project serves this purpose directly by creating an online
                  platform that connects youth and people with disabilities to inclusive and meaningful volunteer
                  opportunities.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Volunteerism is necessary for social and economic growth in Africa, yet persons with disabilities are
                  left out due to accessibility obstacles, ignorance, and a lack of organized systems. Through the use
                  of technology, the project aims to foster inclusivity, improve participation by communities, and
                  allow marginalized groups to actively engage in society.
                </p>
              </CardContent>
            </Card>

            {/* Problem Statement */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-primary" aria-hidden="true" />
                  <CardTitle className="text-2xl">The Problem</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Volunteer placements are poorly managed, difficult to access, and inaccessible to people with
                  disabilities in Africa. According to the African Union Youth Volunteer Corps (2023), the majority of
                  volunteer opportunities lack accessibility features, and exchange of information is dispersed across
                  different platforms. This marginalizes many potential volunteers, including those with disabilities,
                  from meaningful participation.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-2">
                    <p className="font-semibold">WHO</p>
                    <p className="text-sm text-muted-foreground">
                      Youth and people with disabilities seeking volunteer opportunities.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold">WHAT</p>
                    <p className="text-sm text-muted-foreground">
                      Lack of centralized, accessible, and inclusive volunteer opportunity platforms.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold">WHEN</p>
                    <p className="text-sm text-muted-foreground">
                      Currently, during the rise of digital transformation in Africa's education and employment sectors.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold">WHERE</p>
                    <p className="text-sm text-muted-foreground">
                      Across African communities, especially urban and semi-urban areas.
                    </p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <p className="font-semibold">WHY</p>
                    <p className="text-sm text-muted-foreground">
                      Current systems do not prioritize inclusivity and accessibility, leaving people with disabilities
                      marginalized.
                    </p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <p className="font-semibold">HOW</p>
                    <p className="text-sm text-muted-foreground">
                      By developing a digital platform that consolidates opportunities, provides accessibility filters,
                      and ensures equal participation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Solution */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" aria-hidden="true" />
                  <CardTitle className="text-2xl">Our Solution</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  The Inclusive Volunteer Opportunities Finder is a centralized platform that connects youth and people
                  with disabilities to inclusive volunteer opportunities. Our solution includes:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Accessible Design</p>
                      <p className="text-sm text-muted-foreground">
                        WCAG 2.1 compliant interface with accessibility filters and features.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Centralized Platform</p>
                      <p className="text-sm text-muted-foreground">
                        All volunteer opportunities in one place, easily searchable and filterable.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Inclusive Features</p>
                      <p className="text-sm text-muted-foreground">
                        Wheelchair access, sign language support, remote opportunities, and more.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Target className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Smart Matching</p>
                      <p className="text-sm text-muted-foreground">
                        Connect volunteers with opportunities that match their skills and accessibility needs.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Expected Impact</CardTitle>
                <CardDescription>
                  If the Inclusive Volunteer Opportunities Finder is implemented, then youth and people with disabilities
                  will gain equal access to volunteering opportunities, leading to:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">
                      ✓
                    </Badge>
                    <div>
                      <p className="font-semibold">Increased Participation</p>
                      <p className="text-sm text-muted-foreground">
                        More youth and people with disabilities actively participating in community development.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">
                      ✓
                    </Badge>
                    <div>
                      <p className="font-semibold">Stronger Inclusion</p>
                      <p className="text-sm text-muted-foreground">
                        Breaking down barriers and creating equal opportunities for all.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">
                      ✓
                    </Badge>
                    <div>
                      <p className="font-semibold">Improved Employability</p>
                      <p className="text-sm text-muted-foreground">
                        Volunteers gain valuable skills and experience through meaningful opportunities.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">
                      ✓
                    </Badge>
                    <div>
                      <p className="font-semibold">Community Growth</p>
                      <p className="text-sm text-muted-foreground">
                        Enhanced social and economic growth through inclusive volunteerism.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* References */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">References</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    African Union Youth Volunteer Corps. (2023). Promoting inclusive volunteerism in Africa.{" "}
                    <a href="https://au.int/en" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      https://au.int/en
                    </a>
                  </li>
                  <li>
                    International Labour Organization. (2022). Youth and disability inclusion in community development.{" "}
                    <a href="https://www.ilo.org/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      https://www.ilo.org/
                    </a>
                  </li>
                  <li>
                    United Nations Volunteers. (2023). State of volunteerism report: Building equal communities through
                    volunteering.{" "}
                    <a href="https://www.unv.org/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      https://www.unv.org/
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Get Involved</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Are you a volunteer looking for opportunities? An organization wanting to post volunteer positions?
                  Or interested in supporting our mission?
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="/auth/register">
                    <Badge variant="default" className="cursor-pointer hover:bg-primary/90">
                      Join as Volunteer
                    </Badge>
                  </a>
                  <a href="/auth/register">
                    <Badge variant="default" className="cursor-pointer hover:bg-primary/90">
                      Register Organization
                    </Badge>
                  </a>
                  <a href="/#opportunities">
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                      Browse Opportunities
                    </Badge>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}



