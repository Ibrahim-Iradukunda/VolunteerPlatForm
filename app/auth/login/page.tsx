import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mb-4 mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <LoginForm />
        <p className="mt-4 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-primary hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
      <SiteFooter />
    </div>
  )
}
