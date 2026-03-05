import { createFileRoute } from '@tanstack/react-router';
import { useSession } from '@/lib/auth-client';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import InfoCards from '@/components/landing/InfoCards';
import About from '@/components/landing/About';
import FAQ from '@/components/landing/FAQ';
import Partners from '@/components/landing/Partners';
import Footer from '@/components/landing/Footer';

export const Route = createFileRoute('/')({ component: LandingPage });

function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-hacknu-dark">
      <Navbar session={session ?? null} />
      <Hero session={session ?? null} />
      <InfoCards />
      <About />
      <FAQ />
      <Partners />
      <Footer session={session ?? null} />
    </div>
  );
}
