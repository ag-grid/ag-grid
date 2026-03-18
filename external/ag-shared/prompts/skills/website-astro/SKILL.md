---
targets: ['*']
name: website-astro
description: 'Astro page creation patterns, layout props, content collections, and code conventions for AG product websites'
---

# Website Astro Pages

This skill provides page creation patterns, layout props, content collections, and code conventions for AG product websites.

## Project Overview

- **Framework**: Astro 5 with React 18 for interactive components
- **Styling**: SCSS with CSS Modules + shared design system
- **Package Manager**: Yarn
- **Monorepo**: Nx-managed
- **Shared Components**: `external/ag-website-shared/src/components/`

## Sub-Documents

Load based on what you need:

| Document | Purpose | When to Load |
|----------|---------|-------------|
| `page-patterns.md` | All 6 page patterns with full code examples | Creating or modifying page structure |
| `content-collections.md` | Content collection recipes and data fetching | Using `getEntry`, fetching nav/version/footer data |
| `shared-components.md` | Component catalog, path aliases, hydration directives | Importing shared or local components |

## Most Common Pattern: Full Custom Page with Layout

Most pages use this pattern — import Layout, add page content:

```astro
---
import Layout from '@layouts/Layout.astro';
import styles from '@pages-styles/my-page.module.scss';
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

## Layout Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | required | Page title (shown in browser tab) |
| `description` | string | metadata default | SEO meta description |
| `showSearchBar` | boolean | undefined | Show search in header |
| `showDocsNav` | boolean | undefined | Show docs navigation toggle |
| `hideHeader` | boolean | false | Hide the site header |
| `hideFooter` | boolean | false | Hide the site footer |

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
└── design-system/             # Design tokens and base styles
```

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
| Component styles | PascalCase | `MyComponent.module.scss` |
| Page styles | kebab-case | `my-page.module.scss` |
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
