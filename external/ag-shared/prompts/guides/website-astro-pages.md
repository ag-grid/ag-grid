---
targets: ['*']
description: 'Astro page creation patterns, layout props, content collections, and code conventions for AG product websites'
globs:
    [
        '**/src/pages/**/*.astro',
        '**/src/layouts/**/*.astro',
    ]
---

# Website Astro Pages Guide

This guide covers Astro page creation patterns, layout props, content collections, and code conventions for AG product websites.

## Project Overview

- **Framework**: Astro 5 with React 18 for interactive components
- **Styling**: SCSS with CSS Modules + shared design system
- **Package Manager**: Yarn
- **Monorepo**: Nx-managed
- **Shared Components**: `external/ag-website-shared/src/components/`

## Directory Structure

```
packages/<website-package>/src/
├── pages/                     # Astro page routes (*.astro files)
├── layouts/
│   └── Layout.astro           # Main page layout wrapper
├── components/                # Local React & Astro components
├── content/                   # Content collections (data, docs)
├── pages-styles/              # Page-specific SCSS modules
├── stores/                    # Nanostores (state management)
└── utils/                     # Utility functions

external/ag-website-shared/src/
├── components/                # Shared components across AG products
│   ├── license-pricing/       # Pricing page components
│   ├── changelog/             # Changelog/pipeline components
│   ├── community/             # Community page components
│   ├── whats-new/             # Release notes components
│   ├── landing-pages/         # Landing page components
│   ├── footer/                # Footer component
│   ├── site-header/           # Site header component
│   └── ...                    # Many more shared components
└── design-system/             # Design tokens and base styles
```

## Creating Standard Astro Pages

### Page Location

All pages go in `packages/<website-package>/src/pages/`. The file path determines the URL:

| File Path | URL |
|-----------|-----|
| `pages/index.astro` | `/` |
| `pages/pricing.astro` | `/pricing` |
| `pages/community.astro` | `/community` |
| `pages/community/events.astro` | `/community/events` |

### Pattern 1: Full Custom Page with Layout

Use this for pages that need custom content and styling.

```astro
---
import Layout from '@layouts/Layout.astro';
import styles from '@pages-styles/my-page.module.scss';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

// Optional: Fetch data from content collections
import { getEntry, type CollectionEntry } from 'astro:content';
const { data: navData } = (await getEntry('docsNav', 'nav')) as CollectionEntry<'docsNav'>;
---

<Layout
    title="Page Title | <Product Name>"
    description="SEO description for the page"
    showSearchBar={true}
    showDocsNav={false}
>
    <div class={styles.pageContainer}>
        <h1>My Page</h1>
        <p>Content goes here</p>
    </div>
</Layout>
```

### Pattern 2: Wrapper Page (Delegates to Shared Component)

Use this when a shared component handles all the page logic.

```astro
---
import { getEntry, type CollectionEntry } from 'astro:content';
import WhatsNew from '@ag-website-shared/components/whats-new/pages/whats-new.astro';

// Note: version entry keys are product-specific (e.g. 'ag-grid-versions', 'ag-charts-versions')
const { data: versionsData } = (await getEntry('versions', '<product>-versions')) as CollectionEntry<'versions'>;
const { data: docsNavData } = (await getEntry('docsNav', 'nav')) as CollectionEntry<'docsNav'>;
---

<!-- Note: site prop is product-specific (e.g. 'grid', 'charts', 'dash') -->
<WhatsNew site="<product-site>" versionsData={versionsData} menuData={docsNavData} />
```

### Pattern 3: Minimal Wrapper (Simplest)

For pages that just render a shared component with no data.

```astro
---
import Home from '@ag-website-shared/components/community/pages/home.astro';
---

<Home />
```

### Pattern 4: Page with React Components

Use this for interactive pages with client-side functionality.

```astro
---
import { LicensePricing } from '@ag-website-shared/components/license-pricing/LicensePricing';
import Layout from '@layouts/Layout.astro';
---

<Layout
    title="<Product Name>: License and Pricing"
    description="View license and pricing details."
    showSearchBar={true}
    showDocsNav={false}
>
    <LicensePricing client:load />
</Layout>
```

### Pattern 5: Page with Docs Navigation

Use this for pages that should show the documentation sidebar.

```astro
---
import { getEntry, type CollectionEntry } from 'astro:content';
import Layout from '@layouts/Layout.astro';
import { getFrameworkFromPath } from '@components/docs/utils/urlPaths';
import { Pipeline } from '@ag-website-shared/components/changelog/Pipeline';
import { DocsNavFromLocalStorage } from '@ag-website-shared/components/docs-navigation/DocsNavFromLocalStorage';
import styles from '@ag-website-shared/components/changelog/changelog.module.scss';
import classnames from 'classnames';

const path = Astro.url.pathname;
const framework = getFrameworkFromPath(path);
const { data: docsNavData } = (await getEntry('docsNav', 'nav')) as CollectionEntry<'docsNav'>;
---

<Layout
    title="Pipeline | <Product Name>"
    description="Lists feature requests and bugs in our backlog."
    showSearchBar={true}
    showDocsNav={true}
>
    <div class="layout-grid">
        <DocsNavFromLocalStorage client:load menuData={docsNavData} framework={framework} />

        <div className={classnames('page-margin', styles.container)}>
            <h1>Pipeline</h1>
            <!-- Note: library prop is product-specific (e.g. 'grid', 'charts', 'dash') -->
            <Pipeline client:load library="<product-library>" />
        </div>
    </div>
</Layout>
```

### Pattern 6: Standalone Page (No Layout)

For special pages like demos that need full control.

```astro
---
import HeroDashboard from '@components/hero-dashboard/HeroDashboard.astro';
import '@pages-styles/scratchpad.scss';
import '@pages-styles/example-controls.css';
---

<!doctype html>
<html lang="en" translate="no">
    <head>
        <title><Product Name></title>
    </head>
    <body class="scratchpad-outer">
        <HeroDashboard />
    </body>
</html>
```

## Layout Component Props

The `Layout.astro` component accepts these props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | required | Page title (shown in browser tab) |
| `description` | string | metadata default | SEO meta description |
| `showSearchBar` | boolean | undefined | Show search in header |
| `showDocsNav` | boolean | undefined | Show docs navigation toggle |
| `hideHeader` | boolean | false | Hide the site header |
| `hideFooter` | boolean | false | Hide the site footer |

## Content Collections

Fetch data from content collections using Astro's `getEntry`:

```astro
---
import { getEntry, type CollectionEntry } from 'astro:content';

// Navigation data
const { data: docsNavData } = (await getEntry('docsNav', 'nav')) as CollectionEntry<'docsNav'>;
const { data: apiNavData } = (await getEntry('apiNav', 'nav')) as CollectionEntry<'apiNav'>;

// Version data (entry key is product-specific, e.g. 'ag-grid-versions', 'ag-charts-versions')
const { data: versionsData } = (await getEntry('versions', '<product>-versions')) as CollectionEntry<'versions'>;

// Footer data
const { data: footerItems } = (await getEntry('footer', 'footer')) as CollectionEntry<'footer'>;

// Metadata
const { data: metadata } = (await getEntry('metadata', 'metadata')) as CollectionEntry<'metadata'>;
---
```

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

## Utility Functions

```typescript
// URL utilities
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';

// Add base URL to paths (base URL is product-specific)
urlWithBaseUrl('/example')  // → '/<product-base>/example' (with configured base)

// Add framework prefix
urlWithPrefix({ framework: 'react', url: './quick-start' })  // → '/react/quick-start'

// Framework detection
import { getFrameworkFromPath } from '@components/docs/utils/urlPaths';
const framework = getFrameworkFromPath(Astro.url.pathname);
```

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

## Code Style

### Import Order

1. Astro imports (`astro:content`)
2. External packages
3. Shared components (`@ag-website-shared/*`)
4. Local components/utils (`@components/*`, `@utils/*`)
5. Styles

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Astro pages | kebab-case | `license-pricing.astro` |
| Components | PascalCase | `MyComponent.tsx` |
| Style modules | kebab-case | `my-page.module.scss` |
| CSS classes | camelCase | `.pageContainer` |

## Common Tasks

### Add a New Standard Page

1. Create `src/pages/my-page.astro`
2. Import Layout and any needed components
3. Use standard design system classes where possible
4. Create `src/pages-styles/my-page.module.scss` only if custom styles needed

### Use a Shared Component

1. Check `external/ag-website-shared/src/components/` for available components
2. Import with `@ag-website-shared/components/...`
3. Add `client:load` if it's a React component needing interactivity
