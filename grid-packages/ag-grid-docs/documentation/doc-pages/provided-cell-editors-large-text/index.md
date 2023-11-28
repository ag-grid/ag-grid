---
title: "Large Text Cell Editor"
---

Simple editor that uses the standard HTML `textarea`, allowing users to enter text shown over multiple lines.

## Enabling Large Text Cell Editor

Edit any cell in the grid below to see the Large Text Cell Editor.

<grid-example title='Large Text Editor' name='large-text-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

Enabled with `agLargeTextCellEditor` and configured with `ILargeTextEditorParams`.

```js
columnDefs: [
    {
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true,
        cellEditorParams: {
            maxLength: 100
        }
        // ...other props
    }
]
```

## Customisation

### Editor Size

The width and height of the Large Text Cell Editor can be customised. Edit any cell in the grid below to see the editor displayed with a modified size.

<grid-example title='Large Text Editor Cols and Rows' name='large-text-editor-cols-rows' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

To customise the size, there are two options:

- `cols`: The average number of characters displayed.
- `rows`: The number of lines of text displayed.

```js
columnDefs: [
    {
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true,
        cellEditorParams: {
            rows: 15,
            cols: 50
        }
        // ...other props
    }
]
```

## API Reference

<interface-documentation interfaceName='ILargeTextEditorParams' names='["maxLength","rows","cols"]'></interface-documentation>


Continue to the next section: [Select Cell Editor](../provided-cell-editors-select/).