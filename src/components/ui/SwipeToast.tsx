'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const FLICK = 0.11;
const DEAD_ZONE = 3;
const RESIST_PX = 24;
const BURN = [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }];
const rubberband = (over: number, dim: number, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));
const velocityOf = (hist: Array<[number, number]>) => hist.length < 2 ? 0 : (hist[hist.length - 1][1] - hist[0][1]) / Math.max(1, hist[hist.length - 1][0] - hist[0][0]);

type Props = { title?: string; description?: string; icon?: React.ReactNode; open?: boolean; onClose?: (reason: string) => void; background?: string; color?: string; fuseColor?: string; width?: number; radius?: number; duration?: number; dismissible?: boolean };

export default function SwipeToast({ title = 'Wallet connected', description = '', icon, open = true, onClose, background = '#27272a', color = '#f5f5f5', fuseColor = '#f5a524', width = 356, radius = 12, duration = 4000, dismissible = true }: Props) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<'open' | 'closing' | 'gone'>('open');
  const cardRef = useRef<HTMLDivElement>(null);
  const fuseRef = useRef<HTMLElement>(null);
  const anim = useRef<Animation | null>(null);
  const drag = useRef<{ id: number; startY: number; moved: boolean; hist: Array<[number, number]> } | null>(null);
  const y = useMotionValue(0);
  const fade = useMotionValue(1);
  const transform = useTransform(y, v => `translateY(${v}px)`);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const close = (reason: string) => {
    if (phaseRef.current !== 'open') return;
    anim.current?.pause();
    setPhase('closing');
    window.setTimeout(() => { setPhase('gone'); onClose?.(reason); }, 300);
  };

  useEffect(() => {
    if (open && phaseRef.current === 'gone') { y.set(0); fade.set(1); setPhase('open'); }
    if (!open && phaseRef.current === 'open') close('programmatic');
  }, [open]);

  useEffect(() => {
    if (phase !== 'open' || duration <= 0 || !fuseRef.current) return;
    const a = fuseRef.current.animate(BURN, { duration, easing: 'linear', fill: 'forwards' });
    a.onfinish = () => close('timeout');
    anim.current = a;
    return () => { a.onfinish = null; a.cancel(); };
  }, [phase, duration]);

  useEffect(() => () => anim.current?.cancel(), []);
  if (phase === 'gone') return null;

  const swipeOut = (dy: number, velocity: number) => {
    anim.current?.pause();
    if (!reduce && cardRef.current) animate(y, dy + cardRef.current.offsetHeight, { type: 'spring', duration: 0.3, bounce: 0, velocity: velocity * 1000 });
    animate(fade, 0, { duration: 0.2, ease: EASE_OUT }).then(() => { setPhase('gone'); onClose?.('swipe'); });
  };

  return <div className="fixed right-8 bottom-8 z-[999999999] max-w-[calc(100vw-32px)]" style={{ width: `min(${width}px, calc(100vw - 32px))` }}>
    <motion.div ref={cardRef} className="relative flex cursor-grab touch-none items-center gap-2 overflow-hidden p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.1)] select-none" style={{ background, color, borderRadius: radius, transform, opacity: fade }} role="status" aria-live="polite"
      onPointerDown={e => { if (e.button !== 0 || !dismissible) return; drag.current = { id: e.pointerId, startY: e.clientY, moved: false, hist: [[performance.now(), y.get()]] }; cardRef.current?.setPointerCapture(e.pointerId); }}
      onPointerMove={e => { const d = drag.current; if (!d || d.id !== e.pointerId) return; if (Math.abs(e.clientY - d.startY) < DEAD_ZONE) return; const next = rubberband(e.clientY - d.startY, RESIST_PX); y.set(next); d.moved = true; d.hist.push([performance.now(), next]); if (d.hist.length > 4) d.hist.shift(); }}
      onPointerUp={e => { const d = drag.current; if (!d || d.id !== e.pointerId) return; drag.current = null; const dy = y.get(); const velocity = velocityOf(d.hist); if (dy > 0 && (velocity > FLICK || (dy >= 40 && velocity >= 0))) swipeOut(dy, velocity); else if (d.moved) animate(y, 0, reduce ? { duration: 0.2, ease: EASE_OUT } : { type: 'spring', duration: 0.5, bounce: 0.2, velocity: velocity * 1000 }); }}
      onPointerCancel={() => { drag.current = null; animate(y, 0, { duration: 0.2 }); }}
    >
      {icon && <span className="inline-flex h-[18px] w-[18px] flex-none">{icon}</span>}
      <span className="flex min-w-0 flex-auto flex-col gap-px"><span className="font-medium">{title}</span>{description && <span className="opacity-70">{description}</span>}</span>
      <button type="button" className="grid h-6 w-6 flex-none place-items-center rounded-[5px] border-0 bg-transparent text-inherit" aria-label="Close" onClick={() => close('close')}><HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2.5} /></button>
      <i ref={fuseRef} className="pointer-events-none absolute right-0 bottom-0 left-0 h-0.5 origin-left" style={{ background: fuseColor }} aria-hidden="true" />
    </motion.div>
  </div>;
}
