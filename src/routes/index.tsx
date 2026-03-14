import { useRef } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import InfoCards from '@/components/landing/InfoCards';
import About from '@/components/landing/About';
import FAQ from '@/components/landing/FAQ';
import Partners from '@/components/landing/Partners';
import Footer from '@/components/landing/Footer';
import PixelTrail from '@/components/landing/PixelTrail';
import { getSession } from '@/lib/auth.server';

const getSessionFn = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest();
  return getSession(request);
});

export const Route = createFileRoute('/')({
  loader: () => getSessionFn(),
  component: LandingPage,
});

function LandingPage() {
  const session = Route.useLoaderData();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={containerRef} className="relative min-h-screen bg-hacknu-dark">
        <div className="pointer-events-none fixed inset-0 z-50 hidden md:block">
          <PixelTrail
            gridSize={100}
            trailSize={0.03}
            maxAge={150}
            interpolate={0.5}
            color="#57ffb6"
            gooeyEnabled={false}
            eventSource={containerRef}
            eventPrefix="client"
          />
        </div>

        <Navbar session={session} />
        <Hero session={session} />
        <InfoCards />
        <About />
        <FAQ session={session} />
        <Partners />
        <Footer session={session} />
      </div>
    </>
  );
}
