# Shared Components & Imports

## Available Shared Components

Key components from `@ag-website-shared/components/`:

| Component | Import Path | Purpose |
|-----------|-------------|---------|
| `LicensePricing` | `license-pricing/LicensePricing` | Pricing page |
| `Pipeline` | `changelog/Pipeline` | Development pipeline |
| `WhatsNew` | `whats-new/pages/whats-new.astro` | Release notes |
| `DocsNavFromLocalStorage` | `docs-navigation/DocsNavFromLocalStorage` | Docs sidebar |
| `FrameworkTextAnimation` | `framework-text-animation/FrameworkTextAnimation` | Animated framework text |
| `LandingPageFWSelector` | `landing-pages/LandingPageFWSelector` | Framework selector |
| `Footer` | `footer/Footer` | Site footer |
| `SiteHeader` | `site-header/SiteHeader.astro` | Site header |

## Path Aliases

| Alias | Path |
|-------|------|
| `@components/*` | `src/components/*` |
| `@layouts/*` | `src/layouts/*` |
| `@pages-styles/*` | `src/pages-styles/*` |
| `@stores/*` | `src/stores/*` |
| `@utils/*` | `src/utils/*` |
| `@constants` | `src/constants.ts` |
| `@ag-website-shared/*` | `external/ag-website-shared/src/*` |

## React Component Hydration

When using React components in Astro pages, add hydration directives:

| Directive | When to Use |
|-----------|-------------|
| `client:load` | Needs immediate interactivity (most common) |
| `client:idle` | Can wait until browser is idle |
| `client:visible` | Only when scrolled into view |
| (none) | Static content only, no JavaScript |

```astro
<!-- Interactive immediately -->
<LicensePricing client:load />

<!-- Hydrate when idle -->
<NewsletterSignup client:idle />

<!-- Hydrate when visible -->
<VideoPlayer client:visible videoId="abc123" />
```
