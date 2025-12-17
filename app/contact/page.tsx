import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ContactPage() {
  return (
    <>
      <main className="relative z-10 min-h-screen py-24">
        <div className="w-full max-w-2xl mx-auto px-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block"
          >
            ← Back to home
          </Link>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
              <p className="text-foreground-secondary">
                Have a question or feedback? We'd love to hear from you.
              </p>
            </div>

            <form className="space-y-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="How can we help?"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  className="mt-1 flex min-h-[150px] w-full rounded-md border border-input bg-background-secondary px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tell us more..."
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Send Message
              </Button>
            </form>

            <div className="pt-8 border-t border-border">
              <h2 className="text-xl font-semibold mb-4">Other Ways to Reach Us</h2>
              <div className="space-y-3 text-foreground-secondary">
                <p>
                  <strong className="text-foreground">Email:</strong>{' '}
                  <a href="mailto:support@vorg.com" className="hover:text-foreground transition-colors">
                    support@vorg.com
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">Twitter:</strong>{' '}
                  <a href="https://twitter.com/vorg" className="hover:text-foreground transition-colors">
                    @vorg
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
