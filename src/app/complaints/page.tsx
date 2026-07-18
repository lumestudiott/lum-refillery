import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SupportTicketForm from '@/components/SupportTicketForm';

export const metadata: Metadata = {
  title: 'File a Complaint | Lumë Refillery',
  description:
    'Something wasn’t right with your order? Let us know and we’ll make it right.',
};

export default function ComplaintsPage() {
  return (
    <div className="min-h-screen bg-canvas text-lume-house selection:bg-lume-house selection:text-canvas">
      <Header />
      <main className="pt-[140px] pb-28">
        <div className="mx-auto max-w-2xl px-6 lg:px-0">
          <span className="mb-4 block text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary">
            We Care
          </span>
          <h1 className="mb-4 font-display text-4xl leading-tight tracking-tight text-lume-house md:text-5xl">
            File a Complaint
          </h1>
          <p className="mb-12 max-w-xl text-[14px] font-light leading-relaxed text-text-secondary">
            Received an error in your order or something wasn&rsquo;t right? Tell us what
            happened - include your order reference if you have it - and we&rsquo;ll make
            it right.
          </p>
          <SupportTicketForm type="complaint" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
