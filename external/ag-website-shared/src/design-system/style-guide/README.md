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
  Section.tsx             Section frame, Block, Guidance (do/don't), KnownIssue
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
example beside its code, `TokenTable` for anything token-shaped, `Guidance` for do/don't pairs, and
`KnownIssue` for something that is a defect rather than a rule.

## Guidance and known issues

Two content conventions are worth keeping:

- **Every section states when to use the thing, not just what it looks like.** A swatch grid tells a
  reader which greys exist; it does not stop them reaching for `--color-gray-300` when
  `--color-border-primary` was meant.
- **`KnownIssue` records defects in the design system on the page itself.** A provisional token or a
  broken variant is exactly what a reader needs to know before they build on it, and a `// TODO` in
  `_root.scss` never reaches them. Remove the block when the underlying issue is fixed.

## Colour maths

`lib/colour.ts` handles the formats a computed colour can actually take: `rgb()` for hex and named
inputs, `color(srgb ...)` for a resolved `color-mix()`, and `oklch()` verbatim for an oklch author
value (the `--color-dev-*` scale). Anything unrecognised returns `undefined` so callers degrade to
showing the raw string rather than a wrong number.

Contrast follows WCAG 2.1: 4.5:1 for body text (1.4.3), 3:1 for large text and non-text indicators
(1.4.11). The accessibility section checks a measurement against the ratio its own pairing requires
rather than reading the grade label, because a 3.5:1 result grades as "AA Large" - a pass at 3:1 and
a failure at 4.5:1.
