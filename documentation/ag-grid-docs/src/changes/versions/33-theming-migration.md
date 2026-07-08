From v33 the `theme` grid option has a default value. An app that upgrades without setting it gets the new Quartz theme from the Theming API instead of the legacy CSS-file theme it had before. There are two ways forward: keep your current appearance by opting back into legacy themes, or adopt the Theming API.

## Keep your current appearance (opt back into legacy themes)

Set the `theme` grid option to the string `"legacy"`. The grid then behaves as it did in v32: it applies no theme itself, and your existing CSS/Sass file imports and `ag-theme-*` class names continue to style it.

To opt every grid in the app back in at once, set it as a global grid option — Enterprise users can set this alongside the licence key:

```js
import { provideGlobalGridOptions } from 'ag-grid-community';

// Mark all grids as using legacy themes
provideGlobalGridOptions({ theme: 'legacy' });
```

This is the smallest change and preserves the v32 look exactly. Legacy themes remain supported, so you can migrate later.

## Adopt the Theming API (recommended)

With the Theming API, themes are JavaScript objects passed to the `theme` grid option, and the grid inserts the correct CSS itself. See the [Theming API Migration Guide](./theming-migration/) for the full walkthrough. In outline:

1. **Remove the legacy CSS imports** — any `import 'ag-grid-community/styles/ag-grid.css'` and `import 'ag-grid-community/styles/ag-theme-*.css'` statements, or copies of those files.
2. **Import a theme and pass it to the `theme` option**, optionally setting parameters on it:

   ```js
   import { themeQuartz } from 'ag-grid-community';

   const myTheme = themeQuartz.withParams({ accentColor: 'red' });
   // pass myTheme to the `theme` grid option (a prop/binding in framework wrappers)
   ```

3. **Convert any CSS custom properties you set** to their new names. Many parameters were renamed; see the [parameter mapping](./theming-migration/#3-convert-any-css-custom-properties-you-are-using-to-the-new-names). Notable changes: `--ag-grid-size` becomes `spacing` (padding-based rather than size-based), and the various `*-active-color` properties become `accentColor`.
4. **Optionally remove `ag-theme-*` class names** from the grid container and from any CSS rules that reference them — under the Theming API these classes are no longer required, and custom properties now inherit, so you can set them on `body` or any ancestor.
5. **Sass users** can drop the Sass API entirely; its role is taken by `theme.withParams(...)` in JavaScript.

If the app has many grids or pages, migrate incrementally: convert a page or a whole document's grids at a time, keeping the rest on `theme: 'legacy'`. Mixing legacy and Theming API grids in one document is possible but requires shadow DOM to isolate the styles — see the [migration guide](./theming-migration/#incremental-migration).
