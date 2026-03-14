import { createFileRoute } from '@tanstack/react-router';
import { AuthHeader } from '@/components/AuthHeader';

export const Route = createFileRoute('/terms')({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: 'Terms of Service — HackNU/26' },
      {
        name: 'description',
        content:
          'Terms of service for HackNU/26 — rules and conditions for using the registration platform.',
      },
    ],
  }),
});

function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="mb-8 text-sm text-hacknu-text-muted">
            Last updated: March 2026
          </p>

          <div className="space-y-6 text-sm leading-relaxed text-hacknu-text">
            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                1. Acceptance of terms
              </h2>
              <p>
                By registering for HackNU/26 and using this platform (hacknu.nuacm.kz),
                you agree to these Terms of Service. If you do not agree, please do
                not use the registration system.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                2. Eligibility
              </h2>
              <p>
                HackNU/26 is a student hackathon. You must be a registered student
                or otherwise meet the eligibility criteria specified in the
                hackathon rules to participate. Participation is subject to
                verification by the organizers.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                3. Registration and accuracy
              </h2>
              <p>
                You agree to provide accurate, complete, and up-to-date
                information during registration. False or misleading information
                may result in disqualification or removal from the event.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                4. Code of conduct
              </h2>
              <p>
                All participants must adhere to the hackathon&apos;s Code of
                Conduct and any rules set by the organizers. Harassment,
                cheating, or disruptive behavior will not be tolerated and may
                result in immediate removal from the event.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                5. Intellectual property
              </h2>
              <p>
                Projects created during HackNU/26 remain the property of the
                participants. By participating, you grant the organizers a
                non-exclusive license to showcase, promote, and document your
                project for hackathon-related purposes.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                6. Limitation of liability
              </h2>
              <p>
                The NU ACM Student Chapter and HackNU/26 organizers are not
                liable for any loss, damage, or inconvenience arising from your
                use of this platform or participation in the event. The platform
                is provided &quot;as is&quot; without warranties of any kind.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                7. Changes
              </h2>
              <p>
                We may update these terms from time to time. Continued use of
                the platform after changes constitutes acceptance of the
                updated terms.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-mono text-base font-semibold text-hacknu-green">
                8. Contact
              </h2>
              <p>
                For questions about these terms, contact the NU ACM Student
                Chapter at{' '}
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
