---
title: "Text Cell Editor"
---

Simple text editor that uses the standard HTML `input`. This editor is the default if none other specified.

## Enabling Text Cell Editor

Edit any cell in the grid below to see the Text Cell Editor:

<grid-example title='Text Editor' name='text-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

Enabled with `agTextCellEditor` and configured with `ITextCellEditorParams`.

```js
columnDefs: [
    {
        cellEditor: 'agTextCellEditor',
        cellEditorParams: {
            maxLength: 20
        },
    },
]
```

## API Reference

<interface-documentation interfaceName='ITextCellEditorParams' names='["useFormatter","maxLength"]'></interface-documentation>

## Next Up

Continue to the next section: [Large Text Cell Editor](../provided-cell-editors-large-text/).