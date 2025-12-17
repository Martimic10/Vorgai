import Link from 'next/link'

export default function PrivacyPage() {
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

          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <p>Last updated: December 8, 2025</p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an
                account, use our services, or communicate with us.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services,
                to process your requests, and to communicate with you.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">3. Information Sharing</h2>
              <p>
                We do not share your personal information with third parties except as described
                in this privacy policy or with your consent.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">4. Data Security</h2>
              <p>
                We take reasonable measures to help protect your personal information from loss,
                theft, misuse, and unauthorized access.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">5. Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information at any
                time by accessing your account settings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at
                privacy@vorg.com
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
