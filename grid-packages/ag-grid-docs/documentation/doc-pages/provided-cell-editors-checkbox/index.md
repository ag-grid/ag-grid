---
title: "Checkbox Cell Editor"
---

Simple boolean editor that uses the standard HTML checkbox `input`.

Specified with `agCheckboxCellEditor`.

Generally used in conjunction with the [Checkbox Cell Renderer](/cell-rendering/#checkbox-cell-renderer).

```js
columnDefs: [
    {
        cellEditor: 'agCheckboxCellEditor',
        // ...other props
    }
]
```

<grid-example title='Checkbox Editor' name='checkbox-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>
