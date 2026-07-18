import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SupportTicketForm from '@/components/SupportTicketForm';

export const metadata: Metadata = {
  title: 'Contact Us | Lumë Refillery',
  description:
    'Have a question about our products, services, or partnerships? We’d love to hear from you.',
};

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-canvas text-lume-house selection:bg-lume-house selection:text-canvas">
      <Header />
      <main className="pt-[140px] pb-28">
        <div className="mx-auto max-w-2xl px-6 lg:px-0">
          <span className="mb-4 block text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary">
            We Care
          </span>
          <h1 className="mb-4 font-display text-4xl leading-tight tracking-tight text-lume-house md:text-5xl">
            Contact Us
          </h1>
          <p className="mb-12 max-w-xl text-[14px] font-light leading-relaxed text-text-secondary">
            Have a general query about our products, services, or partnerships?
            Send us a note and we&rsquo;ll get back to you.
          </p>
          <SupportTicketForm type="query" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
