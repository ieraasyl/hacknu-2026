import { useState } from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useSession } from '../../lib/auth-client';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-hacknu-border bg-hacknu-dark/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="/" className="group flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter text-hacknu-green">HackNU</span>
          <span className="text-2xl font-bold tracking-tighter text-hacknu-purple">/26</span>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="sm"
            className="tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
            render={<a href="#about" />}
          >
            About
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
            render={<a href="#faq" />}
          >
            FAQ
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
            render={<a href="#partners" />}
          >
            Partners
          </Button>
          <Button
            className="ml-2 bg-hacknu-green font-bold tracking-wider text-hacknu-dark uppercase hover:bg-hacknu-green/80 hover:shadow-[0_0_20px_rgba(88,225,145,0.3)]"
            render={<a href={isLoggedIn ? '/dashboard' : '/login'} />}
          >
            {isLoggedIn ? 'Dashboard' : 'Register'}
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-hacknu-text-muted hover:bg-transparent hover:text-hacknu-green md:hidden"
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </Button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-hacknu-border bg-hacknu-dark md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            <Button
              variant="ghost"
              className="justify-start tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
              render={<a href="#about" />}
              onClick={() => setIsOpen(false)}
            >
              About
            </Button>
            <Button
              variant="ghost"
              className="justify-start tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
              render={<a href="#faq" />}
              onClick={() => setIsOpen(false)}
            >
              FAQ
            </Button>
            <Button
              variant="ghost"
              className="justify-start tracking-wider text-hacknu-text-muted uppercase hover:bg-transparent hover:text-hacknu-green"
              render={<a href="#partners" />}
              onClick={() => setIsOpen(false)}
            >
              Partners
            </Button>
            <Separator className="my-2 bg-hacknu-border" />
            <Button
              className="bg-hacknu-green font-bold tracking-wider text-hacknu-dark uppercase hover:bg-hacknu-green/80"
              render={<a href={isLoggedIn ? '/dashboard' : '/login'} />}
            >
              {isLoggedIn ? 'Dashboard' : 'Register'}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
