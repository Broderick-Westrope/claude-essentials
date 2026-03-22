---
name: design
description: Enforces precise, minimal design for dashboards and admin interfaces. Use when building SaaS UIs, data-heavy interfaces, or any product needing Jony Ive-level craft.
---

# Design Principles

**Core philosophy:** Every interface should look designed by a team that obsesses over 1-pixel differences. Not stripped, _crafted_. And designed for its specific context.

## Design Direction (REQUIRED)

**Before writing code, commit to a direction.** Don't default. Think about what this specific product needs to feel like.

### Think About Context

- **What does this product do?** A finance tool needs different energy than a creative tool.
- **Who uses it?** Power users want density. Occasional users want guidance.
- **What's the emotional job?** Trust? Efficiency? Delight? Focus?
- **What would make this memorable?** Every product has a chance to feel distinctive.

### Choose a Personality

| Direction | Feel | When to Use |
|-----------|------|-------------|
| Precision & Density | Tight spacing, monochrome, info-forward | Power users who live in the tool. Linear, Raycast, terminal aesthetics. |
| Warmth & Approachability | Generous spacing, soft shadows, friendly | Products that want to feel human. Notion, Coda, collaborative tools. |
| Sophistication & Trust | Cool tones, layered depth, gravitas | Products handling money or sensitive data. Stripe, Mercury. |
| Boldness & Clarity | High contrast, dramatic negative space | Modern, decisive products. Vercel, minimal dashboards. |
| Utility & Function | Muted palette, functional density | Work matters more than chrome. GitHub, developer tools. |
| Data & Analysis | Chart-optimized, technical but accessible | Analytics, metrics, business intelligence. |

Pick one. Or blend two. But commit to a direction that fits the product.

### Choose Foundation

**Color foundation** (don't default to warm):
- Warm (creams, warm grays): approachable, comfortable, human
- Cool (slate, blue-gray): professional, trustworthy, serious
- Pure neutrals (true grays): minimal, bold, technical
- Tinted (slight color cast): distinctive, memorable, branded

**Light or dark?** Dark feels technical, focused, premium. Light feels open, approachable, clean. Choose based on context.

**Accent color:** ONE that means something. Blue = trust. Green = growth. Orange = energy. Violet = creativity.

### Choose Layout

- **Dense grids** for information-heavy interfaces where users scan and compare
- **Generous spacing** for focused tasks where users need to concentrate
- **Sidebar nav** for multi-section apps with many destinations
- **Top nav** for simpler tools with fewer sections

### Choose Typography

- **System fonts**: fast, native, invisible (utility-focused products)
- **Geometric sans** (Geist, Inter): modern, clean, technical
- **Humanist sans** (SF Pro, Satoshi): warmer, more approachable
- **Monospace influence**: technical, developer-focused, data-heavy

## Core Craft (Non-Negotiable)

### The 4px Grid

All spacing uses 4px base: `4px` (micro), `8px` (tight), `12px` (standard), `16px` (comfortable), `24px` (generous), `32px` (major).

### Symmetrical Padding

TLBR must match. If top is 16px, all sides are 16px. Exception: when content naturally creates visual balance.

### Border Radius

Stick to 4px grid. Pick a system and commit:
- Sharp: 4px, 6px, 8px
- Soft: 8px, 12px
- Minimal: 2px, 4px, 6px

### Depth Strategy

**Match depth to design direction.** Different products need different approaches:

- **Borders-only (flat)**: Clean, technical. Linear, Raycast use almost no shadows.
- **Subtle single shadow**: Soft lift without complexity.
- **Layered shadows**: Rich, premium, dimensional. Stripe, Mercury.
- **Surface color shifts**: Background tints establish hierarchy without shadows.

**The craft is in the choice, not the complexity.** A flat interface with perfect spacing is more polished than shadow-heavy with sloppy details.

### Typography Hierarchy

- Headlines: 600 weight, -0.02em tracking
- Body: 400-500 weight
- Labels: 500 weight, positive tracking for uppercase
- Scale: 11px, 12px, 13px, 14px (base), 16px, 18px, 24px, 32px

Use **monospace** for numbers, IDs, codes, timestamps. Use `tabular-nums` for columns.

**Font pairing:** Display font for headlines (one statement font) + neutral body font. Don't mix two display fonts.

### Color for Meaning Only

Gray builds structure. Color only appears when it communicates: status, action, error, success. Four-level contrast hierarchy: foreground → secondary → muted → faint.

## Card Layouts

**Internal layouts should vary by content.** A metric card doesn't have to look like a plan card doesn't have to look like a settings card. One might have a sparkline, another an avatar stack, another a progress ring.

**Surface treatment stays consistent:** same border weight, shadow depth, corner radius, padding scale.

## Isolated Controls

**Never use native form elements for styled UI.** Native `<select>`, `<input type="date">` render OS-native elements that cannot be styled. Build custom components.

Custom select triggers: `display: inline-flex` with `white-space: nowrap` to keep text and icons on same row.

## Navigation Context

Screens need grounding:
- Navigation (sidebar or top)
- Location indicator (breadcrumbs, active state)
- User context (who's logged in)

When building sidebars, consider using same background as main content. Linear, Vercel use subtle border for separation rather than different backgrounds.

## Dark Mode

- **Borders over shadows**: Shadows less visible on dark backgrounds
- **Adjust semantic colors**: Desaturate for dark backgrounds
- **Same hierarchy, inverted values**

## Motion & Animation

**Motion is communication, not decoration.** Every animation should have a reason.

- **Timing:** 150-200ms for micro-interactions, 300-400ms for larger transitions
- **Easing:** `ease-out` for entrances, `ease-in` for exits, `ease-in-out` for state changes
- **Staggered reveals:** When loading multiple items, stagger by 50-75ms for polished feel
- **Scroll-triggered:** Subtle fade-in on scroll for long pages (opacity + small translateY)

Avoid: Spring physics, bouncy overshoots, parallax effects. Keep motion functional.

## Texture & Atmosphere

For products that need visual depth beyond shadows:

- **Subtle gradients:** Background gradients (2-3% opacity shift) add dimension without distraction
- **Noise overlay:** 1-2% noise on large surfaces prevents flatness (especially dark mode)
- **Glass effects:** `backdrop-filter: blur()` for elevated surfaces, used sparingly
- **Border gradients:** Subtle gradient borders on hero cards for premium feel

Match to personality: Precision products stay flat. Sophisticated products layer depth.

## Anti-Patterns

Never:
- Dramatic drop shadows (`0 25px 50px...`)
- Large radius (16px+) on small elements
- Asymmetric padding without reason
- Pure white cards on colored backgrounds
- Thick borders (2px+) for decoration
- Spring/bouncy animations
- Multiple accent colors
- Motion without purpose

## The Standard

Different products want different things. A dev tool wants precision and density. A collaborative product wants warmth and space. A financial product wants trust and sophistication.

**Same quality bar, context-driven execution.**

For CSS values and implementation details, see [references/craft-details.md](references/craft-details.md).
