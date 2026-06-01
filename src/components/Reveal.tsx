'use client';

import React, {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

type Props = {
  /** Starting position offset (defaults to sliding up from 24px below). */
  direction?: Direction;
  /** Stagger delay in milliseconds before the reveal starts. */
  delay?: number;
  /** Transition duration in milliseconds. */
  duration?: number;
  /** If true, re-trigger the animation every time the element re-enters view. */
  repeat?: boolean;
  /** Top-margin offset for the IntersectionObserver root; negative values
   *  trigger slightly after the element enters (e.g. `-80px`). */
  rootMargin?: string;
  /** Render as a different tag (e.g. `"h2"`, `"p"`, `"section"`). */
  as?: ElementType;
  /** Visibility threshold between 0 and 1. */
  threshold?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

const OFFSETS: Record<Direction, string> = {
  up: 'translate3d(0, 24px, 0)',
  down: 'translate3d(0, -24px, 0)',
  left: 'translate3d(32px, 0, 0)',
  right: 'translate3d(-32px, 0, 0)',
  none: 'translate3d(0, 0, 0)',
};

/**
 * Lightweight replacement for framer-motion's `whileInView` entry pattern.
 *
 * Renders a wrapping `<Tag>` that starts hidden + offset and transitions to
 * visible + at-rest when it enters the viewport. Uses a single shared
 * `IntersectionObserver` per element, so the memory cost per reveal is a
 * few hundred bytes — framer-motion ships ~55 KB gzipped.
 *
 * Respects `prefers-reduced-motion`: those users see content immediately
 * with no transition.
 */
const Reveal: React.FC<Props> = ({
  direction = 'up',
  delay = 0,
  duration = 700,
  repeat = false,
  rootMargin = '0px 0px -10% 0px',
  as: Tag = 'div',
  threshold = 0,
  className,
  style,
  children,
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Respect user motion prefs — skip the animation entirely.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (!repeat) observer.unobserve(entry.target);
          } else if (repeat) {
            setInView(false);
          }
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [repeat, rootMargin, threshold]);

  const combinedStyle: CSSProperties = {
    opacity: inView ? 1 : 0,
    transform: inView ? OFFSETS.none : OFFSETS[direction],
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    willChange: inView ? 'auto' : 'opacity, transform',
    ...style,
  };

  return (
    <Tag ref={ref as never} className={className} style={combinedStyle}>
      {children}
    </Tag>
  );
};

export default Reveal;
