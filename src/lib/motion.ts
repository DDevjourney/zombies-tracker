import { animate, stagger, createTimeline, utils } from 'animejs'

export { animate, stagger, createTimeline, utils }

/** True when the user asked the OS to reduce motion. All animations bail out. */
export function reducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Fade + slide-up cascade for a list of elements. */
export function cascadeIn(targets: ArrayLike<Element>, step = 60) {
  if (reducedMotion() || targets.length === 0) return
  animate(Array.from(targets), {
    opacity: [0, 1],
    translateY: [16, 0],
    delay: stagger(step),
    duration: 450,
    ease: 'outCubic',
  })
}

/** Horizontal shake, used for errors and new records. */
export function shake(target: Element, strength = 8) {
  if (reducedMotion()) return
  animate(target, {
    translateX: [0, -strength, strength, -strength * 0.6, strength * 0.6, -strength * 0.3, 0],
    duration: 500,
    ease: 'outQuad',
  })
}

/** Scale pulse with a red glow, for a freshly unlocked rank icon. */
export function pulseGlow(target: Element) {
  if (reducedMotion()) return
  animate(target, {
    scale: [1, 1.6, 1],
    filter: [
      'drop-shadow(0 0 0px rgba(207,41,41,0))',
      'drop-shadow(0 0 14px rgba(207,41,41,0.95))',
      'drop-shadow(0 0 0px rgba(207,41,41,0))',
    ],
    duration: 900,
    ease: 'outElastic(1, .6)',
  })
}

/** Counts a number element from 0 to its final value. */
export function countUp(el: HTMLElement, to: number, duration = 900) {
  if (reducedMotion() || !Number.isFinite(to)) {
    el.textContent = String(to)
    return
  }
  const obj = { v: 0 }
  animate(obj, {
    v: to,
    duration,
    ease: 'outExpo',
    modifier: utils.round(0),
    onUpdate: () => {
      el.textContent = String(obj.v)
    },
  })
}
