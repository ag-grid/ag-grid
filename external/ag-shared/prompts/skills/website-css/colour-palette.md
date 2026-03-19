# Colour Palette Reference

## How Variables Are Organised

The design system uses CSS custom properties organised into semantic categories:

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

## Grey Scale

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

## Brand Colours (Blue)

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

## Warning Colours (Orange/Yellow)

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

## Special Colours

| Variable           | Hex                                  | Usage                 |
| ------------------ | ------------------------------------ | --------------------- |
| `--color-success`  | `#28a745` (light) / `#64ea82` (dark) | Success states        |
| `--color-positive` | `#28a745`                            | Positive indicators   |
| `--color-negative` | `#dc3545`                            | Error/negative states |

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
