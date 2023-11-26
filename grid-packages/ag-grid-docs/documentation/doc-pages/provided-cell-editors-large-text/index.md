---
title: "Large Text Cell Editor"
---

Simple editor that uses the standard HTML `textarea`.

## Enabling Large Text Cell Editor

`agLargeTextCellEditor` allows users to enter text using a multi-line editor. Edit any cell in the grid below and note the `agLargeTextCellEditor` is displayed.

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

The `agLargeTextCellEditor` width and height can be customised. Edit any cell in the grid below and note the `agLargeTextCellEditor` is displayed with a modified size.

<grid-example title='Large Text Editor Cols and Rows' name='large-text-editor-cols-rows' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

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

To customise the size, there are two options:

- `cols`: The visible width of the text control, in average character widths.
- `rows`: The number of visible text lines for the control.

## API Reference

<interface-documentation interfaceName='ILargeTextEditorParams' names='["maxLength","rows","cols"]'></interface-documentation>


Continue to the next section: [Select Cell Editor](../provided-cell-editors-select/).