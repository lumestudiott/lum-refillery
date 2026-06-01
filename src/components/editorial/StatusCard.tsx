'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export type StatusVariant = 'success' | 'pending' | 'error' | 'info';

interface StatusCardAction {
  href: string;
  label: string;
  icon?: LucideIcon;
  external?: boolean;
}

interface StatusCardProps {
  variant: StatusVariant;
  icon: LucideIcon;
  iconSpinning?: boolean;
  title: string;
  description?: React.ReactNode;
  primaryAction: StatusCardAction;
  secondaryAction?: StatusCardAction;
  children?: React.ReactNode;
}

const VARIANT_STYLES: Record<StatusVariant, { iconBg: string; iconColor: string }> = {
  success: { iconBg: 'bg-lume-accent/10', iconColor: 'text-lume-accent' },
  pending: { iconBg: 'bg-canvas', iconColor: 'text-text-secondary' },
  error: { iconBg: 'bg-red-50', iconColor: 'text-red-600' },
  info: { iconBg: 'bg-lume-house/[0.06]', iconColor: 'text-lume-house' },
};

const StatusCard: React.FC<StatusCardProps> = ({
  variant,
  icon: Icon,
  iconSpinning = false,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
}) => {
  const styles = VARIANT_STYLES[variant];
  const PrimaryIcon = primaryAction.icon ?? ArrowRight;
  const SecondaryIcon = secondaryAction?.icon;

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.56, ease: [0.22, 0.61, 0.36, 1] }}
        className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-card sm:p-10"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 18 }}
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${styles.iconBg}`}
        >
          <Icon
            className={`h-8 w-8 ${styles.iconColor} ${iconSpinning ? 'animate-spin' : ''}`}
            strokeWidth={2}
          />
        </motion.div>

        <h1 className="mt-6 font-display text-[clamp(1.75rem,3vw,2.25rem)] font-normal leading-[1.15] tracking-snug text-text-primary">
          {title}
        </h1>
        {description && (
          <div className="mt-3 text-[15px] leading-[1.65] text-text-secondary">{description}</div>
        )}

        {children && <div className="mt-6 text-left">{children}</div>}

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={primaryAction.href}
            className="btn-pill group inline-flex items-center justify-center gap-2 bg-lume-house px-6 py-3 text-[14px] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-black active:scale-[0.97]"
          >
            {primaryAction.label}
            <PrimaryIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="btn-pill inline-flex items-center justify-center gap-2 border border-black/[0.08] bg-canvas px-6 py-3 text-[14px] font-semibold uppercase tracking-[0.04em] text-text-primary transition-all hover:bg-black/[0.04] active:scale-[0.97]"
            >
              {SecondaryIcon && <SecondaryIcon className="h-4 w-4" />}
              {secondaryAction.label}
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StatusCard;
