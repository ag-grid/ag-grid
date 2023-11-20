---
title: "Text Cell Editor"
---

Simple text editor that uses the standard HTML `input`. This editor is the default if none other specified.

Specified with `agTextCellEditor` and configured with `ITextCellEditorParams`.

<interface-documentation interfaceName='ITextCellEditorParams' names='["useFormatter","maxLength"]'></interface-documentation>

```js
columnDefs: [
    {
        cellEditor: 'agTextCellEditor',
        valueFormatter: (params) => '£' + params.value,
        cellEditorParams: {
            useFormatter: true,
            maxLength: 200
        }
        // ...other props
    }
]
```

<grid-example title='Text Editor' name='text-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>


## Next Up

Continue to the next section: [Large Text Cell Editor](../provided-cell-editors-large-text/).