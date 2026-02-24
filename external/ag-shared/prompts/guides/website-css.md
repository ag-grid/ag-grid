---
targets: ['*']
description: 'CSS architecture, design system, design tokens, utility classes, and styling patterns for AG product websites'
globs:
    [
        '**/src/pages-styles/**/*.scss',
        '**/src/pages-styles/**/*.css',
        '**/src/components/**/*.scss',
        'external/ag-website-shared/src/design-system/**/*.scss',
    ]
---

# Website CSS & Styling Guide

This guide covers the CSS architecture, design system, design tokens, utility classes, and styling patterns used by AG product websites.

## Design System

### Location

The website's design system is defined in a shared external package:

```
external/ag-website-shared/src/design-system/
```

### File Structure

| File | Purpose |
|------|---------|
| `_root.scss` | All CSS custom properties (colours, typography, layout, shadows) |
| `core/_variables.scss` | SCSS variables (spacing, selectors, transitions) |
| `core/_breakpoints.scss` | Responsive breakpoint values |
| `_layout.scss` | Layout utility classes |
| `_typography.scss` | Typography utility classes |
| `_color.scss` | Colour utility classes |
| `_interactions.scss` | Interactive state classes |
| `_base.scss` | Base element styles |

### Using the Design System

Always import the design system at the top of SCSS files:

```scss
@use 'design-system' as *;
```

## CSS Custom Properties

### How Variables Are Organised

The design system uses CSS custom properties (variables) organised into semantic categories:

```scss
:root {
    // Abstract colours (raw palette)
    --color-gray-50: #f9fafb;
    --color-gray-100: #f2f4f7;
    // ... through gray-950

    --color-brand-50: #f4f8ff;
    --color-brand-100: #e5effd;
    // ... through brand-950

    // Semantic colours (use these in components)
    --color-bg-primary: var(--color-white);
    --color-fg-primary: var(--color-gray-900);
    --color-border-primary: var(--color-gray-300);
}
```

### Colour Palette Reference

#### Grey Scale

| Variable           | Light Mode | Hex       |
| ------------------ | ---------- | --------- |
| `--color-gray-25`  | Lightest   | `#fcfcfd` |
| `--color-gray-50`  |            | `#f9fafb` |
| `--color-gray-100` |            | `#f2f4f7` |
| `--color-gray-200` |            | `#eaecf0` |
| `--color-gray-300` |            | `#d0d5dd` |
| `--color-gray-400` |            | `#98a2b3` |
| `--color-gray-500` |            | `#667085` |
| `--color-gray-600` |            | `#475467` |
| `--color-gray-700` |            | `#344054` |
| `--color-gray-800` |            | `#182230` |
| `--color-gray-900` |            | `#101828` |
| `--color-gray-950` | Darkest    | `#0c111d` |

#### Brand Colours (Blue)

| Variable            | Hex       |
| ------------------- | --------- |
| `--color-brand-50`  | `#f4f8ff` |
| `--color-brand-100` | `#e5effd` |
| `--color-brand-200` | `#d4e3f8` |
| `--color-brand-300` | `#a9c5ec` |
| `--color-brand-400` | `#3d7acd` |
| `--color-brand-500` | `#0e4491` |
| `--color-brand-600` | `#0042a1` |
| `--color-brand-700` | `#00388f` |
| `--color-brand-800` | `#002e7e` |
| `--color-brand-900` | `#00246c` |
| `--color-brand-950` | `#001a5a` |

#### Warning Colours (Orange/Yellow)

| Variable              | Hex       |
| --------------------- | --------- |
| `--color-warning-50`  | `#fffaeb` |
| `--color-warning-100` | `#fef0c7` |
| `--color-warning-200` | `#fedf89` |
| `--color-warning-300` | `#fec84b` |
| `--color-warning-400` | `#fdb022` |
| `--color-warning-500` | `#f79009` |
| `--color-warning-600` | `#dc6803` |
| `--color-warning-700` | `#b54708` |
| `--color-warning-800` | `#93370d` |
| `--color-warning-900` | `#7a2e0e` |
| `--color-warning-950` | `#4e1d09` |

#### Special Colours

| Variable           | Hex                                  | Usage                 |
| ------------------ | ------------------------------------ | --------------------- |
| `--color-success`  | `#28a745` (light) / `#64ea82` (dark) | Success states        |
| `--color-positive` | `#28a745`                            | Positive indicators   |
| `--color-negative` | `#dc3545`                            | Error/negative states |

## Standard CSS Utility Classes

**Always prefer using standard design system classes over custom styles.** These classes are globally available and ensure consistency across the site.

### Layout Classes

Use these for page structure and grid layouts:

| Class | Purpose |
|-------|---------|
| `.layout-grid` | Flexbox grid container with standard gap and max-width |
| `.layout-page-max-width` | Full width constrained to max page width |
| `.layout-max-width-small` | Narrower content width with horizontal padding |

**Column Classes (4-column grid):**
- `.column-1-4`, `.column-2-4`, `.column-3-4`, `.column-4-4`

**Column Classes (6-column grid):**
- `.column-1-6` through `.column-6-6`

**Column Classes (12-column grid):**
- `.column-1-12` through `.column-12-12`

```astro
<div class="layout-grid">
    <div class="column-8-12">Main content</div>
    <div class="column-4-12">Sidebar</div>
</div>
```

### Typography Classes

| Class | Font Size | Use For |
|-------|-----------|---------|
| `.text-2xs` | 10px | Fine print |
| `.text-xs` | 12px | Captions, labels |
| `.text-sm` | 14px | Secondary text |
| `.text-base` | 16px | Body text (default) |
| `.text-lg` | 20px | Subheadings |
| `.text-xl` | 24px | Section headings |
| `.text-2xl` | 32px | Page headings |
| `.text-3xl` | 40px | Hero headings |

**Weight Classes:**
- `.text-regular` (400)
- `.text-semibold` (600)
- `.text-bold` (700)

**Other:**
- `.text-monospace` - Monospace font family

```astro
<h1 class="text-2xl text-semibold">Page Title</h1>
<p class="text-base">Body content here.</p>
<code class="text-sm text-monospace">code example</code>
```

### Colour Classes

| Class | Purpose |
|-------|---------|
| `.text-secondary` | Secondary foreground colour |
| `.text-tertiary` | Tertiary foreground colour |

### Interaction Classes

| Class | Purpose |
|-------|---------|
| `.collapse` | Hidden when not `.show` |
| `.collapsing` | Animating collapse transition |
| `.no-transitions` | Disable all transitions |
| `.no-overflow-anchor` | Prevent scroll anchoring |

### Example: Using Standard Classes

```astro
<section class="layout-max-width-small">
    <h1 class="text-2xl text-semibold">Welcome</h1>
    <p class="text-base text-secondary">
        Introduction paragraph with secondary styling.
    </p>

    <div class="layout-grid">
        <div class="column-6-12">
            <h2 class="text-xl">Left Column</h2>
        </div>
        <div class="column-6-12">
            <h2 class="text-xl">Right Column</h2>
        </div>
    </div>
</section>
```

## Dark Mode

### How Dark Mode Works

Dark mode is triggered by the `data-dark-mode="true"` attribute on the `<html>` element:

```scss
html[data-dark-mode='true'] {
    --color-bg-primary: color-mix(in srgb, var(--color-gray-800), var(--color-gray-900) 50%);
    --color-fg-primary: var(--color-white);
    // ... other overrides
}
```

### Dark Mode in SCSS Modules

Use the `$selector-darkmode` SCSS variable for dark mode overrides in component styles:

```scss
.myElement {
    background-color: var(--color-bg-primary);

    #{$selector-darkmode} & {
        background-color: var(--color-bg-secondary);
    }
}
```

### Key Dark Mode Colours

| Semantic Variable          | Light Mode | Dark Mode                                |
| -------------------------- | ---------- | ---------------------------------------- |
| `--color-bg-primary`       | `#ffffff`  | Mix of `#182230` + `#101828` |
| `--color-bg-secondary`     | `#f9fafb`  | `#344054`                                |
| `--color-bg-tertiary`      | `#f2f4f7`  | `#182230`                                |
| `--color-fg-primary`       | `#101828`  | `#ffffff`                                |
| `--color-fg-secondary`     | `#344054`  | `#d0d5dd`                                |
| `--color-border-primary`   | `#d0d5dd`  | `#344054`                                |
| `--color-border-secondary` | `#eaecf0`  | Mix of `#344054` + bg-primary            |
| `--color-link`             | `#0e4491`  | `#a9c5ec`                                |

### Detecting Dark Mode in JavaScript

```typescript
// Check data attribute (preferred)
const isDark = document.documentElement.getAttribute('data-dark-mode') === 'true';

// Or check for dark mode class (fallback)
const isDark = document.documentElement.classList.contains('dark');
```

### Creating Theme-Aware Components

Use CSS custom properties that react to `data-dark-mode`:

```css
/* Define variables for both modes */
:root {
    --my-component-bg: #ffffff;
    --my-component-text: #101828;
}

[data-dark-mode='true'] {
    --my-component-bg: #182230;
    --my-component-text: #d0d5dd;
}

/* Use variables in component */
.my-component {
    background: var(--my-component-bg);
    color: var(--my-component-text);
}
```

This approach ensures instant theme switching without JavaScript re-rendering.

## Semantic Colour Categories

### Background Colours (`--color-bg-*`)

-   `--color-bg-primary`: Main content background
-   `--color-bg-secondary`: Secondary/elevated surfaces
-   `--color-bg-tertiary`: Subtle backgrounds
-   `--color-bg-toolbar`: Toolbar backgrounds
-   `--color-bg-code`: Code block backgrounds

### Foreground/Text Colours (`--color-fg-*`)

-   `--color-fg-primary`: Primary text
-   `--color-fg-secondary`: Secondary/muted text
-   `--color-fg-tertiary`: Subtle text
-   `--color-fg-disabled`: Disabled state text

### Border Colours (`--color-border-*`)

-   `--color-border-primary`: Primary borders
-   `--color-border-secondary`: Subtle borders
-   `--color-border-tertiary`: Very subtle borders

### Link Colours (`--color-link*`)

-   `--color-link`: Default link colour
-   `--color-link-hover`: Link hover state

## Design Tokens Reference

### Spacing (SCSS variables from `core/_variables.scss`)

| Variable | Value |
|----------|-------|
| `$spacing-size-1` | 4px |
| `$spacing-size-2` | 8px |
| `$spacing-size-3` | 12px |
| `$spacing-size-4` | 16px |
| `$spacing-size-5` | 20px |
| `$spacing-size-6` | 24px |
| `$spacing-size-8` | 32px |
| `$spacing-size-10` | 40px |
| `$spacing-size-12` | 48px |
| `$spacing-size-16` | 64px |
| `$spacing-size-20` | 80px |
| `$spacing-size-24` | 96px |

### Breakpoints (SCSS variables from `core/_breakpoints.scss`)

| Variable | Value | Use For |
|----------|-------|---------|
| `$breakpoint-hero-small` | 620px | Small hero layouts |
| `$breakpoint-hero-large` | 1020px | Large hero layouts |
| `$breakpoint-landing-page-medium` | 1020px | Landing pages |
| `$breakpoint-docs-nav-medium` | 1052px | Docs navigation |
| `$breakpoint-pricing-small` | 620px | Pricing page |
| `$breakpoint-pricing-medium` | 820px | Pricing page |
| `$breakpoint-pricing-large` | 1260px | Pricing page |

### Typography (CSS variables from `_root.scss`)

| Variable | Value |
|----------|-------|
| `--text-fs-2xs` | 10px |
| `--text-fs-xs` | 12px |
| `--text-fs-sm` | 14px |
| `--text-fs-base` | 16px |
| `--text-fs-lg` | 20px |
| `--text-fs-xl` | 24px |
| `--text-fs-2xl` | 32px |
| `--text-fs-3xl` | 40px |
| `--text-lh-tight` | 1.2 |
| `--text-regular` | 400 |
| `--text-semibold` | 600 |
| `--text-bold` | 700 |

### Layout (CSS variables from `_root.scss`)

| Variable | Description |
|----------|-------------|
| `--layout-gap` | Grid gap (32px) |
| `--layout-max-width` | Max page width (1800px) |
| `--layout-max-width-small` | Narrow content width (1240px) |
| `--layout-horizontal-margins` | Side margins |

### Border Radius

- `--radius-xs` (4px), `--radius-sm` (6px), `--radius-md` (8px), `--radius-lg` (10px), `--radius-xl` (12px), `--radius-2xl` (16px)

### Shadows

- `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-2xl`

## Creating Custom Page Styles

Only create custom styles when standard classes don't meet your needs. Create SCSS modules in `packages/<website-package>/src/pages-styles/`:

```scss
// my-page.module.scss
@use 'design-system' as *;

.heroSection {
    padding-top: $spacing-size-16;
    background-color: var(--color-bg-site-header);

    // Dark mode support
    #{$selector-darkmode} & {
        background-color: var(--color-bg-secondary);
    }

    // Responsive
    @media screen and (min-width: $breakpoint-hero-large) {
        padding-top: $spacing-size-24;
    }
}
```

## Using Styles in Astro

```astro
---
import styles from '@pages-styles/my-page.module.scss';
import classnames from 'classnames';
---

<div class={styles.pageContainer}>
    <section class:list={[styles.heroSection, 'layout-max-width-small']}>
        <h1 class="text-2xl">Title</h1>
    </section>
</div>
```

## Component Styling Patterns

### Using SCSS Modules

The website uses CSS/SCSS modules for component styling:

```scss
// MyComponent.module.scss
.container {
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-primary);
    color: var(--color-fg-primary);
}
```

## Best Practices

### DO:

-   Use semantic variables (`--color-bg-primary`) not raw colours (`--color-gray-50`)
-   Define component-specific variables that reference design system variables
-   Use `[data-dark-mode="true"]` selector or `#{$selector-darkmode}` for dark mode overrides
-   Test components in both light and dark modes
-   Prefer standard design system utility classes over custom styles

### DON'T:

-   Hardcode hex colours directly in components
-   Use `prefers-color-scheme` media query (the site uses explicit `data-dark-mode`)
-   Assume light mode is the default without testing dark mode

## Adding New Theme-Aware Styles

When creating new components or features that need to support both themes:

1. **Define CSS variables** in a `<style>` tag or CSS file:

    ```css
    :root {
        --my-feature-bg: #ffffff;
        --my-feature-border: #d0d5dd;
    }

    [data-dark-mode='true'] {
        --my-feature-bg: #182230;
        --my-feature-border: #344054;
    }
    ```

2. **Use the variables** in your styles:

    ```css
    .my-feature {
        background: var(--my-feature-bg);
        border: 1px solid var(--my-feature-border);
    }
    ```

3. **Choose appropriate colours** from the design system palette (see tables above)
