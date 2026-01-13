import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TiersDisplay from '../components/TiersDisplay';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import About from '../components/About';
import HowItWorks from '../components/HowItWorks';
import WhoItsFor from '../components/WhoItsFor';
import FAQ from '../components/FAQ';
import Testimonials from '../components/Testimonials';
import Sourcing from '../components/Sourcing';
import Newsletter from '../components/Newsletter';
import { GiftButton } from '../components/ui/GiftButton';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/clerk-react';
import { useStoreUser } from '../hooks/useStoreUser';
import { User } from 'lucide-react';

const Home: React.FC = () => {
  const [scrolled, setScrolled] = useState(() => {
    // Check initial scroll position on mount
    if (typeof window !== 'undefined') {
      return window.scrollY > 50;
    }
    return false;
  });
  const { user: storedUser, isLoaded } = useStoreUser();
  const { user } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    // Check scroll position immediately on mount
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className={`font-serif text-2xl font-bold tracking-tight transition-colors ${
            scrolled ? 'text-stone-900' : 'text-white'
          }`}>
            Lumë <span className={scrolled ? 'text-emerald-700 font-light' : 'text-emerald-400 font-light'}>Refillery</span>
          </div>
          <nav className={`hidden md:flex gap-8 text-sm font-medium transition-colors ${
            scrolled ? 'text-stone-600' : 'text-white/90'
          }`}>
            <a href="#about" className="hover:text-emerald-500 transition-colors cursor-pointer">Our Mission</a>
            <a href="#how-it-works" className="hover:text-emerald-500 transition-colors cursor-pointer">How it Works</a>
            <a href="#pricing" className="hover:text-emerald-500 transition-colors cursor-pointer">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <GiftButton scrolled={scrolled} />
            
            <SignedOut>
              <SignInButton>
                <button className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  scrolled 
                    ? 'bg-stone-900 text-white hover:bg-stone-800' 
                    : 'bg-white text-stone-900 hover:bg-stone-100'
                }`}>
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <Link 
                to="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  scrolled 
                    ? 'bg-stone-100 text-stone-900 hover:bg-stone-200' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">My Account</span>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      <Hero />
      <div id="about">
        <About />
      </div>
      <Sourcing />
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <div id="who-its-for">
        <WhoItsFor />
      </div>
      <div id="pricing">
        <TiersDisplay />
      </div>
      <Testimonials />
      <FAQ />
      <Newsletter />
      <Footer />
    </main>
  );
};

export default Home;