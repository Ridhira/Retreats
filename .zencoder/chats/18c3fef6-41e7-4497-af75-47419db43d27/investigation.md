# Navbar Dropdown Investigation

## Bug Summary

The homepage navigation needs consistently rendered downward indicators for the **Retreats** and **Coming Soon** dropdown triggers, precise trigger/indicator alignment, and dropdown links that remain visually unchanged when hovered or activated. The existing click-to-open behavior, visual design, and responsive desktop/mobile navigation split must remain intact.

## Root Cause Analysis

The required trigger markup already includes the `⌄` character in both desktop and mobile navigation. The issue is therefore styling rather than missing functionality.

- Desktop arrows inherit generic `span` styling. Although the arrow has a small vertical adjustment, the generic open-state rule targets every span within the trigger. This is broader than the arrow-specific behavior and can make future markup changes affect the indicator unexpectedly.
- Mobile dropdown triggers share the general `.mobile-nav-link` hover rule. That rule moves nested `.link-arrow` elements horizontally on hover. The dropdown-toggle arrow rule has lower selector specificity, so it cannot reliably prevent that inherited hover movement. This conflicts with the requested stable arrow alignment.
- The desktop dropdown-menu links already override the main navigation hover treatment. Mobile submenu links also have an override in `css/navbar.css`; however, the mobile overlay styles are defined later in `index.html`, so the final cascade should be made explicit at the component level to ensure submenu links never inherit hover/active color or transform changes.
- There are no automated tests in the repository, so current behavior is not covered by regression tests.

## Affected Components

- `index.html`
  - Desktop dropdown markup for **Retreats** and **Coming Soon**.
  - Mobile dropdown markup for the same items.
  - Inline mobile navigation hover and arrow styles.
  - Click handler that opens one dropdown at a time, updates `aria-expanded`, closes on outside click, and closes on Escape.
- `css/navbar.css`
  - Shared desktop dropdown trigger, arrow, submenu, and responsive styles.
  - Shared mobile submenu hover/active overrides.

## Proposed Solution

1. Retain the existing `⌄` markup and dropdown JavaScript so links, click behavior, `aria-expanded` updates, outside-click dismissal, Escape dismissal, and one-open-dropdown behavior are unchanged.
2. Scope desktop indicator styles directly to `.nav-arrow`, using an inline-flex box with a fixed line-height and a small optical vertical offset. Rotate only `.nav-arrow` when its dropdown is open.
3. Add a mobile-dropdown-specific hover/active rule for the trigger arrow that preserves its opacity and neutral transform. Keep the existing open-state rotation.
4. Explicitly neutralize hover and active visual changes for desktop and mobile submenu links: preserve their existing text color, transparent background, font weight, and transform. Keep `:focus-visible` outlines so keyboard users retain a visible focus indicator.
5. Keep the existing 767px handoff: desktop dropdowns remain hidden below that width and the mobile overlay keeps its dropdown controls. Verify at desktop, tablet, and mobile widths.

## Regression Coverage and Validation Plan

No test framework or test files are present. During implementation, validate manually that:

- Both desktop triggers show one clean downward indicator aligned to the text baseline.
- Opening either dropdown rotates only its indicator and updates `aria-expanded`.
- A dropdown menu item has no color, background, weight, underline, or position change on hover or active.
- Keyboard focus still displays the existing focus outline.
- Opening one dropdown closes the other; outside click and Escape close all dropdowns.
- The desktop navigation remains stable through the desktop/tablet range, while the mobile overlay dropdowns work at and below 767px.
