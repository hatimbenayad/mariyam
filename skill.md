# Skill: Cinematic Scroll-Heavy Marketing / Portfolio Site

**Description:** This skill teaches an AI how to build a high-end, cinematic, scroll-driven marketing or portfolio site from scratch using the exact patterns found in a real Awwwards "Site of the Month" clone. The result will feature sticky video backgrounds, scroll-linked parallax and rotations, a custom spring-physics cursor, a per-section nav theme switcher, flickering text effects, and a premium dark-studio aesthetic — all built with Next.js 15 App Router, Tailwind CSS 4 (using the new `@theme` engine), and Framer Motion (`motion/react`).

---

## 1. Tech Stack to Install

```bash
# 1. Scaffold a Next.js 15 project
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir=false \
  --import-alias "@/*" \
  --no-eslint

# 2. Install runtime dependencies
npm install lenis motion clsx tailwind-merge
```

**Exact versions found in this project:**

| Package | Version |
|---|---|
| `next` | 15.3.8 |
| `react` / `react-dom` | ^19.0.0 |
| `motion` | ^12.12.1 (Framer Motion v12, imported as `motion/react`) |
| `lenis` | ^1.3.3 |
| `clsx` | ^2.1.1 |
| `tailwind-merge` | ^3.3.0 |
| `tailwindcss` | ^4 |
| `@tailwindcss/postcss` | ^4 |
| `prettier-plugin-tailwindcss` | ^0.6.11 |

The dev script uses `--turbo` flag: `"dev": "next dev --turbo"`.

---

## 2. Config Files

### `postcss.config.mjs`
Tailwind 4 uses a PostCSS plugin only — no tailwind.config.js:
```js
const config = { plugins: ["@tailwindcss/postcss"] };
export default config;
```

### `next.config.ts`
Minimal — no special config needed for this stack:
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
```

### `tsconfig.json` key settings
- `"target": "ES2017"`, `"moduleResolution": "bundler"`, `"jsx": "preserve"`
- Path alias: `"@/*": ["./*"]` (maps to project root, not `src/`)

### ESLint (`eslint.config.mjs`)
Uses ESLint flat config format extending `next/core-web-vitals` and `next/typescript` via `@eslint/eslintrc`'s `FlatCompat`.

---

## 3. Recommended Folder Structure

```
app/
  fonts/           # Local .woff font files
  providers/
    root/          # React Context providers (NavTheme, WindowSize)
      index.tsx    # Composes all providers into a single <RootProviders>
  globals.css      # @theme design tokens + Tailwind import
  layout.tsx       # Root layout: ReactLenis + RootProviders + NavBar
  page.tsx         # Home page: composes top-level sections
  [slug]/
    page.tsx       # Catch-all for nav links not yet built

components/
  Client/          # Requires "use client": interactive, animation-heavy
  Server/          # No directive: static markup, uses motion/react-client
  SVGs/            # Inline SVG icon components
    brands/        # Brand logo SVGs
  NavBar.tsx       # Fixed nav with theme-aware color switching
  ...              # Other shared interactive components

sections/          # Page-level compositions (Hero, Group, TheStudio, News...)
hooks/             # Custom React hooks
utils/             # cn() class helper, lenis re-export

public/
  assets/
    images/        # WEBP/PNG assets (organised by section)
    videos/        # MP4 video assets
```

**Architecture rule:** Sections are full-page compositions that import from `components/`. Components in `Server/` can be used in RSC contexts (no "use client"). Components in `Client/` are interactive and require "use client". This split enables RSC streaming for static content while keeping animations isolated.

---

## 4. Global CSS and Design Tokens (`app/globals.css`)

Tailwind 4 replaces `tailwind.config.js` with a CSS-native `@theme {}` block. Everything defined here is automatically available as Tailwind utility classes.

```css
@import "tailwindcss";

@theme {
  --color-void-black: #0b0b0b;
  --color-off-white:  #f8f8f8;
  --color-flare-red:  #ff391e;
  --color-cool-gray:  #dddee2;

  --font-weight-regular-plus: 440;
}

@layer components {
  body {
    font-family: var(--font-denim), sans-serif;
    background-color: var(--color-cool-gray);
  }
  /* Hide native scrollbar — Lenis + custom ScrollBar replaces it */
  ::-webkit-scrollbar { display: none; width: 0; }
}

@layer utilities {
  /* Prepends a light "/" separator before an element via CSS pseudo */
  .slash-before {
    @apply before:font-light before:content-['/\00A0'];
  }
}
```

The colors map directly to Tailwind utilities: `bg-void-black`, `text-flare-red`, `selection:bg-flare-red selection:text-off-white`, etc.

---

## 5. Root Layout (`app/layout.tsx`)

Three global layers, in this order:

1. **Lenis smooth scroll** — wrap the entire `<html>` with `<ReactLenis root>`
2. **Context providers** — wrap `<body>` with `<RootProviders>` (WindowSize + NavTheme)
3. **NavBar** — rendered inside `<body>`, before `{children}`, so it is always on top

```tsx
import { ReactLenis } from "lenis/react";
import localFont from "next/font/local";

const DenimVF = localFont({
  src: "./fonts/DenimVF.woff",
  variable: "--font-denim",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ReactLenis root>
        <RootProviders>
          <body className={`${DenimVF.variable} overflow-x-clip antialiased
            [text-rendering:optimizeLegibility]
            selection:bg-flare-red selection:text-off-white`}>
            <NavBar />
            {children}
          </body>
        </RootProviders>
      </ReactLenis>
    </html>
  );
}
```

**Gotcha:** `<ReactLenis root>` must wrap `<html>`, not just `<body>`, so Lenis can intercept the document scroll event correctly.

---

## 6. Global Providers

### WindowSizeProvider
Tracks whether `window.innerWidth >= 1024` (the single desktop breakpoint). Initialise state as `null` to prevent hydration mismatches — the value is only set after the first client-side render:

```tsx
"use client";
const [isMobile, setIsMobile] = useState<boolean | null>(null);
useEffect(() => {
  const handle = () => setIsMobile(window.innerWidth >= 1024);
  handle();
  window.addEventListener("resize", handle);
  return () => window.removeEventListener("resize", handle);
}, []);
```

The exported hook `useIsDesktop()` returns `boolean | null`. Always guard: `typeof isDesktop == "boolean" && isDesktop ? <Desktop /> : <Mobile />`. Using just `if (isDesktop)` will suppress desktop content during the null phase.

### NavThemeProvider
Simple string context: `"light" | "dark"` with a setter. The NavBar reads this to decide its text/icon color. Sections write to it via IntersectionObserver as they enter/exit the viewport.

---

## 7. Smooth Scroll (Lenis)

```ts
// utils/lenis.ts — thin re-export so client components can import cleanly
"use client";
export * from "lenis/react";
```

Lenis is initialised at the root. Framer Motion's `useScroll()` reads from `window.scrollY`, which Lenis patches automatically — no extra wiring needed.

No custom Lenis configuration (easing, lerp, duration) was used in this project. The default spring is sufficient.

---

## 8. Responsive Strategy

The project uses a two-tier system:
- **Mobile:** fixed `px` values
- **Desktop (>=1024px):** fluid `vw` values derived from a 1080px reference width

Formula: `desired_px / 1080 * 100 = vw_value`

Examples from the code:
- `text-[72px] lg:text-[12.15278vw]` (section headers)
- `text-[34px] lg:text-[5.55556vw]` (project card titles)
- `px-2 lg:px-[0.46296vw]` (standard container padding)
- `gap-[5vh] lg:gap-[15vh]` (section spacing)

The only hard breakpoints used are `lg` (1024px) and occasionally `md` (768px). No `sm`, `xl`, or `2xl`.

---

## 9. Animation Patterns

### Pattern 1: Scroll-Linked Transform (`useScroll` + `useTransform`)

The fundamental pattern. Pass a `ref` to `useScroll` with an `offset` that defines the animation window. `useTransform` maps 0-to-1 scroll progress to CSS values.

```tsx
const ref = useRef<HTMLDivElement>(null);
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start start", "end start"],
  // Other offsets used in this project:
  // ["50vh end", "100vh end"]  — fires as element rises from below
  // ["start end", "0.8 end"]   — fires when element is 80% up screen
  // ["1 1", "1 0"]             — fires as page bottom scrolls up
});
const y = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
const rotate = useTransform(scrollYProgress, [0, 1], ["0deg", "-15deg"]);
// <motion.div style={{ y, rotate }} />
```

Multi-keyframe version used in ProjectCard:
```tsx
const y = useTransform(
  scrollYProgress,
  [0, 0.5, 0.6, 1],
  ["55vh", "0vh", "10vh", "-30vh"],
  { ease: cubicBezier(0, 0, 0, 0) }
);
```

### Pattern 2: The Universal Easing Curve

`cubicBezier(0.19, 1, 0.22, 1)` — a strongly decelerated ease-out with a very fast start and a long smooth tail. Used for virtually every animation in the project. Standard pairing: `duration: 0.8`.

```tsx
import { cubicBezier } from "motion/react";
transition={{ duration: 0.8, ease: cubicBezier(0.19, 1, 0.22, 1) }}
```

The raw array `[0.19, 1, 0.22, 1]` is also used directly in `transition.ease` in several places. A secondary ease `(0.14, 1, 0.34, 1)` appears only in the SideBar slide-in.

### Pattern 3: Sticky Video Background with Scrolling Cards

Structure in `Group.tsx`:
- Outer container: `relative max-w-screen overflow-x-clip lg:mb-[25vh]`
- Inside: `sticky top-0 z-10 pb-[100vh]` wrapper holding a full-screen video
- Below (sibling): client component with hero + scrolling cards on top

The `pb-[100vh]` keeps the video visible for one extra viewport height of scroll after its natural exit, creating the "pinned" feel. Cards use higher z-index and overlay the video as they scroll up.

### Pattern 4: Rotated/Shifted Card Fly-In

A section starts off-screen at a slight rotation and translation. It animates to `x: 0`, `y: 0`, `rotate: 0` as the user scrolls it into view. `transform-origin` is critical — use `origin-bottom-left` or `origin-[0%_50%]` for natural rotation pivots.

```tsx
// Trigger while element approaches from below
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["50vh end", "100vh end"],
});
const y = useTransform(scrollYProgress, [0, 1], ["50vh", "0vh"]);
const rotate = useTransform(scrollYProgress, [0, 0.3], ["7deg", "0deg"]);
const x = useTransform(scrollYProgress, [0, 0.3], ["-10%", "0%"]);
// <motion.div style={{ x, y, rotate }} className="origin-[0%_50%]">
```

### Pattern 5: Spring-Physics Custom Cursor

Two parts: a `useCursor` hook and a `CursorPlane` overlay component.

`useCursor` creates spring-animated MotionValues for position:
```ts
const SPRING_CONFIG = { mass: 1, damping: 38, stiffness: 260 };
const top = useSpring(0, SPRING_CONFIG);
const left = useSpring(0, SPRING_CONFIG);
```

On first entry, the cursor **jumps** to the mouse position via `motionValue.jump()`, then tracks smoothly with `.set()` on every move. The jump-then-spring approach prevents the visible lag-tail that appears when you smoothly spring from the default (0, 0) starting position.

`CursorPlane` is an invisible absolute-inset overlay over a hovered zone. It renders a fixed-position `motion.div` with a contextual text label. Only shown on desktop.

### Pattern 6: HoverReveal — Flicker Text Swap

Swaps between two content states on hover using `AnimatePresence mode="wait"`. The exit animation uses a flicker keyframe sequence to create a digital/CRT effect:

```tsx
exit={{
  opacity: [0, 0, 1, 1, 0, 0],
  transition: {
    duration: 0.3,
    times: [0, 0.1, 0.1, 0.2, 0.2, 0.3].map((t) => t / 0.3),
  },
}}
// Enter is instant (duration: 0)
```

### Pattern 7: BlinkText — Fast Hover Blink

Makes text briefly flicker on hover (CRT effect):
```tsx
whileHover: {
  opacity: [0, 0, 1],
  transition: { duration: 0.125, times: [0, 0.1, 0.1].map(t => t / 0.1) }
}
```

Can `repeat` N times (default 0; footer uses `repeat={1}`).

### Pattern 8: FlickerText — Per-Character Staggered Flicker Headline

Used for large CTA text. Each character is wrapped in its own `motion.span`. An opacity keyframe sequence uses a mathematical time-unit constant (`x = 0.08`) to stagger each character by `x/2` seconds. On hover, characters animate in sequence; on exit, they flicker back out.

Simultaneously, the entire text block shifts horizontally by a responsive CSS variable amount (`--cta-x: 58px` mobile / `12.70602vw` desktop). An underline below shrinks from full-width to zero as the text moves.

### Pattern 9: UnderlineOnHover — Animated Underline

Draws an underline from right to left on enter, removes it from right to left on exit. The key trick is swapping between `left`/`right` anchor properties at `duration: 0` to avoid the bar jumping across the element:

```tsx
variants={{
  initial:    { width: "0%",    right: "0px", left: "auto" },
  whileHover: { width: "100%",  left: "0px",  right: "auto" },
}}
transition={{
  left:    { duration: 0 },  // instant anchor swap
  right:   { duration: 0 },
  default: { ease: [0.19, 1, 0.22, 1], duration: 0.8 },
}}
```

### Pattern 10: IntersectionObserver-Driven Nav Theme Switching

An invisible sentinel `<div>` placed at the top of a section uses `useIntersectionObserver` with `threshold: 1`. When it fully enters/exits the viewport, it calls `setNavTheme("light" | "dark")`.

Direction detection: `if (isIntersecting) { setThemeFrom } else if (!isIntersecting && top < 0) { setThemeTo }`. The `top < 0` guard ensures the theme only changes to the "after scroll" state, not when the user scrolls back up through.

The NavBar responds: `<motion.div animate={navTheme} variants={{ light: { color: "#f8f8f8" }, dark: { color: "#0b0b0b" } }}>`. Framer Motion's default spring animates the color change.

### Pattern 11: AnimatePresence with layoutId for Accordions

The mobile footer accordion uses `layoutId` on both the trigger button and the collapsible content. Framer Motion's FLIP algorithm automatically animates the position/size change between open and closed states:

```tsx
<motion.div layoutId={`item[${index}]`}>
  <motion.button layoutId={`button[${index}]`}>...</motion.button>
  <AnimatePresence mode="popLayout">
    {activeIndex === index && (
      <motion.div layoutId={`description[${index}]`}>...</motion.div>
    )}
  </AnimatePresence>
</motion.div>
```

### Pattern 12: whileTap Feedback

The showreel overlay uses `whileTap="scaleDown"` on the outer container and `variants={{ scaleDown: { scale: 0.95 } }}` on inner elements to create a physical press-down feel with a slight delay (0.3s) before the scale kicks in.

### Pattern 13: Mobile Sidebar Folding Card Entrance

Two nested `motion.div` elements start at rotated offsets and animate to zero:
- Outer: `initial={{ x: "20%", y: "-110%", rotate: "8deg" }}`
- Inner: `initial={{ x: "30%", y: "-80%", rotate: "14deg" }}` with `delay: 0.1`

Easing: `cubicBezier(0.14, 1, 0.34, 1)`, `duration: 0.8`. The layered, slightly delayed animation creates a "folding card" reveal that feels physical and premium.

### Pattern 14: Staggered Children on Hover

Parent sets `staggerChildren` in its `whileHover` variant. Children inherit and animate in sequence:

```tsx
<motion.div
  initial="initial"
  whileHover="whileHover"
  variants={{ whileHover: { transition: { staggerChildren: 0.1 } } }}
>
  {lines.map(line => (
    <motion.p
      variants={{
        initial: { opacity: 0, y: "0%" },
        whileHover: { opacity: 1, y: ["100%", "0%"] },
      }}
      transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
    />
  ))}
</motion.div>
```

Used in `News.NewsListItem` for staggered text line reveals, and in `FooterDesktop` for address line underlines.

### Pattern 15: Custom Draggable ScrollBar

`ScrollBar.tsx` replaces the native scrollbar using Framer Motion's `drag="y"` with `dragConstraints` bound to a full-height fixed container. Bi-directional sync:
- Scroll events set a `scrollY` MotionValue → `useTransform` maps it to thumb `y` position
- Dragging the thumb → `useMotionValueEvent` calls `window.scrollTo()`

Loaded via `next/dynamic` with `ssr: false` because it accesses `window` and `document` at module scope.

### Pattern 16: MotionValue for Cross-Component State Without Re-renders

`backgroundColor` in `GroupClient.tsx` is a `useMotionValue("transparent")` passed as a prop. `HighlightCard` calls `backgroundColor.set(value)` imperatively when its in-view state changes. The outer container has `style={{ backgroundColor }}`. No React state changes — updates happen outside the React render cycle, maintaining 60fps.

---

## 10. Motion Import Patterns (Framer Motion v12)

```tsx
// Standard client components:
import { motion, useScroll, useTransform, AnimatePresence, cubicBezier } from "motion/react";

// Server components (RSC) — no "use client" required:
import * as motion from "motion/react-client";
```

Use `motion/react-client` in Server components that need Framer Motion animations. It strips out server-incompatible APIs.

Also: `import { cubicBezier } from "motion"` (base package, not `motion/react`) works equivalently for the easing function — both appear in the codebase.

---

## 11. Utility: `cn()`

```ts
// utils/cn.ts
import { twMerge } from "tailwind-merge";
import clsx, { ClassValue } from "clsx";
export const cn = (...args: ClassValue[]) => twMerge(clsx(args));
```

Use everywhere instead of template literals. Handles conflicting Tailwind classes correctly (last value wins).

---

## 12. Font Loading

```tsx
// app/layout.tsx
import localFont from "next/font/local";
const DenimVF = localFont({
  src: "./fonts/DenimVF.woff",
  variable: "--font-denim",
});
// Apply to body:
// className={`${DenimVF.variable} ...`}
// Then in globals.css:
// font-family: var(--font-denim), sans-serif;
```

This project uses a single variable font covering all weights. Weights are set with arbitrary Tailwind values: `font-[440]`, `font-[470]`, `font-[300]`. The custom `--font-weight-regular-plus: 440` in `@theme` enables the `font-regular-plus` utility class.

---

## 13. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Section file | PascalCase, no suffix | `TheStudio.tsx`, `Group.tsx` |
| Interactive sibling | PascalCase + "Client" | `GroupClient.tsx` |
| Server components | `components/Server/` dir | `Server/BlinkText.tsx` |
| Client components | `components/Client/` dir | `Client/Button.tsx` |
| Custom hooks | `use` prefix, camelCase | `useScrollAnimations.ts` |
| SVG icons | PascalCase noun | `Arrow.tsx`, `Play.tsx` |
| Brand SVGs | `components/SVGs/brands/` | `RiotGames.tsx` |
| Accordion | "Accordian" (not "Accordion") | `AccordianItem.tsx` |

---

## 14. Best Practices and Gotchas

1. **Hydration guard for viewport-dependent components.** `WindowSizeProvider` initialises `isMobile` as `null`. Always check `typeof isDesktop == "boolean"` before rendering desktop/mobile variants. `null` is falsy and `if (isDesktop)` will incorrectly suppress desktop content on first render.

2. **`useIntersectionObserver` has no dependency array.** It re-runs the effect on every render (intentional — keeps the observer fresh). Avoid using it inside frequently re-rendering components without memoisation.

3. **`useIsInitialRender` is synchronous.** Returns `true` synchronously on the first render, `false` on all subsequent ones. Use it to skip "entrance" animations that would look wrong when the page loads with content already visible.

4. **`next/dynamic` with `ssr: false` for components that access `window` at module scope.** `ScrollBar` reads `window.innerWidth` and `document.documentElement` outside any effect. Wrap it: `const ScrollBar = dynamic(() => import("@/components/ScrollBar"), { ssr: false })`.

5. **vw formula.** Desktop fluid units: `px / 1080 * 100 = vw`. Used for fonts, spacing, and even animation offsets (`--cta-x: 12.70602vw`).

6. **`mix-blend-mode: multiply` for colour overlays.** The hero and showreel use `bg-[#ff0000] [mix-blend-mode:multiply]`. On dark backgrounds this renders as a rich red; on light it tints. Use Tailwind's arbitrary property syntax `[mix-blend-mode:multiply]`.

7. **`overflow-x-clip` instead of `overflow-x-hidden`.** `overflow-clip` does not create a new scroll container, so Lenis scroll propagation is not blocked. Use this on containers where you need to clip overflowing rotated elements without breaking smooth scroll.

8. **SVG components accept motion props.** The `Arrow` SVG component forwards `variants` and `transition` to its internal `motion.svg`. This allows callers to animate arrows in sync with the parent's variant state without callbacks.

9. **CSS custom properties for responsive animation values.** When a JS animation references a value that needs to be responsive (e.g., `x: "var(--cta-x)"`), inject a `<style>` tag inside the component with media-queried CSS variable declarations. This keeps JS clean while remaining fully responsive.

10. **Footer is `sticky bottom-0 z-0`.** The sections above have higher z-index and scroll over the footer. The footer only becomes fully visible when those sections have scrolled out of the way. This creates a "reveal" effect at the bottom of the page.

