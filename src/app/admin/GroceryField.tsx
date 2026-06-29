'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Apple,
  Carrot,
  Egg,
  Milk,
  Banana,
  Cherry,
  Grape,
  Wheat,
  Leaf,
  Citrus,
  Fish,
  Salad,
  Soup,
  Cookie,
  Croissant,
  Nut,
  ShoppingBasket,
} from 'lucide-react';

const ACCENT = '#00754A';
const HOUSE = '#1E3932';

type Item = {
  Icon: typeof Apple;
  top: string;
  left: string;
  size: number;
  dur: number;
  delay: number;
  drift: number;
  rot: number;
  op: number;
  color: string;
};

/** Scattered, gently-drifting grocery line-art behind the dashboard. */
const ITEMS: Item[] = [
  { Icon: Carrot, top: '10%', left: '4%', size: 58, dur: 7, delay: 0, drift: 14, rot: 7, op: 0.08, color: ACCENT },
  { Icon: Apple, top: '7%', left: '85%', size: 50, dur: 8, delay: 0.6, drift: 12, rot: 6, op: 0.07, color: HOUSE },
  { Icon: Leaf, top: '24%', left: '38%', size: 42, dur: 6, delay: 1, drift: 10, rot: 9, op: 0.06, color: ACCENT },
  { Icon: Milk, top: '36%', left: '92%', size: 52, dur: 9, delay: 0.3, drift: 16, rot: 5, op: 0.07, color: ACCENT },
  { Icon: Wheat, top: '54%', left: '3%', size: 66, dur: 8, delay: 0.8, drift: 14, rot: 6, op: 0.07, color: HOUSE },
  { Icon: Citrus, top: '60%', left: '72%', size: 46, dur: 7, delay: 1.2, drift: 11, rot: 8, op: 0.08, color: ACCENT },
  { Icon: Egg, top: '72%', left: '28%', size: 40, dur: 6, delay: 0.2, drift: 10, rot: 7, op: 0.06, color: HOUSE },
  { Icon: Banana, top: '80%', left: '88%', size: 56, dur: 9, delay: 0.6, drift: 15, rot: 6, op: 0.07, color: ACCENT },
  { Icon: Grape, top: '86%', left: '10%', size: 48, dur: 7, delay: 1, drift: 12, rot: 8, op: 0.07, color: HOUSE },
  { Icon: Soup, top: '90%', left: '54%', size: 52, dur: 8, delay: 0.4, drift: 13, rot: 5, op: 0.06, color: ACCENT },
  { Icon: ShoppingBasket, top: '44%', left: '52%', size: 62, dur: 10, delay: 1.5, drift: 18, rot: 4, op: 0.05, color: HOUSE },
  { Icon: Cherry, top: '17%', left: '64%', size: 42, dur: 6, delay: 0.9, drift: 10, rot: 9, op: 0.07, color: ACCENT },
  { Icon: Fish, top: '68%', left: '6%', size: 52, dur: 8, delay: 1.3, drift: 13, rot: 6, op: 0.06, color: HOUSE },
  { Icon: Croissant, top: '31%', left: '16%', size: 46, dur: 7, delay: 0.7, drift: 11, rot: 7, op: 0.07, color: ACCENT },
  { Icon: Salad, top: '94%', left: '78%', size: 50, dur: 9, delay: 0.25, drift: 14, rot: 6, op: 0.06, color: HOUSE },
  { Icon: Cookie, top: '50%', left: '30%', size: 38, dur: 6, delay: 1.1, drift: 9, rot: 8, op: 0.06, color: ACCENT },
  { Icon: Nut, top: '14%', left: '24%', size: 40, dur: 7, delay: 1.4, drift: 10, rot: 7, op: 0.06, color: HOUSE },
];

export default function GroceryField() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Brand glows */}
      <div
        className="absolute -right-40 -top-40 h-[620px] w-[620px] rounded-full opacity-[0.18] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #00754A 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-52 left-[20%] h-[520px] w-[520px] rounded-full opacity-[0.12] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #cba258 0%, transparent 70%)' }}
      />

      {/* Drifting groceries */}
      {ITEMS.map((it, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: it.top, left: it.left, color: it.color, opacity: it.op }}
          animate={{ y: [0, -it.drift, 0], rotate: [-it.rot, it.rot, -it.rot] }}
          transition={{
            duration: it.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: it.delay,
          }}
        >
          <it.Icon style={{ width: it.size, height: it.size }} strokeWidth={1.4} />
        </motion.div>
      ))}
    </div>
  );
}
