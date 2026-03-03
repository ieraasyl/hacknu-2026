import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useSession } from '../../lib/auth-client';

export default function Footer() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  return (
    <footer className="border-t border-hacknu-border bg-hacknu-dark">
      {/* Register / Dashboard CTA Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 text-center md:py-24">
        <p className="mb-4 text-sm tracking-widest text-hacknu-text-muted uppercase">
          Ready to hack?
        </p>
        <Button
          variant="link"
          className="h-auto p-0 font-mono text-2xl font-bold tracking-wider text-hacknu-green hover:text-white md:text-4xl"
          render={<a href={isLoggedIn ? '/dashboard' : '/login'} />}
        >
          {'>'} {isLoggedIn ? 'dashboard' : 'register'}
          <span
            className="ml-1 inline-block h-7 w-4 bg-hacknu-green align-middle"
            style={{ animation: 'blink 1s step-end infinite' }}
          />
        </Button>
      </div>

      <Separator className="bg-hacknu-border" />

      {/* Bottom Bar */}
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
        {/* Left: Branding */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-hacknu-green">HackNU</span>
          <span className="text-sm font-bold text-hacknu-purple">/26</span>
          <span className="ml-2 text-xs text-hacknu-text-muted">© 2026 NU ACM Student Chapter</span>
        </div>

        {/* Right: Social Links */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
            render={
              <a
                href="https://www.instagram.com/nuacmsc/"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Instagram
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
            render={
              <a
                href="https://www.linkedin.com/company/nuacmsc"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            LinkedIn
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
            render={
              <a
                href="https://www.youtube.com/@nuacmsc"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            YouTube
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
            render={
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=acmsc@nu.edu.kz&su=&body="
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Email
          </Button>
        </div>
      </div>

      <Separator className="bg-hacknu-border" />

      {/* Credits */}
      <div className="mx-auto max-w-7xl px-6 py-4 text-center">
        <p className="text-[10px] tracking-wider text-hacknu-text-muted/50">
          Designed and built with ❤ by the HackNU/26 team
        </p>
      </div>
    </footer>
  );
}
