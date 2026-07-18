'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { Check, Send } from 'lucide-react';
import { api } from '../../convex/_generated/api';

type SupportTicketFormProps = {
  type: 'complaint' | 'query';
};

export default function SupportTicketForm({ type }: SupportTicketFormProps) {
  const submit = useMutation(api.support.submit);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await submit({
        type,
        name,
        email,
        orderRef: type === 'complaint' ? orderRef || undefined : undefined,
        subject,
        message,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong - please try again.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 border border-lume-house/10 bg-white/60 px-8 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lume-accent/10">
          <Check className="h-6 w-6 text-lume-accent" />
        </div>
        <h2 className="font-display text-2xl tracking-tight text-lume-house">
          {type === 'complaint' ? 'Complaint received' : 'Message received'}
        </h2>
        <p className="max-w-md text-[14px] font-light leading-relaxed text-text-secondary">
          Thank you, {name.split(' ')[0] || 'friend'}. We&rsquo;ve logged your message and will
          reply to <span className="font-medium text-lume-house">{email}</span> as soon as we can.
        </p>
      </div>
    );
  }

  const inputClass =
    'w-full border border-lume-house/20 bg-transparent px-4 py-3.5 text-[14px] font-light text-lume-house outline-none transition-colors focus:border-lume-house placeholder:text-lume-house/35';
  const labelClass =
    'mb-2 block text-[11px] font-medium uppercase tracking-[0.15em] text-text-secondary';

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
      <div>
        <label htmlFor="support-name" className={labelClass}>
          Name *
        </label>
        <input
          id="support-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
          placeholder="Your full name"
        />
      </div>
      <div>
        <label htmlFor="support-email" className={labelClass}>
          Email *
        </label>
        <input
          id="support-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>
      {type === 'complaint' && (
        <div className="sm:col-span-2">
          <label htmlFor="support-order" className={labelClass}>
            Order reference (optional)
          </label>
          <input
            id="support-order"
            value={orderRef}
            onChange={(e) => setOrderRef(e.target.value)}
            className={inputClass}
            placeholder="e.g. the order number from your confirmation email"
          />
        </div>
      )}
      <div className="sm:col-span-2">
        <label htmlFor="support-subject" className={labelClass}>
          Subject *
        </label>
        <input
          id="support-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className={inputClass}
          placeholder={
            type === 'complaint' ? 'What went wrong?' : 'What would you like to know?'
          }
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="support-message" className={labelClass}>
          Message *
        </label>
        <textarea
          id="support-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={6}
          maxLength={4000}
          className={`${inputClass} resize-y`}
          placeholder="Give us as much detail as you can…"
        />
      </div>

      {error && (
        <p className="sm:col-span-2 text-[13px] font-medium text-red-600">{error}</p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={sending}
          className={`inline-flex items-center gap-2 border border-lume-house px-8 py-4 text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-300 ${
            sending
              ? 'cursor-wait bg-lume-house/60 text-white'
              : 'bg-lume-house text-white hover:bg-transparent hover:text-lume-house'
          }`}
        >
          <Send className="h-3.5 w-3.5" />
          {sending ? 'Sending…' : type === 'complaint' ? 'Submit complaint' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
