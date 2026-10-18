import type { TargetAndTransition, Transition, Variants } from 'motion/react';

// Shared Motion presets — "cool but subtle". Springs only, transform/opacity
// only, so animation can never shift layout logic or the money-math UI text.

/** Entrance spring for items rising into place. */
export const riseSpring: Transition = { type: 'spring', bounce: 0.3, duration: 0.6 };

/** Snappy spring for hover lift / tap press feedback. */
export const pressSpring: Transition = { type: 'spring', stiffness: 500, damping: 30 };

/** Softer spring for exit collapses (deleted rows, closing panels). */
export const exitSpring: Transition = { type: 'spring', bounce: 0.2, duration: 0.45 };

/** Container variants: stagger children on mount / filter change. */
export const staggerList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};

/** Item variants: rise 16px + fade, timed by the parent's stagger. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: riseSpring },
};

/** Rise-only variants for rows that set their own style opacity. */
export const riseInY: Variants = {
  hidden: { y: 16 },
  show: { y: 0, transition: riseSpring },
};

/** Exit for removable rows: fade + height collapse so siblings slide up. */
export const collapseOut: TargetAndTransition = {
  opacity: 0,
  height: 0,
  marginBottom: 0,
  transition: exitSpring,
};

/** Hover lift / tap press for cards and buttons. */
export const hoverLift = { y: -3 };
export const tapPress = { scale: 0.96 };
export const tapPressSmall = { scale: 0.92 };

/** Collapsing panel (height 0 -> auto) for inline add/create forms. */
export const panelIn: TargetAndTransition = { height: 'auto', opacity: 1, transition: riseSpring };
export const panelOut: TargetAndTransition = { height: 0, opacity: 0, transition: exitSpring };
