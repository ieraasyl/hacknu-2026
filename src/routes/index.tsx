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

  return (
    <div className="min-h-screen bg-hacknu-dark">
      <Navbar session={session} />
      <Hero session={session} />
      <InfoCards />
      <About />
      <FAQ />
      <Partners />
      <Footer session={session} />
    </div>
  );
}
