# Dark Mode

## How Dark Mode Works

Dark mode is triggered by the `data-dark-mode="true"` attribute on the `<html>` element:

```scss
html[data-dark-mode='true'] {
    --color-bg-primary: color-mix(in srgb, var(--color-gray-800), var(--color-gray-900) 50%);
    --color-fg-primary: var(--color-white);
    // ... other overrides
}
```

## Dark Mode in SCSS Modules

Use the `$selector-darkmode` SCSS variable for dark mode overrides in component styles:

```scss
.myElement {
    background-color: var(--color-bg-primary);

    #{$selector-darkmode} & {
        background-color: var(--color-bg-secondary);
    }
}
```

## Key Dark Mode Colours

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

## Detecting Dark Mode in JavaScript

```typescript
// Check data attribute (preferred)
const isDark = document.documentElement.getAttribute('data-dark-mode') === 'true';

// Or check for dark mode class (fallback)
const isDark = document.documentElement.classList.contains('dark');
```

## Creating Theme-Aware Components

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

3. **Choose appropriate colours** from the design system palette (see `colour-palette.md`)

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
