# Prompt

The ID column only ever holds a four-digit number but it's as wide as everything else. It should be exactly 80 pixels and stay that way, while the remaining columns carry on sharing out the rest of the width.

# Expected

On the `id` column definition, `width: 80` together with `flex: 0` (or `flex: null`), because `flex` is inherited from `defaultColDef` and takes precedence over `width`.

Equally acceptable: `minWidth: 80, maxWidth: 80` on that column, with or without `flex`.

Wrong: `width: 80` alone, which is silently ignored; removing `flex` from `defaultColDef` and re-adding it to every other column; CSS.
