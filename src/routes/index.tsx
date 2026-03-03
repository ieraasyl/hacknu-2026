import { createFileRoute } from '@tanstack/react-router';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import InfoCards from '@/components/landing/InfoCards';
import About from '@/components/landing/About';
import FAQ from '@/components/landing/FAQ';
import Partners from '@/components/landing/Partners';
import Footer from '@/components/landing/Footer';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <div className="min-h-screen bg-hacknu-dark">
      <Navbar />
      <Hero />
      <InfoCards />
      <About />
      <FAQ />
      <Partners />
      <Footer />
    </div>
  );
}
