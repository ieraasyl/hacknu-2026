import { createFileRoute } from '@tanstack/react-router';
import { AuthHeader } from '@/components/AuthHeader';

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: 'Privacy Policy — HackNU/26' },
      {
        name: 'description',
        content:
          'Privacy policy for HackNU/26 — how we collect, use, and protect your personal data.',
      },
    ],
  }),
});

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-hacknu-dark">
      <AuthHeader logoSize="sm" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(88,225,145,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(88,225,145,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative z-10">
          <h1 className="mb-2 font-mono text-2xl font-bold tracking-tight text-hacknu-green">
            Privacy Policy
          </h1>
          <p className="mb-8 text-sm text-hacknu-text-muted">
            Last updated: March 2026
          </p>

          <div className="space-y-6 text-sm leading-relaxed text-hacknu-text">
            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                1. Who we are
              </h2>
              <p>
                HackNU/26 is the 9th Annual 24-hour student hackathon organized by
                the NU ACM Student Chapter at Nazarbayev University, Astana,
                Kazakhstan. This privacy policy applies to the HackNU/26
                registration website and app at hacknu.nuacm.kz.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                2. Data we collect
              </h2>
              <p className="mb-2">
                When you register for HackNU/26, we collect and process the
                following personal data:
              </p>
              <ul className="list-inside list-disc space-y-1 text-hacknu-text-muted">
                <li>
                  <strong className="text-hacknu-text">Account data:</strong>{' '}
                  Email address, name, and profile picture (from Google Sign-In
                  or email OTP verification)
                </li>
                <li>
                  <strong className="text-hacknu-text">Registration data:</strong>{' '}
                  Full name, IIN (individual identification number), phone number,
                  city, place of study, education level, parent/guardian phone
                  (if applicable)
                </li>
                <li>
                  <strong className="text-hacknu-text">CV/resume:</strong> If you
                  upload a CV during registration, it is stored securely on our
                  systems
                </li>
                <li>
                  <strong className="text-hacknu-text">Team data:</strong> Team
                  name and membership information
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                3. How we use your data
              </h2>
              <p>
                We use your personal data to:
              </p>
              <ul className="list-inside list-disc space-y-1 text-hacknu-text-muted">
                <li>Verify your identity and manage your registration</li>
                <li>Organize teams and communicate hackathon logistics</li>
                <li>Share participant information with event organizers and
                  partners as needed for the event</li>
                <li>Comply with legal obligations and ensure event safety</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                4. Legal basis and consent
              </h2>
              <p>
                We process your data based on your consent when you register and
                submit your information. You may withdraw consent at any time by
                contacting us; however, withdrawal may affect your ability to
                participate in the hackathon.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                5. Data storage and security
              </h2>
              <p>
                Your data is stored on secure servers (Cloudflare D1) and
                transmitted over HTTPS. CV uploads are stored in Google Drive
                under our organization&apos;s control. We do not sell your data
                to third parties.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                6. Data retention
              </h2>
              <p>
                We retain your data for the duration of the hackathon and a
                reasonable period afterward for administrative purposes. You may
                request deletion of your data by contacting us.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                7. Your rights
              </h2>
              <p>
                Under Kazakhstan&apos;s Personal Data Law, you have the right to
                access, correct, block, or delete your personal data. To
                exercise these rights, contact us at the email below.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                8. Contact
              </h2>
              <p>
                For questions about this privacy policy or your personal data,
                contact the NU ACM Student Chapter at{' '}
                <a
                  href="mailto:acmsc@nu.edu.kz"
                  className="text-hacknu-green hover:underline"
                >
                  acmsc@nu.edu.kz
                </a>
                .
              </p>
            </section>
          </div>

          <a
            href="/"
            className="mt-12 inline-block text-sm font-medium text-hacknu-green hover:underline"
          >
            ← Back to home
          </a>
        </div>
      </main>
    </div>
  );
}
