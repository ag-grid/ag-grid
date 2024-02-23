---
title: "Checkbox Cell Editor"
---

Simple boolean editor that uses the standard HTML checkbox `input`.

## Enabling Checkbox Cell Editor

Edit any cell in the grid below to see the Checkbox Cell Editor. Note that by default the Checkbox Cell Renderer is shown, and the editor is only displayed when you start editing (e.g. double click within the cell).

<grid-example title='Checkbox Editor' name='checkbox-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

Enabled with `agCheckboxCellEditor` and generally used in conjunction with the [Checkbox Cell Component](/cell-data-types/#enable-cell-data-types).

```js
columnDefs: [
    {
        cellRenderer: 'agCheckboxCellRenderer',
        cellEditor: 'agCheckboxCellEditor',
        // ...other props
    }
]
```


