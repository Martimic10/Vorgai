import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="relative z-10 min-h-screen py-24">
        <div className="w-full max-w-4xl mx-auto px-4">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white mb-8 inline-block transition-colors"
          >
            ← Back to home
          </Link>

          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <p>Last updated: December 8, 2025</p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Vorg, you accept and agree to be bound by the terms and
                provision of this agreement.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">2. Use License</h2>
              <p>
                Permission is granted to temporarily use Vorg for personal, non-commercial
                transitory viewing only.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">3. Service Description</h2>
              <p>
                Vorg is an AI-powered landing page generator. We reserve the right to modify or
                discontinue the service at any time without notice.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">4. User Responsibilities</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and
                password. You agree to accept responsibility for all activities that occur under
                your account.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">5. Contact</h2>
              <p>
                If you have any questions about these Terms, please contact us at
                support@vorg.com
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
