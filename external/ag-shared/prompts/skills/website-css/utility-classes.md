# Standard CSS Utility Classes

**Always prefer using standard design system classes over custom styles.** These classes are globally available and ensure consistency across the site.

## Layout Classes

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

## Typography Classes

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

## Colour Classes

| Class | Purpose |
|-------|---------|
| `.text-secondary` | Secondary foreground colour |
| `.text-tertiary` | Tertiary foreground colour |

## Interaction Classes

| Class | Purpose |
|-------|---------|
| `.collapse` | Hidden when not `.show` |
| `.collapsing` | Animating collapse transition |
| `.no-transitions` | Disable all transitions |
| `.no-overflow-anchor` | Prevent scroll anchoring |

## Example: Using Standard Classes

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
