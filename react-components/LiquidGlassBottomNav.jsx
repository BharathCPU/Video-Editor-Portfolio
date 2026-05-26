import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import './liquidGlassNav.css';

const defaultItems = [
  {
    id: 'about',
    label: 'About',
    href: '#hero',
    icon: 'about',
  },
  {
    id: 'featured',
    label: 'Featured',
    href: '#featured',
    icon: 'spark',
  },
  {
    id: 'reels',
    label: 'Reels',
    href: '#reels',
    icon: 'play',
    badge: 3,
  },
  {
    id: 'cinema',
    label: 'Cinema',
    href: '#cinematography',
    icon: 'film',
  },
  {
    id: 'contact',
    label: 'Contact',
    href: '#contact',
    icon: 'message',
  },
];

function AboutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0-4-4" />
      <path d="M8 20v-1.5A3.5 3.5 0 0 1 11.5 15h1A3.5 3.5 0 0 1 16 18.5V20" />
      <circle cx="12" cy="8" r="1.5" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 2 1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2Z" />
      <path d="m4 15 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 8.5v7l6-3.5-6-3.5Z" />
      <rect x="3" y="3" width="18" height="18" rx="6" />
    </svg>
  );
}

function FilmIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M4 9h16M4 15h16M9 4v16M15 4v16" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 14a6 6 0 0 1-6 6H9l-6 3 1.8-5.4A6 6 0 0 1 3 14V8a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6Z" />
    </svg>
  );
}

function iconForType(type) {
  switch (type) {
    case 'spark':
      return SparkIcon;
    case 'play':
      return PlayIcon;
    case 'film':
      return FilmIcon;
    case 'message':
      return MessageIcon;
    case 'about':
    default:
      return AboutIcon;
  }
}

export default function LiquidGlassBottomNav({
  items = defaultItems,
  activeId: controlledActiveId,
  defaultActiveId = defaultItems[0]?.id,
  onChange,
  className = '',
  ariaLabel = 'Primary navigation',
}) {
  const prefersReducedMotion = useReducedMotion();
  const shellRef = useRef(null);
  const itemRefs = useRef([]);
  const pointerRafRef = useRef(0);
  const lastPointerRef = useRef({ target: null, x: 0, y: 0, shellX: 0, shellY: 0 });
  const [uncontrolledActiveId, setUncontrolledActiveId] = useState(defaultActiveId);
  const [hoveredId, setHoveredId] = useState(null);

  const activeId = controlledActiveId ?? uncontrolledActiveId;
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const hoveredIndex = Math.max(0, items.findIndex((item) => item.id === hoveredId));
  const focusIndex = hoveredId ? hoveredIndex : activeIndex;

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorXSpring = useSpring(cursorX, { stiffness: 160, damping: 24, mass: 0.25 });
  const cursorYSpring = useSpring(cursorY, { stiffness: 160, damping: 24, mass: 0.25 });

  const syncCapsuleToIndex = (index) => {
    if (!shellRef.current) {
      return;
    }

    const itemNode = itemRefs.current[index];
    if (!itemNode) {
      return;
    }

    const shellRect = shellRef.current.getBoundingClientRect();
    const itemRect = itemNode.getBoundingClientRect();

    shellRef.current.style.setProperty('--capsule-x', `${itemRect.left - shellRect.left - 8}px`);
    shellRef.current.style.setProperty('--capsule-y', `${itemRect.top - shellRect.top - 4}px`);
    shellRef.current.style.setProperty('--capsule-w', `${itemRect.width + 16}px`);
    shellRef.current.style.setProperty('--capsule-h', `${itemRect.height + 8}px`);
  };

  useEffect(() => {
    syncCapsuleToIndex(focusIndex);
  }, [focusIndex, items.length]);

  useEffect(() => {
    const handleResize = () => {
      syncCapsuleToIndex(focusIndex);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [focusIndex]);

  useEffect(() => {
    return () => {
      if (pointerRafRef.current) {
        cancelAnimationFrame(pointerRafRef.current);
      }
    };
  }, []);

  const schedulePointerUpdate = (event) => {
    if (prefersReducedMotion) {
      return;
    }

    const target = event.currentTarget;
    const targetRect = target.getBoundingClientRect();
    const shellRect = shellRef.current?.getBoundingClientRect();

    lastPointerRef.current = {
      target,
      x: event.clientX - targetRect.left,
      y: event.clientY - targetRect.top,
      shellX: shellRect ? event.clientX - shellRect.left : 0,
      shellY: shellRect ? event.clientY - shellRect.top : 0,
    };

    if (pointerRafRef.current) {
      return;
    }

    pointerRafRef.current = requestAnimationFrame(() => {
      const { target: latestTarget, x, y, shellX, shellY } = lastPointerRef.current;

      latestTarget.style.setProperty('--pointer-x', `${x}px`);
      latestTarget.style.setProperty('--pointer-y', `${y}px`);
      cursorX.set(shellX);
      cursorY.set(shellY);

      pointerRafRef.current = 0;
    });
  };

  const handleSelect = (item) => {
    if (controlledActiveId === undefined) {
      setUncontrolledActiveId(item.id);
    }

    if (typeof onChange === 'function') {
      onChange(item);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,44rem)] -translate-x-1/2">
      <motion.nav
        ref={shellRef}
        aria-label={ariaLabel}
        className={`liquid-glass-nav-shell relative w-full ${className}`}
        initial={false}
        animate={prefersReducedMotion ? { y: 0 } : { y: [0, -1.5, 0] }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
      <svg aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <filter id="liquidGlassDistortion" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.012"
            numOctaves="2"
            seed="9"
            stitchTiles="stitch"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              values="0.008 0.012;0.01 0.014;0.008 0.012"
              dur="11s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <motion.div
        className="liquid-glass-ambient absolute inset-0 rounded-full"
        animate={prefersReducedMotion ? { opacity: 0.8 } : { opacity: [0.65, 0.9, 0.65], scale: [1, 1.01, 1] }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ filter: 'url(#liquidGlassDistortion)' }}
      >
        <motion.div
          className="liquid-glass-caustics absolute inset-0 rounded-full"
          animate={prefersReducedMotion ? { opacity: 0.35 } : { x: [0, 18, 0], opacity: [0.3, 0.55, 0.3] }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 14, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute left-0 top-0 z-[1] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.28)_28%,rgba(255,255,255,0)_72%)] liquid-glass-orb"
        style={{ x: cursorXSpring, y: cursorYSpring, translateX: '-50%', translateY: '-50%' }}
        animate={hoveredId ? { opacity: 1 } : { opacity: 0.55 }}
        transition={{ type: 'spring', stiffness: 240, damping: 30 }}
      />

        <div className="liquid-glass-inner relative z-10 flex items-stretch gap-1 p-2 sm:p-2.5">
        {items.map((item, index) => {
          const Icon = iconForType(item.icon);
          const isActive = item.id === activeId;
          const isHovered = item.id === hoveredId;
          const distanceFromFocus = hoveredId ? Math.abs(index - focusIndex) : 0;
          const itemShiftX = hoveredId
            ? (index < focusIndex ? -3 : 3) * Math.max(0, 1 - distanceFromFocus * 0.45)
            : 0;
          const itemShiftY = isHovered ? -5 : hoveredId ? Math.max(0, 2 - distanceFromFocus) * -1 : 0;
          const itemScale = isHovered ? 1.08 : hoveredId ? 0.985 : 1;

          return (
            <motion.a
              key={item.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className="liquid-glass-item group relative flex min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full px-3 py-3 text-white no-underline outline-none sm:px-4"
              onPointerEnter={() => {
                setHoveredId(item.id);
                syncCapsuleToIndex(index);
              }}
              onPointerMove={schedulePointerUpdate}
              onPointerLeave={() => {
                setHoveredId(null);
                syncCapsuleToIndex(activeIndex);
              }}
              onFocus={() => {
                setHoveredId(item.id);
                syncCapsuleToIndex(index);
              }}
              onBlur={() => {
                setHoveredId(null);
                syncCapsuleToIndex(activeIndex);
              }}
              onClick={() => handleSelect(item)}
              animate={{
                scale: itemScale,
                x: itemShiftX,
                y: itemShiftY,
              }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 28, mass: 0.8 }}
            >
              {isHovered || isActive ? (
                <motion.span
                  layoutId="liquid-glass-active-capsule"
                  className="liquid-glass-capsule absolute inset-0 rounded-full"
                  transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32, mass: 0.7 }}
                />
              ) : null}

              <span className="liquid-glass-item-glow absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <span className="relative z-10 flex items-center gap-2">
                <span className="liquid-glass-icon relative h-5 w-5 shrink-0">
                  <Icon />
                </span>
                <span className="liquid-glass-label whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.28em] sm:text-[11px]">
                  {item.label}
                </span>
              </span>

              <AnimatePresence>
                {item.badge ? (
                  <motion.span
                    key={`${item.id}-badge`}
                    className="liquid-glass-badge absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-black"
                    initial={{ scale: 0.7, opacity: 0, y: -4 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.7, opacity: 0, y: -4 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 24 }}
                  >
                    {item.badge}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.a>
          );
        })}
        </div>
      </motion.nav>
    </div>
  );
}

export { defaultItems };
