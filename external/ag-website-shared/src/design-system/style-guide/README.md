# Design system style guide

The reference page for the shared design system, served at `/style-guide` on each site.

It is built on one rule: **the page reads the design system rather than restating it.** Nothing on
the page is a hand-maintained copy of a value that lives in `_root.scss` or `core/`, so it cannot
fall behind the code.

## How the data gets there

Three mechanisms, in order of how much of the page they drive.

| Mechanism                       | Covers                                                | Where                    |
| ------------------------------- | ----------------------------------------------------- | ------------------------ |
| Scanning the live stylesheet    | Every CSS custom property, for both themes            | `lib/tokens.ts`          |
| Parsing the Sass source as text | Spacing scale, breakpoints, transition timing         | `lib/sassSource.ts`      |
| A Sass `:export` block          | The four `!default` header breakpoints, post-override | `sassTokens.module.scss` |

### Scanning the live stylesheet

`readTokens()` walks `document.styleSheets`, picks out rules whose selector matches `:root` (light)
or `[data-dark-mode="true"]` (dark), and collects every `--*` declaration. `resolveTokens()` then
substitutes each `var()` reference from those maps and pushes the result through a probe element to
get the browser's computed value.

Two details matter:

- **Both themes resolve at once.** Because substitution removes every `var()`, the resulting string
  no longer depends on which theme is active - so the dark value can be computed while the page is
  in light mode. That is what makes the split light/dark colour chips possible, and it is why theme
  review is reading one table rather than toggling back and forth.
- **Selector quoting is normalised before matching.** `selectorText` is the browser's
  _serialisation_ of a selector, and browsers re-emit attribute values with double quotes even
  though `_root.scss` writes single ones. Matching the source spelling silently matches nothing, and
  every dark value falls back to its light counterpart - which looks correct across the abstract
  palette, where the two genuinely are identical, and is wrong everywhere else.

Declarations inside `@media`/`@supports` are deliberately skipped. The design system has one such
override (`--layout-horizontal-margins` above 920px) and reporting it would present a value that
only applies at wide viewports as though it were the token's value.

### Parsing the Sass source

Spacing sizes and breakpoints never become custom properties - they have to be Sass variables
because a custom property is not valid in a media query condition - so the stylesheet scan cannot
see them. Rather than restate them in TypeScript, the guide imports `core/_variables.scss` and
`core/_breakpoints.scss` with `?raw` and parses the declarations out. Adding a breakpoint to
`core/` is all it takes for it to appear here.

### The Sass `:export`

The header's four breakpoints are declared `!default` and overridden per repo via
`@forward ... with (...)`, resolved through the Sass load path. The only way to report the
_effective_ value is to let Sass resolve them the same way the header does, which is what
`sassTokens.module.scss` is for.

## Layout of the code

```
StyleGuide.tsx            Shell: sidebar + toolbar + every section in order
StyleGuideContext.tsx     Runs the token scan once, holds the shared filter
sections.ts               The single registry of sections - add one entry, not three
StyleGuide.module.scss    All styling for the guide's own chrome

chrome/                   Reusable presentation
  Section.tsx             Section frame, Block, Guidance (do/don't)
  TokenTable.tsx          The workhorse token table, plus ScaleStrip
  Swatch.tsx              Split light/dark colour chip
  ContrastBadge.tsx       WCAG ratio + grade
  CopyButton.tsx          Click-to-copy for token and class names
  Specimen.tsx            Live example paired with its markup
  Sidebar.tsx             Grouped nav with scroll tracking
  Toolbar.tsx             Token filter and theme switch

lib/
  tokens.ts               Stylesheet scan and token resolution
  colour.ts               Colour parsing (hex/rgb/color(srgb)/oklch/oklab), WCAG maths
  sassSource.ts           Sass declaration parser

sections/                 One file per topic, registered in sections.ts
```

## Adding a section

1. Add a component under `sections/`, wrapped in `<Section id lede source>`.
2. Register it in `sections.ts` with a matching `id`. The sidebar, anchors and page order all come
   from that registry.

Use the existing chrome rather than new markup: `Block` for sub-headings, `Specimen` for a live
example beside its code, `TokenTable` for anything token-shaped, and `Guidance` inside a `Block title="Usage"` for do/don't
pairs.

## What belongs on the page

The page is a style guide, not engineering documentation. Each section shows the thing, its variants
and states, and when to use it.

- **State when to use the thing, not just what it looks like.** A swatch grid tells a reader which
  greys exist; it does not stop them reaching for `--color-gray-300` when `--color-border-primary`
  was meant. Put the rule in the section's `Usage` guidance.
- **Keep implementation detail here, not on the page.** How a component is built, which file a
  workaround lives in and why a value is what it is belong in this README or a code comment.
- **File defects in JIRA.** A broken variant or provisional token is a ticket, not a callout.

## Colour maths

`lib/colour.ts` handles the formats a computed colour can actually take: `rgb()` for hex and named
inputs, `color(srgb ...)` for a resolved `color-mix()`, and `oklch()` verbatim for an oklch author
value (the `--color-dev-*` scale). Anything unrecognised returns `undefined` so callers degrade to
showing the raw string rather than a wrong number.

Contrast follows WCAG 2.1: 4.5:1 for body text (1.4.3), 3:1 for large text and non-text indicators
(1.4.11). The accessibility section checks a measurement against the ratio its own pairing requires
rather than reading the grade label, because a 3.5:1 result grades as "AA Large" - a pass at 3:1 and
a failure at 4.5:1.

## Working on the design system

### Where things live

The design system lives in `external/ag-website-shared/src/design-system` and each site's layout
loads it as one stylesheet.

| File                       | Holds                                                                             |
| -------------------------- | --------------------------------------------------------------------------------- |
| `core/_variables.scss`     | Spacing scale, transition timing, selector fragments for theme and grid escaping  |
| `core/_breakpoints.scss`   | Every breakpoint, forwarded with a `$breakpoint-` prefix                          |
| `core/_mixins.scss`        | Mixins a component module can use without pulling in global CSS (`stack-table()`) |
| `_root.scss`               | All custom properties: light in `:root`, dark under `html[data-dark-mode]`        |
| `_base.scss`               | Resets, `html` defaults, scrollbar styling                                        |
| `_layout.scss`             | Layout containers and the fractional column classes                               |
| `_typography.scss`         | Heading-to-scale mapping, `.text-*` utilities, prose rhythm                       |
| `_color.scss`              | `.text-secondary` and `.text-tertiary`                                            |
| `_interactions.scss`       | Collapse and transition-suppression utilities, view transition suppression        |
| `elements/`                | Global styling by tag: block, inline, button, form elements, table                |
| `components/`              | Global styling for the card, tabs and code-block patterns                         |
| `_site-header-tokens.scss` | The four header breakpoints each repo can override                                |

### Syncing to the other repos

`ag-website-shared` is a git-subrepo, not a package. Grid, Charts and Studio each hold their own
copy, pinned to a commit in `external/ag-website-shared/.gitrepo`. A change affects only the repo it
is made in until it is pushed upstream and pulled into the others.

```sh
# In the repo where you made the change
yarn subrepo push --subrepo ag-website-shared

# In each other repo
yarn subrepo pull --subrepo ag-website-shared

# Which commit is this repo pinned to?
git config -f external/ag-website-shared/.gitrepo subrepo.commit
```

If someone else has pushed since you last pulled, the push is refused with "There are new changes
upstream, you need to pull first". Pull, then push again. Say in the pull request whether the change
still needs syncing, since a reviewer cannot tell from the diff.

### Adding a colour token

A new colour is almost always a semantic or component token pointing at an existing abstract value.
Add a dark value unless the light one works on the dark background; a token with no dark value
inherits the light one.

```scss
:root {
    --color-bg-callout: var(--color-brand-50);
}

html[data-dark-mode='true'] {
    --color-bg-callout: var(--color-brand-950);
}
```

Then find the token in the colour section of the style guide and check both halves of its chip and
its contrast. For a one-off need, declare a local custom property on the component instead of a
global token.

### Sass variables or custom properties

Anything used in a `@media` or `@container` condition has to be a Sass variable, because custom
properties are not valid there. Everything else is a custom property, so it can be re-pointed per
theme.

### Global element styles

Guard global element selectors, or they restyle the live grid and Bryntum components embedded in
documentation pages.

```scss
figure#{$selector-exclude-grid-bryntum} {
    margin-bottom: $spacing-size-4;
}
```

Use `$selector-exclude-grid` when only the grid needs excluding. Both `:not()`s have to sit on the
same element: listing the two fragments as separate comma entries is a union, and each lets through
what the other excludes.

### Per-repo overrides

A value that must differ per product is declared `!default` in the shared file and configured
through a same-named file earlier on the Sass load path (set in each site's `astro.config.mjs`):

```scss
// documentation/ag-grid-docs/src/styles/header-tokens/_site-header-tokens.scss
@forward '…/design-system/site-header-tokens' with (
    $nav-collapse: 1120px,
    $docs-search-inline: 1300px
);
```

Anything not listed in `with (...)` keeps the shared default. Use this only when the value varies by
product.

### Site header

- `$breakpoint-site-header-small` does not collapse the header. `$nav-collapse` in
  `_site-header-tokens.scss` does, and it differs per repo. `$site-header-small` also drives the
  announcement banner, campaign pages and automated examples, so it is kept separate.
- `.header` is a container, so its breakpoints query its own width. Two are `@media` on purpose: the
  sticky threshold (a container cannot query its own size) and the docs nav button (it has to match
  `DocsNav`'s own media query). The first leaves a scrollbar-wide band where the header is sticky but
  the hamburger still shows; `SiteHeader.module.scss` drops back to `position: relative` while the
  mobile menu is open. Check that case after changing `$sticky-at` or `$nav-collapse`.
- `_root.scss` applies the token block to `:root` and to the unscrolled homepage header. A token
  added to `:root` is declared twice, so check the homepage header after changing a layout or colour
  token.

### Code highlighting

Snippets are highlighted by [Shiki](https://shiki.style/) with one shared highlighter in
`components/code/Code.tsx`. The `ag-docs` theme in `components/code/theme.json` sets every
foreground to a `var(--color-code-*)` reference, so the emitted spans carry the variable and a theme
change re-colours them without re-highlighting.

- Shiki's regex engine is WebAssembly, so docs pages need `'wasm-unsafe-eval'` in the CSP, and the
  inline token styles need `style-src 'unsafe-inline'`.
- `CodeHighlight.module.scss` forces every token in `language-bash` and `language-shell` blocks to
  `--color-fg-primary`, so the code palette does not affect them.

### Markdoc

- The `heading` node override spreads markdoc's default heading schema, which provides the slug, and
  swaps only the renderer for `Heading.astro`. Replacing rather than spreading it removes every
  heading anchor on the site.
- `imagePath` resolves relative to the page's own folder. Two pages showing the same image each need
  a copy, unless one passes `pageName` to point at the other's folder.
- `ExpandingSection` needs `/scripts/expanding-section.js` in the site's `public/` directory. It is
  external so the CSP can drop `script-src 'unsafe-inline'`. Without it the section still opens, with
  no transition.
