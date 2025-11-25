import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl mb-4 mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <RegisterForm />
        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
      <SiteFooter />
    </div>
  )
}
