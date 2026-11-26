---
targets: ['*']
description: 'Add one or more new icons to the grid icon sets (legacy theme icon fonts and Theming API icon SVGs)'
---

# Add Icons

`$ARGUMENTS` names the icons to add and the SVG assets for each. If the assets are missing, ask for them.

Each icon needs an SVG for every location in steps 1 and 2. Use the assets the designer supplied for each one, and ask for any that are missing. Optionally themes may share icons eg you may be told that Balham uses Alpine's icons, but don't assume this if not explicitly told.

- Legacy font SVGs must be filled outlines: fonts don't render strokes.
- Except for Quartz's `iconNameToSvgFragment` (24×24, step 2), the viewBox size is free. Icons scale to the icon size, and existing icons use 16×16, 24×24 and 32×32.

Name each icon in kebab-case and use that name everywhere below. Before starting, find an existing icon (e.g. `values-as`) in every location below and follow it: file format, SVG attributes, `fill="currentColor"`, entry ordering, formatting.

## 1. Legacy icon fonts

1. Add `<name>.svg` to each of `community-modules/styles/icon-fonts/fonts/agGrid{Alpine,Balham,Classic,Material,Quartz}/`.
2. Add the name to `nameToCodepoint` in `community-modules/styles/icon-fonts/build.js` with the next unused codepoint. Never change an existing codepoint.
3. Font glyphs use the nonzero fill rule, so `fill-rule="evenodd"` is ignored. Each hole must be wound in the opposite direction to the shape around it, or it renders filled. If a glyph renders wrong, run the SVGs through `oslllo-svg-fixer` (installed in `icon-fonts/node_modules`).
4. In `community-modules/styles/icon-fonts`, run `npm install` (first time only) then `npm run build`. Commit the regenerated `community-modules/styles/_icon-font-codes.scss` and `community-modules/styles/src/internal/ag/generated/_agGrid*.scss`.

## 2. Theming API icon sets

All under `packages/ag-grid-community/src/theming/parts/icon-set/`:

1. **Alpine, Balham, Material:** add `<name>.svg` to `<theme>/<theme>-svg-icons/`. Add a `.ag-icon-<name>::before` rule to `<theme>/icon-set-<theme>.css`.
2. **Quartz:** add the icon to `quartz/quartz-icon-data.ts`:
    - In `iconNameToSvgFragment`, as the inner elements only: a 24×24 grid, plain stroke, no fill. Prefer this form: it supports the icon stroke-weight setting and leads to a smaller bundle size. Ask the designer to adjust the icon to fit it if needed.
    - Otherwise, in `iconNameToFullSvg`, as a complete SVG. This breaks the stroke-weight setting, but some icon designs may require it. Use only after the designer has confirmed that adjustable font weight is not desired for this icon.

## 3. Types and validation

1. Add the name to the `IconValue` union in `packages/ag-stack/src/interfaces/iIcon.ts`.
2. Add it to `ICON_VALUES` in `packages/ag-grid-community/src/validation/rules/iconValidations.ts`.
3. If a grid feature uses the icon under a new key, add the key to `IconName` in `packages/ag-grid-community/src/utils/icon.ts`, map it to the icon name in `ICON_NAME_TO_VALUE` in `packages/ag-grid-community/src/utils/iconNameToValue.ts`, and add `<key>: '<name>'` to the Icon Names list in `documentation/ag-grid-docs/src/content/docs/custom-icons/index.mdoc`.

## 4. Docs

1. Copy each legacy font SVG to `documentation/ag-grid-docs/public/theme-icons/<theme>/<name>.svg`. The folders are `alpine`, `balham`, `material`, `quartz`. These files are identical copies of the step 1 SVGs.
2. Rebuild `<theme>-icons.zip` in each of those folders, holding that folder's SVGs at the top level.
3. Add the name to `ICON_NAMES` in `documentation/ag-grid-docs/src/components/icon/iconsData.ts`.

## 5. Verify

1. Run `./checks.sh`.
2. Check the icon renders correctly with each Theming API icon set (themeQuartz with `iconSetQuartz(Regular|Light|Bold)` where you should be able to observe the difference in weight; themeBalham; themeAlpine and themeMaterial) and with each legacy theme (`theme: 'legacy'` plus its `ag-theme-*` CSS). Use playwright to screenshot the icons and check their rendering, if necessary increasing resolution. Compare the rendering against the provided SVG. For legacy themes, incorrect path winding direction will lead to rendering errors so check that the shape is correct and especially that holes in the shape correctly punch out from the containing path. If a grid feature uses the icon, test through that feature. Otherwise find an existing `<span class="ag-icon ag-icon-<name>"></span>` inside the grid and change it to the new name to test.
3. Check the icon appears on the docs `custom-icons` page under Provided Icons for every theme.
