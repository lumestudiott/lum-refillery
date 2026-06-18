'use client';

import React, { useState, useEffect } from 'react';

/**
 * Full-page maintenance overlay.
 *
 * Maintenance mode is automatically enabled on the **production domain**
 * (lumerefillery.com) and disabled everywhere else (Vercel preview URLs,
 * localhost, etc.).
 *
 * To force maintenance OFF everywhere, set MAINTENANCE_ENABLED = false.
 * To force maintenance ON  everywhere, set MAINTENANCE_ENABLED = true and
 * remove the hostname check below.
 */
const MAINTENANCE_ENABLED = true;

/** Domains where maintenance mode should be active. */
const MAINTENANCE_DOMAINS = ['lumerefillery.com', 'www.lumerefillery.com'];

/**
 * Exported so layout.tsx can still conditionally render.
 * During SSR / first render this is `true` (safe default for prod),
 * but the component itself double-checks on the client.
 */
export const MAINTENANCE_MODE = MAINTENANCE_ENABLED;

export default function MaintenanceBanner() {
  const [isMaintenanceDomain, setIsMaintenanceDomain] = useState(false);

  useEffect(() => {
    if (MAINTENANCE_ENABLED) {
      const host = window.location.hostname;
      setIsMaintenanceDomain(MAINTENANCE_DOMAINS.includes(host));
    }
  }, []);

  if (!MAINTENANCE_ENABLED || !isMaintenanceDomain) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-canvas overflow-hidden">
      {/* Subtle animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, #00754A 0%, transparent 70%)',
            animation: 'maintPulse 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{
            background: 'radial-gradient(circle, #006241 0%, transparent 70%)',
            animation: 'maintPulse 8s ease-in-out infinite 2s',
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-[250px] h-[250px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #cba258 0%, transparent 70%)',
            animation: 'maintPulse 7s ease-in-out infinite 1s',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative text-center px-6 max-w-lg mx-auto">
        {/* Animated wrench icon */}
        <div
          className="mx-auto mb-8 w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #00754A 0%, #006241 100%)',
            boxShadow: '0 8px 32px rgba(0, 98, 65, 0.25)',
            animation: 'maintBounce 3s ease-in-out infinite',
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: 'maintSpin 6s ease-in-out infinite' }}
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="font-display text-4xl md:text-5xl text-lume-house mb-4"
          style={{ letterSpacing: '-0.03em' }}
        >
          We'll be right back
        </h1>

        {/* Decorative line */}
        <div className="mx-auto mb-6 w-16 h-[3px] rounded-full bg-lume-accent opacity-60" />

        {/* Description */}
        <p className="font-sans text-lg md:text-xl text-text-secondary leading-relaxed mb-3">
          Lumë Refillery is temporarily offline for scheduled maintenance.
        </p>
        <p className="font-sans text-base text-text-secondary/70 leading-relaxed mb-10">
          We're making things better behind the scenes. We'll be back shortly, thank you for your patience!
        </p>

        {/* Status pill */}
        <div
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium"
          style={{
            background: 'rgba(0, 117, 74, 0.08)',
            color: '#00754A',
            border: '1px solid rgba(0, 117, 74, 0.15)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full bg-lume-accent"
            style={{ animation: 'maintBlink 1.5s ease-in-out infinite' }}
          />
          Maintenance in progress
        </div>

        {/* Contact fallback */}
        <p className="mt-8 text-sm text-text-secondary/50 font-sans">
          Questions? Email us at{' '}
          <a
            href="mailto:lumestudiott@gmail.com"
            className="text-lume-accent hover:underline"
          >
            lumestudiott@gmail.com
          </a>
        </p>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes maintPulse {
          0%, 100% { transform: scale(1); opacity: 0.05; }
          50% { transform: scale(1.15); opacity: 0.1; }
        }
        @keyframes maintBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes maintSpin {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        @keyframes maintBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
