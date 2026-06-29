'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

/* ────────────────────────────────────────────────
   Formatting helpers
   ──────────────────────────────────────────────── */

/** Format integer cents as USD, e.g. 123456 → "$1,234.56". */
export function cents(n?: number | null): string {
  const v = (n ?? 0) / 100;
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function fmtDate(ms?: number | null): string {
  if (!ms) return '—';
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function fmtDateTime(ms?: number | null): string {
  if (!ms) return '—';
  return new Date(ms).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Animated count-up for hero numbers. Respects reduced motion. */
export function useCountUp(target: number, duration = 900): number {
  const [val, setVal] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const from = ref.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      setVal(next);
      if (t < 1) raf = requestAnimationFrame(tick);
      else ref.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* ────────────────────────────────────────────────
   Status badge
   ──────────────────────────────────────────────── */

const BADGE: Record<string, string> = {
  active: 'bg-lume-accent/12 text-lume-accent ring-lume-accent/20',
  paid: 'bg-lume-accent/12 text-lume-accent ring-lume-accent/20',
  fulfilled: 'bg-lume-accent/12 text-lume-accent ring-lume-accent/20',
  delivered: 'bg-lume-accent/12 text-lume-accent ring-lume-accent/20',
  converted: 'bg-lume-accent/12 text-lume-accent ring-lume-accent/20',
  shipped: 'bg-blue-500/10 text-blue-700 ring-blue-500/20',
  packed: 'bg-blue-500/10 text-blue-700 ring-blue-500/20',
  registered: 'bg-blue-500/10 text-blue-700 ring-blue-500/20',
  locked: 'bg-indigo-500/10 text-indigo-700 ring-indigo-500/20',
  paused: 'bg-gold/15 text-[#8a6a22] ring-gold/30',
  pending: 'bg-gold/15 text-[#8a6a22] ring-gold/30',
  incomplete: 'bg-gold/15 text-[#8a6a22] ring-gold/30',
  sent: 'bg-gold/15 text-[#8a6a22] ring-gold/30',
  past_due: 'bg-copper-600/10 text-copper-600 ring-copper-600/20',
  refunded: 'bg-copper-600/10 text-copper-600 ring-copper-600/20',
  draft: 'bg-black/[0.05] text-text-secondary ring-black/10',
  cancelled: 'bg-black/[0.05] text-text-secondary ring-black/10',
  skipped: 'bg-black/[0.05] text-text-secondary ring-black/10',
  expired: 'bg-black/[0.05] text-text-secondary ring-black/10',
};

export function StatusBadge({ status }: { status?: string | null }) {
  const s = status ?? '—';
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] ring-1 ring-inset ${
        BADGE[s] ?? 'bg-black/[0.05] text-text-secondary ring-black/10'
      }`}
    >
      {s}
    </span>
  );
}

/* ────────────────────────────────────────────────
   Primitives
   ──────────────────────────────────────────────── */

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <Loader2 className={`h-5 w-5 animate-spin text-lume-accent ${className}`} />
  );
}

/** Glassmorphism surface — matches the member dashboard cards. */
export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[20px] border border-[#E9DEC8] bg-gradient-to-b from-[#FDF9F1]/90 to-[#F4ECDB]/85 shadow-soft-float backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

/** Animated card — staggered entrance + gentle hover lift. */
export function MotionCard({
  children,
  className = '',
  delay = 0,
  lift = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  lift?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 0.61, 0.36, 1] }}
      whileHover={lift ? { y: -3 } : undefined}
      className={`rounded-[20px] border border-[#E9DEC8] bg-gradient-to-b from-[#FDF9F1]/90 to-[#F4ECDB]/85 shadow-soft-float backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  actions,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
      className="mb-7 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-lume-accent">
          {eyebrow ?? 'Admin'}
        </div>
        <h1 className="font-display text-[clamp(1.9rem,3vw,2.6rem)] font-normal leading-[1.05] tracking-tight text-text-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-text-secondary">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

type BtnVariant = 'primary' | 'ghost' | 'danger' | 'subtle';
const BTN: Record<BtnVariant, string> = {
  primary:
    'bg-lume-accent text-white shadow-frap hover:bg-lume-green hover:shadow-[0_4px_20px_rgba(0,117,74,0.35)]',
  ghost:
    'border border-[#E6DBC4] bg-[#FCF8EF]/80 text-text-primary backdrop-blur hover:border-lume-accent/40 hover:bg-[#FFFDF8]',
  danger: 'bg-copper-600 text-white hover:brightness-110',
  subtle: 'bg-black/[0.04] text-text-primary hover:bg-black/[0.07]',
};

export function Btn({
  variant = 'ghost',
  className = '',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return (
    <button
      {...props}
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold tracking-tight transition-all duration-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${BTN[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ────────────────────────────────────────────────
   Form fields
   ──────────────────────────────────────────────── */

const fieldBase =
  'w-full rounded-xl border border-[#E6DBC4] bg-[#FCF8EF]/85 px-3.5 py-2.5 text-[14px] text-text-primary outline-none transition-all focus:border-lume-accent focus:ring-4 focus:ring-lume-accent/10';

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
      {children}
    </label>
  );
}

export function TextField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input {...props} className={fieldBase} />
    </div>
  );
}

export function TextArea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <textarea {...props} className={`${fieldBase} min-h-[84px] resize-y`} />
    </div>
  );
}

export function SelectField({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <select {...props} className={fieldBase}>
        {children}
      </select>
    </div>
  );
}

export function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] capitalize text-text-primary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-lume-accent"
      />
      {label}
    </label>
  );
}

/* ────────────────────────────────────────────────
   Modal
   ──────────────────────────────────────────────── */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-lume-house/30 p-4 backdrop-blur-md sm:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
            className={`my-auto w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} overflow-hidden rounded-[24px] border border-white/70 bg-canvas/95 shadow-frap backdrop-blur-xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
              <h2 className="font-display text-[20px] font-normal tracking-tight text-text-primary">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-text-secondary transition-colors hover:bg-black/[0.05] hover:text-text-primary"
                aria-label="Close"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-black/[0.06] bg-[#F4ECDB]/50 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ────────────────────────────────────────────────
   Empty / loading states
   ──────────────────────────────────────────────── */

export function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner className="h-7 w-7" />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center text-[14px] text-text-secondary">
      {message}
    </div>
  );
}

/* ────────────────────────────────────────────────
   Toast system
   ──────────────────────────────────────────────── */

type Toast = { id: number; message: string; type: 'success' | 'error' };
const ToastCtx = createContext<(message: string, type?: Toast['type']) => void>(
  () => {}
);

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[300] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
              className={`pointer-events-auto flex items-center gap-2.5 rounded-2xl px-4 py-3 text-[13px] font-medium text-white shadow-frap ${
                t.type === 'error' ? 'bg-copper-600' : 'bg-lume-accent'
              }`}
            >
              {t.type === 'error' ? (
                <AlertTriangle className="h-4 w-4 shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              )}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/** Run a mutation with toast feedback. Returns a wrapped async fn. */
export function useAction<T extends unknown[]>(
  fn: (...args: T) => Promise<unknown>,
  successMsg: string
) {
  const toast = useToast();
  return useCallback(
    async (...args: T) => {
      try {
        await fn(...args);
        toast(successMsg, 'success');
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Something went wrong', 'error');
      }
    },
    [fn, successMsg, toast]
  );
}

/* ────────────────────────────────────────────────
   Table shell
   ──────────────────────────────────────────────── */

export function Table({
  head,
  children,
}: {
  head: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-black/[0.08] text-left text-[10.5px] font-semibold uppercase tracking-[0.07em] text-text-secondary">
            {head}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.05]">{children}</tbody>
      </table>
    </div>
  );
}

export function Th({
  children,
  className = '',
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <th className={`px-3 py-3 font-semibold ${className}`}>{children}</th>;
}

export function Td({
  children,
  className = '',
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-3 py-3 align-middle text-text-primary ${className}`}>
      {children}
    </td>
  );
}

/** Hover-highlighted table row. */
export function Tr({ children }: { children: React.ReactNode }) {
  return (
    <tr className="transition-colors hover:bg-lume-accent/[0.04]">{children}</tr>
  );
}
