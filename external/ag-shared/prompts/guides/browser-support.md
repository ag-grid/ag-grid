---
targets: ['*']
description: 'Browser support policy — minimum API/feature baseline for runtime code'
globs: ['packages/*/src/**/*.ts', 'packages/*/src/**/*.tsx']
---

# Browser Support Policy

AG products officially support the **two latest major versions** of each browser listed below. All runtime code must work within this baseline.

## Supported Browsers

### Desktop

- Chrome (two latest major versions)
- Firefox (two latest major versions)
- Microsoft Edge (two latest major versions)
- Safari (two latest major versions)

### Mobile

- Safari on iOS / iPad OS (two latest major versions)
- Chrome on iOS / iPad OS / Android (two latest major versions)

## Implications for Code

-   **ES2023+ built-ins are safe** (e.g. `Array.prototype.toReversed()`, `Array.prototype.toSorted()`, `Array.prototype.findLast()`). All supported browsers have shipped these.
-   **Do not use APIs that landed only in the very latest browser release.** Check [Can I Use](https://caniuse.com) or MDN compatibility tables when uncertain — the feature must be available in at least the two most recent major versions of every supported browser.
-   **No polyfills in runtime bundles.** The library ships zero third-party dependencies; if a feature isn't natively available in the support matrix, don't use it.
-   **CSS features follow the same rule.** Any CSS used in DOM overlays or UI components must be supported across the matrix.
