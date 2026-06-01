import React from 'react';
import Reveal from './Reveal';

const promises = [
  { title: 'Your Box, Your Rules', text: 'Shop what you want or skip — full control, always.' },
  { title: 'Doorstep Delivery', text: 'No lines, no parking, no extra stops.' },
  { title: 'Money-Back Guarantee', text: "If it's not right, we make it right." },
];

const audiences = [
  {
    title: 'Families',
    description: 'Keep weekly essentials moving without turning every restock into a chore.',
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1800&q=90',
  },
  {
    title: 'Gift Givers',
    description: 'Send reliable staples and comfort foods to the people you care about.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed514?auto=format&fit=crop&w=1800&q=90',
  },
  {
    title: 'Busy Professionals',
    description: 'Let your pantry stay handled while your schedule stays full.',
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=1800&q=90',
  },
];

/**
 * CSS-only parallax image wrapper. See `globals.css` for the animation
 * definitions. Non-supporting browsers (Safari/Firefox) render the image
 * statically, which is an acceptable graceful degradation.
 */
const ParallaxImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <div className="parallax-viewport absolute inset-0 overflow-hidden">
    <img
      src={src}
      alt={alt}
      className="parallax-img-y-sm h-[120%] w-full object-cover"
      loading="lazy"
    />
  </div>
);

const WhoItsFor: React.FC = () => {
  return (
    <section className="overflow-hidden">

      {/* ── Quality Guarantee — cinematic split ── */}
      <div className="grid lg:grid-cols-2">
        <div className="relative h-[50vh] min-h-[420px] lg:h-auto">
          <ParallaxImage
            src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1400&q=90"
            alt="Packed grocery box"
          />
        </div>

        <Reveal
          direction="left"
          duration={1000}
          rootMargin="0px 0px -80px 0px"
          className="flex items-center bg-canvas px-10 py-24 lg:px-20 lg:py-32"
        >
          <div className="max-w-lg">
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-lume-accent">Our guarantee</p>
            <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.2rem)] font-normal leading-[1.1] tracking-tight text-text-primary">
              Quality you
              <br />
              can taste.
            </h2>
            <p className="mt-6 text-[16px] leading-[1.8] text-text-secondary">
              {"We're confident in the freshness of every haul. If anything doesn't live up to your standards, we'll make it right — fast."}
            </p>

            <div className="mt-12 space-y-0">
              {promises.map((item, index) => (
                <Reveal
                  key={item.title}
                  direction="none"
                  duration={800}
                  delay={300 + index * 100}
                  className="flex items-start gap-5 border-t border-black/[0.05] py-5"
                >
                  <div className="mt-1 h-4 w-4 shrink-0 rounded-full bg-lume-accent/15 ring-[1.5px] ring-lume-accent/40" />
                  <div>
                    <h4 className="text-[14px] font-semibold tracking-tight text-text-primary">{item.title}</h4>
                    <p className="mt-0.5 text-[13px] text-text-secondary">{item.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* ── Audiences ── */}
      <div className="bg-lume-house px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Reveal as="p" duration={1200} className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/35">
            Who it&apos;s for
          </Reveal>
          <Reveal
            as="h2"
            duration={1000}
            rootMargin="0px 0px -60px 0px"
            className="mt-6 max-w-3xl font-display text-[clamp(2.4rem,5vw,4.2rem)] font-normal leading-[1.08] text-white"
          >
            Built for real
            <br />
            grocery habits.
          </Reveal>
        </div>
      </div>

      {audiences.map((item, index) => (
        <ImmersivePanel key={item.title} item={item} index={index} />
      ))}
    </section>
  );
};

/**
 * Full-bleed scroll-driven panel — image zooms and text fades in as the
 * section scrolls through the viewport. All JS-free via CSS scroll
 * timelines + IntersectionObserver for the content reveal.
 */
const ImmersivePanel: React.FC<{ item: typeof audiences[0]; index: number }> = ({ item, index }) => (
  <div className="parallax-viewport relative flex h-[80vh] min-h-[500px] items-end overflow-hidden lg:h-[90vh]">
    <img
      src={item.image}
      alt={item.title}
      className="parallax-zoom-in absolute inset-0 h-full w-full object-cover"
      loading="lazy"
    />

    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

    <Reveal
      direction="up"
      duration={900}
      rootMargin="0px 0px -20% 0px"
      className="relative z-10 w-full px-8 pb-16 lg:px-20 lg:pb-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-8">
          <div>
            <span className="font-display text-[14px] italic text-white/30">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-2 font-display text-[clamp(2.2rem,5vw,4rem)] font-normal leading-[1.05] tracking-tight text-white">
              {item.title}
            </h3>
            <p className="mt-4 max-w-md text-[16px] leading-[1.7] text-white/65">
              {item.description}
            </p>
          </div>
          <div className="hidden h-16 w-px bg-white/20 lg:block" />
        </div>
      </div>
    </Reveal>
  </div>
);

export default WhoItsFor;
